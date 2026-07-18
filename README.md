# app-ns

Monorepo for Network School apps.

## Apps

### `ns-logistics`

Ride board for shared trips to/from Network School (airport, Singapore, JB, Eco Botanica).

**Product (from Discord coordination research):** list-first posts — not event RSVPs. Few clicks to **Post trip** or tap **I'm in**. Posts can be an **offer** (seats) or **request** (looking for a ride), with **exact** or **flexible** time. Status: open → confirmed / full / cancelled. No trip detail pages; Discord carries join/confirm notifications.

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

- Login: `/`
- App (auth required): `/home`
- Design preview (no auth): `/preview`

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
