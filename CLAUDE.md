# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General

- Read framework docs before coding — docs are the source of truth, training data is outdated
- **chess.js**: Read the full README at https://www.npmjs.com/package/chess.js at the start of every session to understand full capabilities

## Project

Monorepo (npm workspaces): `frontend` + `backend1`
- Frontend: React 19 + Vite + TypeScript + TailwindCSS v4 + react-router-dom v7
- Backend: Node.js (>=20) + Express + `ws` WebSocket + Prisma v7 (`@prisma/adapter-pg`) + PostgreSQL

## Commands

```bash
# Root
npm install

# Frontend (from frontend/ or root)
npm run dev          # http://localhost:5173
npm run build        # Type-check + build (tsc -b && vite build)
npm run lint         # ESLint
npm run lint -- --fix

# Backend (from backend1/)
npm run dev          # ts-node-dev hot reload (port 8080)
npm run build        # tsc
npm run start        # node dist/index.js
# postinstall runs `prisma generate`
```

No test runner configured in either workspace.

Before committing, run builds: `cd frontend && npm run build && cd ../backend1 && npm run build`.

## Architecture

### Real-time game flow

Gameplay is driven entirely by WebSocket messages — **not** REST. The message type constants live in `backend1/src/messages.ts` (`INIT_GAME`, `MOVE`, `GAME_OVER`, `USER_INFO`, `RESIGN`) and must be kept in sync with the frontend's `useSocket` hook and `Game` screen.

- `backend1/src/index.ts` — Express app + single `WebSocketServer` mounted at `/ws` on the same HTTP server. Handles Google OAuth, issues JWTs (signed with `SESSION_SECRET`), and on each WS connection resolves the `?token=` query param into either an authed user (JWT verify) or a generated `Guest_XXXXXX` identity. Sends a `USER_INFO` frame immediately after connect.
- `backend1/src/GameManager.ts` — Holds `users: Map<WebSocket, User>`, an array of active `Game`s, and a single `pendingUser` slot. Matchmaking is trivial: first `INIT_GAME` fills `pendingUser`, the next pairs them into a new `Game`. All message routing to the right `Game` is done by linear scan (`games.find(g => g.hasPlayer(socket))`).
- `backend1/src/Game.ts` — Owns a `chess.js` `Chess` instance per game. **Turn enforcement uses an internal `moveNumber` counter** (odd = white = player1, even = black = player2), separate from chess.js's own turn state — be careful to keep them consistent. Terminal states are resolved in `checkAndHandleGameOver` (checkmate / stalemate / draw / resign). Note: the outgoing game-over frame uses the string `"GAME_OVER"` directly, not the `GAME_OVER` constant from `messages.ts`.

### Frontend structure

- `frontend/src/screens/Game.tsx` — Game state machine (waiting → playing → over), holds the `chess.js` instance on the client for local validation/rendering, and dispatches WS messages.
- `frontend/src/hooks/useSocket.ts` — Single WebSocket connection hook. Has explicit duplicate-connection prevention (see commit `e792667`) — do not introduce a second `new WebSocket` path.
- `frontend/src/components/Chessboard.tsx` — Board rendering and move input.
- Supporting UI: `GameInfo`, `GameInProgress`, `GameOverOverlay`, `ReadyToPlay`, `ResignModal`, `Header`, `Confetti`.
- `frontend/src/screens/Login.tsx` — Google OAuth entry. Lazy imports are intentionally kept simple (see commit `9c0906e`); do not re-introduce deeply nested dynamic imports in this flow.

### Auth model

1. Frontend sends user to `${BACKEND_URL}/auth/google`.
2. Backend callback upserts a `User` row via Prisma, signs a JWT `{id, email, name}` with `SESSION_SECRET` (1d expiry), and redirects to `${FRONTEND_URL}/?token=...`.
3. Frontend stores the token and passes it as `?token=` when opening the WS.
4. WS handler treats `token.startsWith("guest_")` as guest, a valid JWT as authed, and anything else as a freshly-generated guest — guests never touch the database.

The Prisma schema (`backend1/prisma/schema.prisma`) currently contains only the `User` model; games are in-memory only and lost on restart.

## Code Style

- **TypeScript**: Explicit types for params/returns; interfaces for objects, types for unions
- **Imports**: External libs → Internal → Types → Constants
- **Naming**: files (kebab-case), components (PascalCase), hooks (useXxx), interfaces (PascalCase), constants (SCREAMING_SNAKE)
- **React**: Destructure props; use refs for current value in callbacks; early returns for conditionals
- **Error handling**: Try/catch with logging; never silently swallow
- **Tailwind**: Utility classes only, no custom CSS

## Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`

## Env Vars

Backend: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, `PORT`
Frontend: `VITE_BACKEND_URL`, `VITE_WS_URL`
