# Team Roster Management

A full-stack JavaScript application for managing teams and rosters, with a React frontend and an Express + MongoDB backend.

**Live site:** https://team-roster-management.vercel.app

---

## Tech Stack

### Frontend
- React (client app in `client/`)

### Backend
- Node.js + Express (`server/server.js`)
- MongoDB (via Mongoose)
- JWT-based auth (uses `JWT_SECRET`)

### Deployment
- Vercel (builds the React app from `client/` and serves `client/build`)

---

## Monorepo Structure

- `client/` — React UI
- `server/` — Express API (routes under `server/routes/`, models under `server/models/`)
- `Vercel.json` — Vercel build/output configuration

---

## API Overview

The backend mounts these route groups:

- `/api/auth` — authentication routes
- `/api/user` — user-related routes
- `/api/team` — team management routes
- `/api/project` — project routes
- `/api/roster` — roster routes
- `/api/story` — story routes
- `/api/home` — home/dashboard routes

A basic health endpoint is available at:
- `GET /` → `{ "message": "ICSI 418Y HW4 API is running" }`

---

## Local Development

### Prerequisites
- Node.js (LTS recommended)
- A MongoDB instance (local or cloud)

### 1) Install dependencies
From the repository root:
```bash
npm install
```

Then install the client dependencies:
```bash
cd client
npm install
```

### 2) Configure environment variables (server)
Create a `.env` file for the server runtime (typically in the project root when running `server/server.js`, or wherever your process loads env vars from) with at least:

```bash
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
ALLOWED_ORIGINS="http://localhost:3000"
PORT=5000
```

Notes:
- `ALLOWED_ORIGINS` is a comma-separated list of allowed origins. If not set, the server defaults to `http://localhost:3000`.
- The server will exit if it cannot connect to MongoDB.

### 3) Run the backend
In one terminal (from repo root):
```bash
node server/server.js
```

### 4) Run the frontend
In another terminal:
```bash
cd client
npm start
```

---

## Deployment (Vercel)

This repo includes a `Vercel.json` configured to:
- run the build in `client/`
- output static files from `client/build`
- rewrite all routes to `/index.html` (SPA routing)

---

## Security / Configuration Notes
- Do **not** commit secrets (Mongo URI, JWT secret) to the repository.
- CORS is enforced via `ALLOWED_ORIGINS`.

---

## License
No license is currently specified in this repository. If you intend others to use or contribute, consider adding a LICENSE file.
