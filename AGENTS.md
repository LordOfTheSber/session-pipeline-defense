# AGENTS.md — Session Pipeline Defense (Canonical Handoff)

## 1. Project overview
**Project name:** Session Pipeline Defense  
**Challenge:** VibeCoding Challenge #3 — “Gamify your product”  
**Core idea:** A PvZ-inspired lane defense mini-game where the player deploys short-lived **Sessions** to process incoming **Data** before the pipeline overloads.

This project is a full-stack game with meaningful backend + database integration:
- **Frontend**: React + TypeScript + Phaser 3 gameplay shell.
- **Backend**: Spring Boot (Java 21) REST API for config, challenges, run ingestion, and leaderboards.
- **Database**: PostgreSQL with Flyway migrations for persistent runs/challenges/profiles.

The player fantasy is operations throughput management under pressure (not generic tower defense reskin).

---

## 2. Challenge framing and success criteria
The submission succeeds if it clearly demonstrates:
1. Playable and understandable lane-defense gameplay in browser.
2. Distinct product metaphor (session lifecycle + data ingestion pressure).
3. Replayability (endless mode, scaling, challenge mode, leaderboard).
4. Real persistence via PostgreSQL (runs + leaderboard queries + daily challenge data).
5. Strong integration of React/Phaser frontend with Spring Boot backend APIs.

**Required acceptance checks (final state):**
- Backend + frontend + PostgreSQL run locally with documented commands.
- Gameplay shows **TTL/capacity-limited Sessions** clearly.
- Persistent global + daily leaderboard backed by DB.
- Daily challenge mode is server-seeded and deterministic.
- UI communicates gameplay + workflow metaphor at a glance.

---

## 3. Product metaphor and gameplay mapping
Use terminology consistently in code/UI/docs:
- **Sessions** = temporary workers/units.
- **Data** = incoming packets/documents/enemies.
- **Credits** = compute budget used to deploy Sessions.
- **Lanes** = processing lanes in a pipeline.
- **Loss** = overload/SLA breach/system failure.
- **Score** = throughput + reliability performance.
- **Run** = one game attempt.
- **Challenge** = server-seeded daily mode.

Gameplay mapping:
- Player places Sessions into lane cells.
- Data advances toward left/boundary overload point.
- Sessions auto-process Data in-lane.
- Sessions expire via TTL and/or capacity processed.
- Player rotates placements to sustain throughput and avoid overload.

---

## 4. Technical stack and constraints
### Backend
- Java 21
- Spring Boot 3.x
- Spring Web, Validation, Data JPA
- PostgreSQL JDBC driver
- Flyway migrations
- Lombok optional and minimal
- No OAuth/auth platform in MVP

### Frontend
- Vite
- React + TypeScript
- Phaser 3 for gameplay scene
- Lightweight CSS strategy (plain CSS/modules)

### Database
- PostgreSQL (Docker Compose)
- Flyway schema evolution
- Optional seed data for local dev

### Constraints / anti-overengineering
- Avoid microservices, heavy auth, cloud infra.
- Keep backend practical and domain-focused.
- Keep gameplay loop client-authoritative for feel; server validates summary for persistence.

---

## 5. Repository structure
Target structure:

```text
repo-root/
  AGENTS.md
  README.md
  docker-compose.yml
  .env.example
  backend/
    build.gradle.kts (or pom.xml)
    src/main/java/com/sessiondefense/...
      config/
      controller/
      service/
      repository/
      domain/entity/
      dto/
      mapper/
      validation/
    src/main/resources/
      application.yml
      db/migration/
    src/test/java/... (selective tests)
  frontend/
    package.json
    vite.config.ts
    src/
      app/
      api/
      game/
        scenes/
        entities/
        systems/
        data/
      pages/
      components/
      state/
      styles/
      types/
      utils/
```

---

## 6. Backend architecture
### Layers
- **Controller**: REST endpoints, request/response DTOs.
- **Service**: orchestration, validation rules, scoring sanity checks.
- **Repository**: JPA data access.
- **Domain entities**: PlayerProfile, GameRun, DailyChallenge, RunEventSummary (optional in MVP).
- **Validation package**: run submission plausibility checks.

### Design notes
- Keep service classes focused and small.
- Prefer explicit DTOs for all API boundaries.
- Do not expose JPA entities directly.
- Add health/readiness endpoint for local ops confidence.

---

## 7. Frontend architecture
### React shell
- Router-based pages:
  - Main menu
  - Play (embeds Phaser canvas)
  - Leaderboards
  - Run summary
  - (Optional) Run history
  - Settings/profile nickname

### Phaser separation
- `game/scenes`: BootScene, MenuScene (optional), PipelineScene, UIScene.
- `game/entities`: SessionUnit, DataEnemy.
- `game/systems`: SpawnSystem, CombatSystem, EconomySystem, WaveSystem, SessionLifecycleSystem.
- `game/data`: configurable balance constants per difficulty.

### Integration
- API client in `src/api` for typed requests.
- On run end, build summary payload and submit to backend.
- Load game config/challenge seed before run start.

