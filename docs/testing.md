# Testing & Quality Assurance Guide

This document outlines manual and automated testing procedures for validating DeadTime's Web3 integration, UI functionality, and database workflows.

---

## Wallet Connection Testing

DeadTime supports dual connection modes: real MetaMask browser extensions and a built-in mock wallet fallback for rapid testing without browser extensions.

### 1. Testing with MetaMask
1. Install and unlock the MetaMask browser extension.
2. Ensure your active network is set to **Scroll Mainnet** (Chain ID: `534352`, RPC: `https://rpc.scroll.io`).
3. Load the DeadTime local app (`http://localhost:5173`) or production URL.
4. Click **Connect Wallet** in the top navigation bar.
5. Confirm the connection prompt in MetaMask.
6. Verify your truncated wallet address and avatar placeholder appear in the header.

### 2. Testing Without MetaMask (Mock Wallet Fallback)
1. Use an incognito browser window or disable the MetaMask extension.
2. Click **Connect Wallet** in the navigation bar.
3. The platform will activate the mock wallet session with a synthetic address.
4. Verify that write actions (submitting projects, creating revivals, drafting comments) function properly.

---

## End-to-End Feature Test Flows

### 1. Project Revival Flow
1. **Browse Projects**: Navigate to `/projects`. Use search terms and filter categories.
2. **Submit Project**: Click **Submit Project**, populate the repository URL, name, and problem description. Submit and confirm it renders in the project feed.
3. **Inspect Project**: Open `/projects/:id` to check the revival list and comment section.

### 2. Revival Bloodline Flow
1. **Spawn Revival**: Click **Revive This Project** on a project detail page.
2. **Multi-generation Revival**: Create a child revival linked from an existing revival.
3. **Inspect Bloodline**: Navigate to `/revivals/:id/bloodline`.
4. Verify parent ancestors, the current focused node, and child descendants render with active connecting lines.

### 3. NFT Badges & Gasless Minting Flow
1. Perform actions and accumulate community blessings on revivals.
2. Visit `/profile`.
3. Check the **Badges** section for earned thresholds (e.g. *Grave Keeper* at 1 blessing).
4. Click **Claim Badge**.
5. Observe the gasless claim indicator (minted via platform relayer without prompting user gas fees).
6. Verify the transaction status and explorer link.

### 4. Direct Messaging Flow
1. Visit another user's profile at `/profile/:address` or via their avatar in comments.
2. Click **Message**.
3. Confirm redirection to `/messages` with the user's thread open.
4. Send a text message and confirm optimistic rendering and real-time delivery.

---

## Local Diagnostics & Scripts

### Database Connection Verification
Test connectivity and credentials against your Supabase instance:
```bash
node test-connection.js
```

### Linting & Build Verification
```bash
# Run ESLint checks
npm run lint

# Verify TypeScript compilation and production build
npm run build
```
