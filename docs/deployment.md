# Deployment & Operations Guide

This guide details the production deployment, database provisioning, smart contract management, and background maintenance for DeadTime.

---

## Production Environment

### Recommended Architecture
- **Web Application Hosting**: [Vercel](https://vercel.com/) (configured via `vercel.json`)
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL instance with RLS & Realtime)
- **Blockchain**: Scroll Mainnet (Chain ID `534352`)
- **Automated Operations**: GitHub Actions (`.github/workflows/keepalive.yml`)

---

## Environment Variables

Configure the following variables in your hosting environment (e.g., Vercel Project Settings) and locally in `.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gasless Relayer Wallet Configuration
VITE_PLATFORM_ADDRESS=0xa9bf1aeab85ea771ddeaf4036a98554f0e81bdd1
VITE_PLATFORM_PRIVATE_KEY=your_relayer_private_key
```

> **Warning**: Ensure `VITE_PLATFORM_PRIVATE_KEY` is kept secure and only exposed to authorized relaying environments.

---

## Database Setup & Migrations

1. Create a new Supabase project or open your existing project dashboard.
2. In the Supabase SQL Editor, run the schema scripts located in:
   - `supabase/migrations/` (or run `node setup-database.js` / `node setup-simple.js` for initial initialization).
3. Confirm that tables (`profiles`, `projects`, `revivals`, `comments`, `messages`, `user_badges`, `blessings`) have Row Level Security enabled.
4. Verify database indices and triggers are active.

---

## Building & Deploying the Frontend

### 1. Build Verification
```bash
# Build the production bundle
npm run build
```
The output will be generated inside the `dist/` directory.

### 2. Deploying to Vercel
You can deploy using the Vercel CLI or via GitHub integration:
```bash
npx vercel --prod
```
The project includes `vercel.json` and `.vercelignore` configured for Single Page Application (SPA) routing fallbacks.

---

## Smart Contract Deployment

The `BadgeMinterV2` contract is permanently deployed on Scroll Mainnet:
- **Contract Address**: `0xCeAc210d3e6B6436E18DEc913991e4E74665fba0`
- **Network**: Scroll Mainnet
- **Chain ID**: `534352`
- **Verification**: Verified on [Scrollscan](https://scrollscan.com/address/0xCeAc210d3e6B6436E18DEc913991e4E74665fba0)

For local compilation or redeployment using Hardhat:
```bash
npm run compile # or npx hardhat compile
```

---

## Supabase Keep-Alive Workflow

Supabase free-tier projects automatically pause after a period of inactivity. To prevent downtime and cold start delays, DeadTime includes an automated GitHub Actions workflow:

- **Location**: `.github/workflows/keepalive.yml`
- **Frequency**: Automated scheduled runs (3x weekly)
- **Mechanism**: Pings the Supabase REST health endpoint using repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
