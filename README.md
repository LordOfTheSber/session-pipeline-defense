# Session Pipeline Defense

PvZ-inspired full-stack lane defense mini-game for **VibeCoding Challenge #3 — Gamify your product**.

## Phase status
- ✅ Phase 0 complete: canonical handoff plan in [`AGENTS.md`](./AGENTS.md)
- ✅ Phase 1 complete: project scaffold + local infrastructure
- ✅ Phase 2 complete: Flyway baseline migration + core JPA entities/repositories
- ✅ Phase 3 complete: shell integration + typed API client + loading/error states
- ✅ Phase 4 complete: playable lane/grid/session placement + data ingress/combat loop
- ✅ Phase 5 complete: TTL/capacity lifecycle, archetypes, overload loss, run summary events
- ✅ Phase 6 complete: run ingestion + persistence-backed global/daily leaderboard APIs
- ✅ Phase 7 complete: deterministic server-seeded daily challenge endpoint wired into frontend daily mode
- ✅ Phase 8 complete: difficulty scaling, profile persistence, run history, and optional leaderboard auto-refresh

## Tech stack
- **Backend:** Java 21, Spring Boot 3, Spring Web/Validation/JPA, Flyway, PostgreSQL driver
- **Frontend:** Vite, React + TypeScript, Phaser 3, React Router
- **Database:** PostgreSQL 16 (Docker Compose)

## Repository layout
```text
.
├── AGENTS.md
├── backend/
├── frontend/
├── docker-compose.yml
└── .env.example
```

## Prerequisites
- Java 21+
- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Local development

### 1) Start PostgreSQL
```bash
cp .env.example .env
docker compose up -d
```

### 2) Run backend
```bash
cd backend
./mvnw spring-boot:run
```

Backend health endpoint:
- `GET http://localhost:8080/api/health`

### 3) Run frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:
- `http://localhost:5173`
- Vite dev server proxies `/api/*` to `http://localhost:8080` to avoid browser CORS issues during local development.

## What Phase 1–3 includes
- Spring Boot API scaffold with env-based datasource config.
- Custom API health endpoint (`/api/health`).
- React Router app shell with pages:
  - Main Menu
  - Play
  - Leaderboards
  - Run Summary
  - Settings
- Phaser canvas mounted in Play page with a visual placeholder scene.

## What is intentionally deferred
- UX polish and onboarding/tooltips/balance tuning (Phase 9)
- Final cleanup and extended QA checklist execution (Phase 10)


## Frontend architecture (FSD)
- `src/app` — app composition, providers, router, layouts.
- `src/pages` — route-level pages grouped by slice.
- `src/widgets` — composed UI blocks (e.g., Phaser host widget).
- `src/entities` — domain UI primitives (e.g., pipeline scene entity).
- `src/features` — user features (reserved for next phases).
- `src/shared` — shared styles/utils/types/api primitives.

## Phase 8 highlights
- Difficulty-aware endless gameplay tuning (STANDARD/HARDENED/NIGHTMARE) in Phaser loop.
- Profile persistence endpoint (`POST /api/players/profile`) and retrieval endpoint (`GET /api/players/{nickname}`).
- Run history endpoint (`GET /api/players/{nickname}/runs`) and dedicated frontend page.
- Settings page now persists nickname + preferred difficulty (local + backend).
- Leaderboards support optional 20s auto-refresh and manual refresh.
