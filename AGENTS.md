# app-ns

## Cursor Cloud specific instructions

This is a **pnpm workspace monorepo** (workspaces: `apps/*`). The only app today is
`apps/ns-logistics` — a Next.js 16 + React 19 app whose core feature is **Discord
OAuth login gated to members of the Network School Discord guild**. There is no
database or other backing service.

### Services & commands (run from the repo root)

There is a single service: the `ns-logistics` Next.js dev server on port **3000**.
Standard commands are defined in the root `package.json` and proxy to the app via
`pnpm --filter ns-logistics`:

- Dev server: `pnpm dev` (http://localhost:3000)
- Lint: `pnpm lint`
- Build: `pnpm build`
- Prod start (after build): `pnpm start`
- Tests: none configured (no test framework/script exists).

### Required local env (`apps/ns-logistics/.env.local`)

The app reads env from `apps/ns-logistics/.env.local` (gitignored; see
`apps/ns-logistics/.env.example`). Create it before running:

- `AUTH_SECRET` — generate with `openssl rand -base64 32`.
- `AUTH_URL=http://localhost:3000`
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID` — **external
  secrets** for real Discord login. Not present by default in the cloud VM.

Without the Discord values the app still runs: the landing page renders and the
auth-gating flow works (visiting `/hello` unauthenticated redirects to
`/?error=SessionRequired`; `/?error=NotNSMember` shows the "Login failed" banner).
**Completing a real Discord OAuth login end-to-end requires the three `DISCORD_*`
secrets plus a redirect URI `http://localhost:3000/api/auth/callback/discord`
registered in the Discord Developer Portal.**

### Non-obvious notes

- `pnpm install` reports "Ignored build scripts: sharp, unrs-resolver". This is
  expected and harmless — dev, build, and lint all work without approving them.
  Do not run the interactive `pnpm approve-builds`.
- Next.js 16 emits a deprecation warning that the `middleware` file convention
  should become `proxy`. This is non-fatal; auth route protection lives in
  `apps/ns-logistics/src/middleware.ts`.
- Next.js 16 has breaking changes vs. older versions; see
  `apps/ns-logistics/AGENTS.md` and `node_modules/next/dist/docs/`.