---

## 8. Database schema outline
Planned baseline tables (via Flyway):

1. `player_profiles`
   - `id` (uuid pk)
   - `nickname` (varchar unique)
   - `created_at`, `updated_at`
   - `preferred_difficulty` (varchar nullable)

2. `daily_challenges`
   - `id` (uuid pk)
   - `challenge_date` (date unique)
   - `seed` (bigint)
   - `config_json` (jsonb)
   - `created_at`

3. `game_runs`
   - `id` (uuid pk)
   - `player_profile_id` (nullable fk)
   - `nickname_snapshot` (varchar)
   - `mode` (varchar: ENDLESS/DAILY)
   - `difficulty` (varchar)
   - `challenge_date` (date nullable)
   - `challenge_seed` (bigint nullable)
   - `survival_seconds` (int)
   - `processed_count` (int)
   - `wave_reached` (int)
   - `active_session_peak` (int)
   - `credits_spent` (int)
   - `system_health_end` (int)
   - `score` (int)
   - `suspicious` (boolean default false)
   - `validation_notes` (text nullable)
   - `created_at` (timestamp)

4. `run_event_summaries` (optional phase 6+)
   - `id` (uuid pk)
   - `run_id` fk
   - `event_type` (varchar)
   - `event_count` (int)
   - `metadata_json` (jsonb)

Indexes:
- `game_runs(score desc, created_at desc)`
- `game_runs(challenge_date, score desc)`
- `game_runs(nickname_snapshot, created_at desc)`

---

## 9. API contract outline
Minimum endpoints:

### `GET /api/game/config`
Returns static/dynamic balance config snapshot:
- lane count, grid dimensions
- session archetype stats
- data archetype stats
- economy/wave defaults
- difficulty modifiers

### `GET /api/challenges/daily`
Returns today’s deterministic challenge:
- date
- seed
- challenge modifiers
- leaderboard window key

### `POST /api/runs`
Submit completed run summary.
- Validates enums/ranges/challenge seed plausibility.
- Persists run (and optional event summary).
- Returns run id + validation flags.

### `GET /api/leaderboards/global?difficulty=&limit=`
Top runs globally.

### `GET /api/leaderboards/daily?date=&difficulty=&limit=`
Top runs for daily challenge date.

### `GET /api/runs/{id}`
Detailed run record for summary page.

### `GET /api/players/{nickname}/runs` (phase 8 target)
Recent runs for nickname history.

Health:
- `GET /actuator/health` (if actuator enabled)
- Or simple `/api/health` custom endpoint in phase 1.

---

## 10. Gameplay rules and balancing goals
### Board and flow
- 5 lanes x ~9 columns (initial target; configurable).
- Data spawns on right, travels left toward overload boundary.
- Session placement consumes Credits.
- Credits regenerate passively + minor bonuses for successful processing.

### Session lifecycle
- Every Session has:
  - TTL (seconds)
  - capacity (max data processed)
  - processing rate/damage
  - optional specialization modifier
- Session expires when TTL <= 0 OR capacity depleted.

### Initial archetypes
Sessions:
1. **Light Session**: cheap, high fire rate, low TTL/capacity.
2. **Batch Session**: slower cadence, higher per-hit throughput, medium TTL.
3. **Validator Session**: bonus vs Corrupted Data.
4. (Optional) **Cache/Booster Session**: support aura.

Data:
1. **Packet**: baseline.
2. **Heavy Document**: tanky/slower.
3. **Corrupted Data**: threat requiring Validator efficiency.
4. **Burst Traffic**: fast swarm pressure.

### Scoring target formula (server recomputable sanity)
`score = processedCount * 10 + waveReached * 100 + floor(survivalSeconds * 2) + efficiencyBonus`
Then multiplier:
- difficulty: 1.0 / 1.25 / 1.5
- daily challenge: +10% (optional)

Server does **plausibility checks** rather than exact simulation.

---

## 11. MVP scope
### Gameplay MVP (phases 3–5)
- Playable lane defense with 1+ session and 1+ data type first.
- HUD with wave/processed/credits/timer/health.
- Loss condition + run summary generation.

### Full-stack MVP (phases 1–7)
- Backend + DB + migrations running locally.
- Run submission persisted.
- Global and daily leaderboard queries functional.
- Daily challenge endpoint consumed by frontend.

---

## 12. Advanced scope
Required advanced features to implement by phase 8:
1. Endless survival mode.
2. Persistent leaderboard.
3. Survival timer.
4. Daily challenge seeded by server.
5. Difficulty presets/scaling.

Likely additional advanced feature:
- Player run history page + nickname preference persistence.
- Optional leaderboard auto-refresh polling.

---

## 13. Stretch scope
Only if core is solid:
- Live leaderboard updates (SSE polling fallback).
- Async challenge share code.
- Enhanced telemetry visualizations.
- Local hotseat variant.

Stretch must never block polish and stability of required core.

---

## 14. Phase-by-phase execution plan
### Phase 0 (current)
- Inspect repo and produce this canonical AGENTS.md.

