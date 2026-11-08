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


