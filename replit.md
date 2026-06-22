# Domestic Cattle AI

A bilingual (Arabic + English) AI platform for identifying cattle breeds from photos, built for livestock professionals.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `PREDICT_PORT=5000 python3 artifacts/cattle-predict/server.py` — run Flask prediction microservice
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `python3 scripts/src/train.py <dataset.zip>` — retrain model from a zip of breed folders
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, shadcn/ui
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- AI: Python Flask microservice (port 5000) + TensorFlow EfficientNetB0
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: Replit Auth (OIDC/PKCE via `@workspace/replit-auth-web`)

## Where things live

- `artifacts/cattle-ai/` — React+Vite frontend (dark cyber-tech theme, RTL Arabic support)
- `artifacts/api-server/` — Express API, routes at `/api/analyses`, `/api/auth`
- `artifacts/cattle-predict/` — Flask prediction microservice + model files
  - `server.py` — Flask server (POST /predict, GET /health)
  - `cattle_model.h5` — active TF model (9 breeds, EfficientNetB0)
  - `labels.json` — breed list (alphabetical): Angus, Ayrshire, Brown Swiss, Hereford, Holstein-Friesian, Jaffarabadi, Jersey, Red Dane, Simmental
- `scripts/src/train.py` — EfficientNetB0 transfer-learning training script
- `lib/db/` — Drizzle schema (analyses, users tables)
- `lib/api-spec/` — OpenAPI spec → generates Zod schemas + React Query hooks

## Architecture decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec/openapi.yaml` drives all generated types — never edit generated files manually.
- **Two-service design**: Node.js API handles auth/DB; Python Flask handles TF inference. API calls predict service via `http://localhost:5000/predict`.
- **Confidence format**: predict service returns confidence as 0–1 fraction (not percentage); frontend multiplies by 100 for display.
- **Training labels**: `labels.json` is written by `train.py` during training (alphabetical sort of breed folders). Must match model output order exactly.
- **Replit Auth**: uses `useAuth()` from `@workspace/replit-auth-web` directly — no AuthProvider wrapper needed.

## Product

- Upload a photo or use camera → AI identifies cattle breed with confidence scores
- Dashboard with analysis stats, breed distribution chart, recent history
- Full Arabic/English bilingual UI with RTL support
- PDF export of analysis results
- Login required to save analyses (Replit Auth)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Predict server must be running** before the API server can process analysis requests — restart `artifacts/cattle-predict: Predict Server` workflow if analyses return 500.
- **After retraining**: restart the Predict Server workflow so it loads the new `cattle_model.h5`.
- **Training time**: ~8–12 min on CPU for the current dataset (814 images, 9 breeds, 25 epochs total).
- **Do NOT run `pnpm dev` at workspace root** — use per-artifact workflow commands only.
- The `Training: CattleAI` workflow saves `best_model.h5` + `cattle_model.h5` to `artifacts/cattle-predict/` and writes `labels.json`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
