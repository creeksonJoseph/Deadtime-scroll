# Architecture & Core Features

DeadTime is designed around community-driven project revival, genealogical tree tracking ("bloodlines"), real-time social engagement, and gasless Web3 reward mechanisms.

---

## Revival Bloodline System

### Concept
Revivals can be revived infinitely, creating a genealogical tree of project evolution:

```text
Project → Revival → Revival → Revival → ∞
```

### Tree Structure Example
```text
Abandoned Cart Recovery (Project)
├── Cart Recovery Pro (depth: 0)
│   └── Cart Recovery Web3 (depth: 1)
│       └── OmniCart Multi-Chain (depth: 2)
├── Cart Saver AI (depth: 0)
│   └── SmartCart Voice (depth: 1)
└── Cart Saver Pro (depth: 0)
```

### Bloodline Visualization
- **Route**: `/revivals/:revivalId/bloodline`
- **Features**: Blockchain-inspired visual graph with animated connectors.
- **Node Breakdown**:
  - **Ancestors**: Upstream parent revivals leading back to the original root project.
  - **Current**: The actively inspected revival node (highlighted).
  - **Descendants**: Child revivals branching out from the current node.
- **Interactivity**: Click any node to traverse and refocus its unique lineage.

### Data Schema Representation
```sql
revivals:
  - parent_revival_id (UUID, self-referencing foreign key)
  - depth (INTEGER, tree level hierarchy)
  - root_project_id (UUID, original base project)
  - project_id (UUID, nullable for sub-revivals)
```

---

## Comment System

### Key Capabilities
- **Dual Target Support**: Flexible commenting system supporting both root projects and individual revivals.
- **Wallet Authentication**: Wallet connection required to contribute discussions.
- **Real-Time Synchronisation**: Instant UI updates powered by Supabase Realtime subscriptions.
- **Rich Experience**: User avatars, timestamps, and contextual states.

### Usage Example
```tsx
// Project comments
<CommentSection projectId={project.id} />

// Revival comments
<CommentSection revivalId={revival.id} />
```

### Business Logic & Constraints
- Comments must target **either** `project_id` or `revival_id` (mutually exclusive constraint).
- Database triggers automatically recalculate and synchronize comment count totals.
- Query-level indexing ensures fast retrieval across high-volume discussions.

---

## Messaging System

### Capabilities
- **Direct Messaging**: 1-on-1 private messaging between connected wallet holders.
- **Conversation Management**: Automatically initialises conversation threads between participants.
- **Unread Tracking**: Accurate real-time tracking of unread counts without heavy polling.
- **Profile Integration**: Direct "Message" actions available on user profile pages.

### User Flow
1. Navigate to a user's profile (`/profile` or member view).
2. Click **Message**.
3. Auto-route to `/messages` with conversation established or focused.
4. Exchange real-time messages with instant UI optimistic updates.

---

## User Interface & Page Map

### Layout
- **Header**: Persistent navigation with wallet connect/disconnect status and profile avatar.
- **Collapsible Sidebar**: Dynamic widths (256px expanded ↔ 80px icon mode).
- **Mobile Support**: Backdrop drawer overlay optimized for touch devices.

### Application Routes
| Route | Description |
|---|---|
| `/` | Landing page featuring hero banner, trending revivals, and stats |
| `/projects` | Project directory with keyword search and category filtering |
| `/projects/:id` | Detailed project overview, repository links, and revivals |
| `/projects/:id/revivals` | Comprehensive list of revivals for a given project |
| `/revivals/:id` | Revival details, creator attribution, and blessing action |
| `/revivals/:id/bloodline` | Interactive genealogical lineage tree visualization |
| `/profile` | User stats dashboard, NFT badge showcase, and profile edit |
| `/messages` | Direct chat inbox and conversation management |
| `/leaderboard` | Community rankings by contributions, revivals, and blessings |

---

## Performance Optimizations

### Database Improvements
- **N+1 Query Elimination**: Consolidated profile fetches from 3 queries down to 1 (70% load time reduction).
- **Conversation Optimization**: Unified single-query conversation lists (80% faster message view).
- **Strategic Indexing**: 12 dedicated composite and foreign-key indexes.
- **Pagination & Limits**: Default limits with 50-item batches to prevent unbounded payloads.

### Frontend Improvements
- **Debounced Input**: 300ms debounce on search bars to curb redundant network queries.
- **Skeleton Feedback**: Zero-layout-shift skeleton loaders during async fetch states.
- **Component Memoization**: React memoization (`useMemo`, `useCallback`) on heavy tree nodes.
- **Client-Side Image Compression**: Automatic client-side compression for user avatars (200x200 output).
- **Optimistic Updates**: Instant UI state reflection for comments and blessings prior to network round-trips.
