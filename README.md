# DeadTime - Revive What Was Lost

[![Live App](https://img.shields.io/badge/Demo-Live%20App-00ff90?style=flat-square)](https://deadtime-scroll.vercel.app/)
[![Network](https://img.shields.io/badge/Network-Scroll%20Mainnet-FFE66D?style=flat-square)](https://scroll.io/)
[![Contract](https://img.shields.io/badge/Contract-Scrollscan-blue?style=flat-square)](https://scrollscan.com/address/0xCeAc210d3e6B6436E18DEc913991e4E74665fba0)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **DeadTime** is a Web3 platform dedicated to giving abandoned open-source projects a second chance. Discover abandoned codebases, fork and resurrect them, branch multi-generational revival trees ("bloodlines"), and earn gasless NFT badges on Scroll Mainnet.

---

## Core Highlights

- **Infinite Revival Bloodlines**: Revivals can themselves be revived recursively, generating an interactive genealogical lineage tree (`Project → Revival → Revival → ∞`).
- **Gasless NFT Badges**: Unlock reputation badges via community endorsements ("blessings") minted on Scroll Mainnet without paying gas fees.
- **Direct ETH Creator Tipping**: Tip revival creators on Scroll Mainnet with automated smart contract routing.
- **Real-Time Social Collaboration**: Wallet-gated discussions on projects and revivals, user-to-user direct messaging, and community leaderboards.
- **Cyberpunk Aesthetic**: High-contrast dark terminal design with neon green accents, responsive collapsible layout, and zero-border-radius geometry.

---

## Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MetaMask browser extension](https://metamask.io/) (configured for Scroll Mainnet) *or test using the built-in mock wallet fallback*

### Installation

```bash
# 1. Clone repository
git clone https://github.com/creeksonjoseph/Deadtime-scroll.git
cd Deadtime-scroll

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your Supabase credentials and platform relayer keys

# 4. Start local development server
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## Documentation Hub

To keep this guide concise, deep architectural and technical details have been decoupled into focused documentation:

| Guide | Description |
|---|---|
| [**Architecture & Features**](docs/architecture.md) | Bloodline tree system, comments, direct messaging, page routing, and performance optimizations |
| [**Smart Contracts & Web3**](docs/smart-contracts.md) | `BadgeMinterV2` on Scroll Mainnet, gasless relayer model, contract ABI methods, and badge tiers |
| [**Database Schema**](docs/database.md) | Supabase PostgreSQL schema, relational tables, Row Level Security (RLS), and indexing strategy |
| [**Design System**](docs/design-system.md) | Cyberpunk color palette, typography hierarchy, UI components, and design tokens |
| [**Deployment & Operations**](docs/deployment.md) | Production setup on Vercel, Supabase migration instructions, and GitHub Actions keep-alive system |
| [**Testing Guide**](docs/testing.md) | MetaMask vs mock wallet flows, feature verification, and connectivity testing |
| [**Contributing**](CONTRIBUTING.md) | Development workflow, coding conventions, and pull Request procedures |

---

## Smart Contract Reference

The core platform contract is deployed and verified on **Scroll Mainnet**:

- **Contract**: `BadgeMinterV2`
- **Address**: [`0xCeAc210d3e6B6436E18DEc913991e4E74665fba0`](https://scrollscan.com/address/0xCeAc210d3e6B6436E18DEc913991e4E74665fba0)
- **Chain ID**: `534352` (Scroll Mainnet)
- **Explorer**: [View on Scrollscan](https://scrollscan.com/address/0xCeAc210d3e6B6436E18DEc913991e4E74665fba0)

For badge thresholds and gas sponsorship details, see [docs/smart-contracts.md](docs/smart-contracts.md).

---

## Roadmap Summary

- **Phase 1 (Current)**: Core revival system, bloodline tree visualization, Scroll Mainnet NFT badge minting, direct messaging, and community blessings.
- **Phase 2 (DAO & Governance)**: Decentralized community voting on revival grants, ERC-20 token rewards, and IPFS storage.
- **Phase 3 (Intelligence & Collaboration)**: Automated AI code analysis for abandoned repos, real-time collaborative coding, and paid revival bounties.
- **Phase 4 (Ecosystem)**: Developer APIs & SDKs, native mobile applications, and enterprise repo adoption.

---

## License & Links

- **Live Application**: [https://deadtime-scroll.vercel.app/](https://deadtime-scroll.vercel.app/)
- **Scroll Network**: [https://scroll.io/](https://scroll.io/)
- **License**: [MIT License](LICENSE)

---

*Every abandoned project deserves a second chance. DeadTime transforms forgotten code into thriving community software.*
