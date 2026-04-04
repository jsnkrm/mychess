import "dotenv/config";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const prisma = new PrismaClient({ adapter });

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Passport Config
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          },
          create: {
            googleId: profile.id,
            email: profile.emails?.[0].value!,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          },
        });
        return done(null, user);
      } catch (error) {
        return done(error as any, undefined);
      }
    },
  ),
);

// Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.SESSION_SECRET!,
      { expiresIn: "1d" },
    );
    res.redirect(`${FRONTEND_URL}/?token=${token}`);
  },
);

// WebSocket / Game
const gameManager = new GameManager();

wss.on("connection", function connection(ws, req) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    ws.close(4001, "Missing token");
    return;
  }

  try {
    const user = jwt.verify(token, process.env.SESSION_SECRET!) as {
      id: string;
      email: string;
      name: string;
    };
    gameManager.addUser(ws, user);
  } catch {
    ws.close(4002, "Invalid token");
    return;
  }

  ws.on("close", () => gameManager.removeUser(ws));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Auth URL: ${BACKEND_URL}/auth/google`);
  console.log(`Health check: ${BACKEND_URL}/health`);
});
