# NS Logistics

Ride board for Network School trips (airport, Singapore, JB, Eco Botanica).

## Product

- **Trips** (`/home`) — from → to, when, transport (car / bus / both), optional seats
- **Stats** (`/stats`) — corridor and place volume
- One trip type (no offer vs request). Join with **I'm in**
- Discord is **opt-in**; thread links are **mock-only** until a bot is wired

## Routes

| Path | Notes |
| --- | --- |
| `/` | Discord login |
| `/home` | Trips board (auth) |
| `/stats` | Stats (auth) |
| `/preview`, `/preview/stats` | Unauth design preview |

## Setup

From the monorepo root:

```bash
pnpm install
cp apps/ns-logistics/.env.example apps/ns-logistics/.env.local
# fill Discord credentials + DISCORD_GUILD_ID
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth

Discord OAuth via Auth.js. Users must be members of the Network School Discord guild.
