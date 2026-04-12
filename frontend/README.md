# Session Pipeline Defense Frontend

React + TypeScript + Phaser client application for Session Pipeline Defense.

## Run locally

```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

The Vite config proxies `/api/*` requests to `http://localhost:8080` during local development.

## Available scripts

- `npm run dev` — start dev server
- `npm run build` — type-check + production build
- `npm run lint` — ESLint checks
- `npm run preview` — preview production build locally

## Frontend structure

- `src/app` — router/providers/layout
- `src/pages` — route-level screens (menu, play, leaderboards, run summary, settings, run history)
- `src/widgets/phaser-game` — Phaser mounting widget
- `src/entities/pipeline` — primary gameplay scene
- `src/shared` — API client, shared hooks, styles, and types
