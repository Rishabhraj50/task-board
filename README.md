# Team Task Board
Next.js (App Router, TS) frontend + separate Express/Mongoose API. Schema diagram: `docs/schema.md`.

## Run
```
# backend
cd backend && cp .env.example .env && npm i && npm run seed && npm run dev   # needs MongoDB running
# frontend
cd frontend && cp .env.example .env.local && npm i && npm run dev            # http://localhost:3000
```
**Env (backend):** PORT, MONGO_URI, JWT_SECRET, CLIENT_URL. **Env (frontend):** NEXT_PUBLIC_API_URL.
**Sample logins (after `npm run seed`):** demo1@example.com / demo2@example.com, password `password123`.

## API (all but /auth need `Authorization: Bearer <jwt>`)
POST /api/auth/signup, /login · GET/POST /api/boards · GET/PATCH/DELETE /api/boards/:id · POST /boards/:id/invite
GET /boards/:id/stats (aggregation) · POST /boards/:id/columns · PATCH/DELETE /boards/:id/columns/:colId
GET /boards/:id/tasks?assignee=&priority=&label=&overdue=true&q= · POST /boards/:id/tasks · PATCH/DELETE /boards/:id/tasks/:taskId
PATCH /boards/:id/tasks/:taskId/move `{columnId, beforeId}`

## Notes
JWT is kept in localStorage (simple, but XSS-readable; httpOnly cookie is the safer alternative).
Order persists via an integer `position` per column, renumbered server-side on every move.
