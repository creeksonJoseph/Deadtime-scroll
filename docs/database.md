# Database Architecture & Schema

DeadTime relies on Supabase (PostgreSQL) for persistence, utilizing Row Level Security (RLS), real-time replication, and optimized indexing.

---

## Core Tables

### 1. `profiles`
Stores registered user accounts linked to Web3 wallet addresses.

```sql
- id: UUID (Primary Key)
- wallet_address: TEXT (Unique, lowercase Ethereum address)
- username: TEXT
- bio: TEXT
- avatar_url: TEXT
- total_blessings: INTEGER (Default: 0)
- projects_count: INTEGER (Default: 0)
- revivals_count: INTEGER (Default: 0)
- created_at: TIMESTAMPTZ
```

### 2. `projects`
Catalog of original abandoned projects submitted for community revival.

```sql
- id: UUID (Primary Key)
- creator_id: UUID (Foreign Key → profiles.id)
- name: TEXT
- description: TEXT
- category: TEXT
- repo_url: TEXT
- revival_count: INTEGER (Default: 0)
- blessing_count: INTEGER (Default: 0)
- created_at: TIMESTAMPTZ
```

### 3. `revivals`
Community-built solutions and continuations of abandoned projects. Supports recursive nesting (bloodline lineage).

```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id, nullable for multi-generational revivals)
- root_project_id: UUID (Foreign Key → projects.id, root project tracking)
- parent_revival_id: UUID (Self-referencing Foreign Key → revivals.id, nullable)
- reviver_id: UUID (Foreign Key → profiles.id)
- title: TEXT
- description: TEXT
- repo_url: TEXT
- live_url: TEXT
- blessing_count: INTEGER (Default: 0)
- depth: INTEGER (Hierarchical bloodline depth level)
- created_at: TIMESTAMPTZ
```

### 4. `messages`
Real-time 1-on-1 direct messages between users.

```sql
- id: UUID (Primary Key)
- sender_id: UUID (Foreign Key → profiles.id)
- recipient_id: UUID (Foreign Key → profiles.id)
- content: TEXT
- is_read: BOOLEAN (Default: false)
- created_at: TIMESTAMPTZ
```

### 5. `comments`
Discussion threads on projects and revivals.

```sql
- id: UUID (Primary Key)
- project_id: UUID (Foreign Key → projects.id, nullable)
- revival_id: UUID (Foreign Key → revivals.id, nullable)
- author_id: UUID (Foreign Key → profiles.id)
- content: TEXT
- created_at: TIMESTAMPTZ
```
*Note: A check constraint enforces that either `project_id` OR `revival_id` is populated, but not both.*

### 6. `user_badges`
Tracks NFT badge qualification and on-chain minting statuses for profiles.

```sql
- id: UUID (Primary Key)
- user_wallet: TEXT (Indexed wallet address)
- badge_type: TEXT (e.g., 'grave_keeper', 'phoenix', etc.)
- claimed: BOOLEAN (Default: false)
- token_id: NUMERIC (Nullable, on-chain ERC721 token ID)
- tx_hash: TEXT (Nullable, transaction hash on Scroll Mainnet)
- created_at: TIMESTAMPTZ
```

### 7. `blessings`
Social endorsements and support points awarded to revivals.

```sql
- id: UUID (Primary Key)
- revival_id: UUID (Foreign Key → revivals.id)
- user_wallet: TEXT
- created_at: TIMESTAMPTZ
```

---

## Row Level Security (RLS) Policies

All tables enforce PostgreSQL RLS policies to safeguard data integrity:

- **Public Read Access**:
  - `projects`, `revivals`, `comments`, `profiles`, and `blessings` are readable by anyone (including unauthenticated visitors).
- **Authenticated Writes**:
  - Insertions require an active authenticated wallet session.
- **Owner Permissions**:
  - Profiles can only be edited by the holder of the corresponding wallet address.
  - Revivals and projects can only be modified or deleted by their designated creator.
- **Direct Messaging Privacy**:
  - `messages` can only be queried if `auth.uid()` corresponds to either `sender_id` or `recipient_id`.

---

## Indexing & Performance

The database schema applies targeted indexing across frequently queried relations:
- Index on `profiles(wallet_address)`
- Foreign key indexes on `projects(creator_id)` and `revivals(project_id, parent_revival_id, reviver_id)`
- Composite index on `messages(sender_id, recipient_id, created_at DESC)`
- Filter indexes on unread messages `messages(recipient_id, is_read)`
- Foreign key indexes on `comments(project_id)` and `comments(revival_id)`
- Unique index on `blessings(revival_id, user_wallet)` to prevent duplicate endorsements