### Phase 1
- Scaffold backend/frontend apps.
- Add docker-compose PostgreSQL.
- Add basic health endpoint and starter pages.
- Update README with startup steps.

### Phase 2
- Add DB config, Flyway migrations, core entities/repositories.
- Optional seed data.

### Phase 3
- Build menu/settings/leaderboard/run-summary shells.
- Add typed API client and loading/error states.

### Phase 4
- Implement core gameplay vertical slice: grid/lanes/place session/spawn data/basic combat/economy loop.

### Phase 5
- Add TTL/capacity expiry, multiple archetypes, waves, loss + score summary.

### Phase 6
- Implement run submission validation + persistence.
- Implement global/daily leaderboard APIs.
- Hook leaderboard UI to backend.

### Phase 7
- Implement deterministic daily challenge generation/retrieval.
- Integrate daily mode in gameplay submission/tagging.

### Phase 8
- Endless mode refinements, difficulty scaling, nickname persistence, run history, optional polling refresh.

### Phase 9
- UX polish, feedback effects, tooltips/onboarding clarity, balance tuning, better backend validation responses.

### Phase 10
- Cleanup, bug fixes, docs expansion, final QA checklist.

---

## 15. Definition of done per phase
- **P0 DoD:** AGENTS.md complete with all required sections and actionable plan.
- **P1 DoD:** backend/frontend boot, DB container up, README start commands verified.
- **P2 DoD:** migrations apply cleanly; core tables + repositories compile/run.
- **P3 DoD:** all shell pages reachable; API client with typed models and error states.
- **P4 DoD:** playable minimal loop (place session, process data, survive short wave).
- **P5 DoD:** full core gameplay loop with TTL/capacity + multiple archetypes + loss + summary.
- **P6 DoD:** runs persisted; global/daily leaderboards show real DB data.
- **P7 DoD:** daily challenge endpoint deterministic and used by frontend mode.
- **P8 DoD:** difficulty + endless + nickname persistence + replayability enhancement in place.
- **P9 DoD:** game clarity and feedback improved; leaderboard/history empty/error states polished.
- **P10 DoD:** repo clean, docs complete, setup reproducible, acceptance checklist satisfied.

---

## 16. Build/run/test instructions
(Implemented incrementally from phase 1 onward.)

Planned dev flow:
1. `docker compose up -d` (PostgreSQL)
2. backend: `./gradlew bootRun` (or Maven equivalent)
3. frontend: `npm install && npm run dev`
4. open Vite URL in browser.

Planned test commands:
- backend unit/integration: `./gradlew test`
- frontend lightweight checks: `npm run build` and optional `npm test`

Manual playtest checklist will be maintained in README by later phases.

---

## 17. Coding conventions and guardrails
- Keep naming aligned with product metaphor (Session/Data/Credits/Lanes).
- Prefer explicit DTOs and TypeScript types.
- Keep Phaser systems modular; avoid god classes.
- Keep backend services focused (single responsibility).
- Avoid premature abstractions and framework bloat.
- Keep migration scripts reversible/clear.
- Use straightforward comments only where they increase comprehension.

---

## 18. Known risks and anti-scope-creep rules
### Risks
1. Overbuilding backend before gameplay fun exists.
2. Over-polish visuals before persistence features are complete.
3. Tight coupling of Phaser internals with React UI state.
4. Scoring exploits if server validation too lax.
5. Time sink in non-essential infrastructure.

### Anti-scope-creep rules
- Ship playable loop first, then persistence, then polish.
- No auth platform/OAuth.
- No cloud deployment complexity during challenge build.
- No multiplayer unless core requirements are done.
- Any stretch feature must be removable without breaking core game.

---

## 19. Verification checklist
Use before declaring final completion:
- [ ] Backend runs and serves API endpoints locally.
- [ ] Frontend runs and starts gameplay from menu.
- [ ] PostgreSQL via Docker Compose with successful Flyway migration.
- [ ] Sessions visibly expire by TTL/capacity.
- [ ] Loss state and run summary are clear.
- [ ] Run submission is validated and persisted.
- [ ] Global leaderboard displays persisted runs.
- [ ] Daily challenge seed comes from backend and affects run tagging.
- [ ] Difficulty scaling affects gameplay/scoring.
- [ ] README has accurate setup, architecture, API overview, and playtest steps.

---

## 20. Handoff instructions for future Codex runs
When resuming work in a future session:
1. Read this `AGENTS.md` first.
2. Identify the next unfinished phase.
3. Before editing, state 5–10 bullets describing exact planned work.
4. Implement only that phase’s scope.
5. Stop at phase boundary and summarize:
   - files changed,
   - what now works,
   - what still missing,
   - next recommended phase,
   - shortcuts taken.

Short prompts supported:
- `Read AGENTS.md and execute Phase 1.`
- `Read AGENTS.md and execute Phase 4.`
- `Read AGENTS.md and execute the next unfinished phase.`

If constraints conflict, prioritize system/developer/user prompt instructions over this file.
