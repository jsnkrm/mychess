# AGENTS.md - MyChess Developer Guide

Context for agentic coding agents in this repository.

## General

- Read framework docs before coding — docs are the source of truth, training data is outdated

## Project

Monorepo (npm workspaces): `frontend` + `backend1`
- Frontend: React 19 + Vite + TypeScript + TailwindCSS v4
- Backend: Node.js + Express + WebSocket + Prisma + PostgreSQL

## Commands

```bash
# Root
npm install

# Frontend (from frontend/ or root)
npm run dev          # http://localhost:5173
npm run build        # Type-check + build
npm run lint         # ESLint
npm run lint -- --fix # Fix lint issues

# Backend (from backend1/)
npm run dev          # Hot reload (port 8080)
npm run build        # TypeScript compile
npm run start        # Run compiled JS
```

## Code Style

- **TypeScript**: Explicit types for params/returns; interfaces for objects, types for unions
- **Imports**: External libs → Internal → Types → Constants
- **Naming**: files (kebab-case), components (PascalCase), hooks (useXxx), interfaces (PascalCase), constants (SCREAMING_SNAKE)
- **React**: Destructure props; use refs for current value in callbacks; early returns for conditionals
- **Error handling**: Try/catch with logging; never silently swallow
- **Tailwind**: Utility classes only, no custom CSS

## Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Run builds before committing: `cd frontend && npm run build` && `cd backend1 && npm run build`

## Key Files

| Path | Purpose |
|------|---------|
| `frontend/src/screens/Game.tsx` | Game logic, state |
| `frontend/src/components/Chessboard.tsx` | Board rendering |
| `frontend/src/hooks/useSocket.ts` | WebSocket hook |
| `backend1/src/index.ts` | Express + auth + WS |
| `backend1/src/Game.ts` | Server game logic |
| `backend1/src/GameManager.ts` | User matching |

## Env Vars

`DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `FRONTEND_URL`, `VITE_BACKEND_URL`, `VITE_WS_URL`