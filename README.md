# Session Pipeline Defense

PvZ-inspired full-stack lane defense mini-game for **VibeCoding Challenge #3 — Gamify your product**.

## Phase status
- ✅ Phase 0 complete: canonical handoff plan in [`AGENTS.md`](./AGENTS.md)
- ✅ Phase 1 complete: project scaffold + local infrastructure
- ✅ Phase 2 complete: Flyway baseline migration + core JPA entities/repositories
- 🔜 Next: Phase 3 (shell integration + typed API client)

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

## What Phase 1–2 includes
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
- Flyway SQL baseline migration for `player_profiles`, `daily_challenges`, and `game_runs`
- Core JPA entities + Spring Data repositories for persistence foundation
- Real leaderboard and run APIs (Phase 6)
- Daily challenge API integration (Phase 7)
- Full lane-defense gameplay loop (Phase 4+)


## Frontend architecture (FSD)
- `src/app` — app composition, providers, router, layouts.
- `src/pages` — route-level pages grouped by slice.
- `src/widgets` — composed UI blocks (e.g., Phaser host widget).
- `src/entities` — domain UI primitives (e.g., pipeline scene entity).
- `src/features` — user features (reserved for next phases).
- `src/shared` — shared styles/utils/types/api primitives.
