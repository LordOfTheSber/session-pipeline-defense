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
- ✅ Phase 8 complete: difficulty scaling, profile persistence, run history, optional leaderboard auto-refresh
- ✅ Phase 9 complete: UX clarity polish, stronger empty/error states, improved in-game/read-model communication
- ✅ **Phase 10 complete**: repository cleanup, documentation expansion, setup reproducibility, and final QA checklist
- ✅ **Phase 11 complete**: narrative foundation (Act I), ARIA voice canon, and DB-backed narrative progress APIs

## Core gameplay metaphor
- **Sessions** = temporary processing workers you deploy.
- **Data** = incoming hostile workload.
- **Credits** = finite compute budget for deployments.
- **Lanes** = pipeline channels under pressure.
- **Loss** = overload/SLA breach when data crosses boundary.
- **Score** = throughput + survivability performance.

## Tech stack
- **Backend:** Java 21, Spring Boot 3, Spring Web/Validation/JPA, Flyway, PostgreSQL driver
- **Frontend:** Vite, React + TypeScript, Phaser 3, React Router
- **Database:** PostgreSQL 16 (Docker Compose)

## Repository layout
```text
.
├── AGENTS.md
├── backend/               # Spring Boot API + Flyway migrations
├── frontend/              # React/Phaser client
├── docker-compose.yml     # local PostgreSQL service
└── .env.example           # local environment defaults
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

Backend base URL: `http://localhost:8080`

### 3) Run frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

> The Vite dev server proxies `/api/*` to `http://localhost:8080`.

## Configuration
Default local values are documented in [`.env.example`](./.env.example).

Important variables:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`
- `SERVER_PORT`

## Architecture summary

### Backend layers
- `controller/` — REST APIs and request validation boundaries.
- `service/` — run ingestion, scoring sanity checks, leaderboard and challenge orchestration.
- `repository/` — Spring Data JPA repositories.
- `domain/entity/` — persistence entities for runs, profiles, challenges.
- `dto/` — explicit API contract objects.

### Frontend layers
- `src/pages` — route-level UX (menu, play, leaderboards, run summary, settings, run history).
- `src/widgets/phaser-game` — Phaser mount widget for React integration.
- `src/entities/pipeline` — gameplay scene implementation.
- `src/shared/api` + `src/shared/types` — typed API client and contracts.

## API overview

### Health
- `GET /api/health`

### Challenges
- `GET /api/challenges/daily`

### Runs
- `POST /api/runs` — submit a completed run summary.
- `GET /api/runs/{id}` — fetch run detail for summary view.

### Leaderboards
- `GET /api/leaderboards/global?difficulty=&limit=`
- `GET /api/leaderboards/daily?date=&difficulty=&limit=`

### Players
- `POST /api/players/profile` — create/update nickname + preferred difficulty.
- `GET /api/players/{nickname}` — fetch profile by nickname.
- `GET /api/players/{nickname}/runs?limit=` — recent run history.

### Narrative
- `GET /api/narrative/state?nickname=` — fetch viewed narrative beats for a nickname.
- `POST /api/narrative/seen` — idempotently mark a narrative beat as seen.

## Gameplay modes and replayability
- **Endless mode** with increasing pressure/waves.
- **Daily challenge mode** seeded by backend for deterministic daily competition.
- **Difficulty presets** that affect challenge pressure and score outcomes.
- **Persistent leaderboards** (global + daily) backed by PostgreSQL.
- **Run history** tied to nickname/profile for repeat play analysis.

## Validation and persistence model
- Frontend remains gameplay-authoritative for real-time feel.
- Backend validates run summary plausibility (range/enums/challenge consistency).
- Persisted run records power leaderboard and profile-history queries.
- Narrative beat progression is persisted server-side per nickname to avoid repeating onboarding beats.

## Narrative foundation (Phase 11)
- Typed narrative models and Act I story beats live in `frontend/src/narrative`.
- ARIA Act I script includes 30 trigger-based lines for onboarding, first corruption, and first failure flows.
- Lore glossary is centralized in `frontend/src/narrative/codex.ts` for wording consistency across UI.
- ARIA voice style canon is documented in [`docs/voice.md`](./docs/voice.md).

## Test and check commands

Backend:
```bash
cd backend
./mvnw test
```

Frontend:
```bash
cd frontend
npm run lint
npm run build
```

## Manual playtest checklist (Phase 10)
- [x] Open app and start run from main menu.
- [x] Deploy sessions into lanes; confirm credits are consumed.
- [x] Observe data advancing and being processed in-lane.
- [x] Confirm sessions expire by TTL/capacity and require redeployment.
- [x] Trigger loss/overload state and inspect run summary.
- [x] Submit run and confirm persistence-backed leaderboard visibility.
- [x] Switch to daily mode and verify challenge seed-based deterministic mode tagging.
- [x] Save nickname/preferred difficulty and verify run history retrieval.

## Final verification checklist
- [x] Backend runs locally and serves required APIs.
- [x] Frontend runs locally and launches gameplay.
- [x] PostgreSQL starts via Docker Compose and Flyway migration applies.
- [x] Session TTL/capacity lifecycle is visible in gameplay.
- [x] Loss state and run summary flow are clear.
- [x] Run submission is validated/persisted.
- [x] Global leaderboard displays persisted runs.
- [x] Daily challenge seed comes from backend and tags daily runs.
- [x] Difficulty scaling impacts gameplay/score dynamics.
- [x] README includes setup, architecture, API overview, and playtest guidance.
