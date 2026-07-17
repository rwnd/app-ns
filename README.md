# app-ns

Monorepo for Network School apps.

## Apps

### `ns-logistics`

Coordinate shared trips to/from Network School (airport, Eco Botanica, Singapore, etc.).

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind · Auth.js (Discord)

**Auth:** Discord OAuth. Users must be a member of the Network School Discord server.

## Setup

```bash
pnpm install
cp apps/ns-logistics/.env.example apps/ns-logistics/.env.local
# fill in Discord credentials + DISCORD_GUILD_ID
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Discord app config

1. Create an app at [Discord Developer Portal](https://discord.com/developers/applications)
2. OAuth2 → Redirects → add `http://localhost:3000/api/auth/callback/discord`
3. Copy Client ID + Client Secret into `.env.local`
4. Enable Discord Developer Mode → right-click the NS server → **Copy Server ID** → set `DISCORD_GUILD_ID`

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start ns-logistics locally |
| `pnpm build` | Production build |
| `pnpm lint` | Lint |
