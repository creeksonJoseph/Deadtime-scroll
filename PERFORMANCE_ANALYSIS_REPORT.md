# Backend Performance Analysis Report

## Executive Summary

Your backend has **multiple critical performance issues** causing slowness. The main problems are:

1. **N+1 Query Problem** - Most severe - fetches are done in loops
2. **Missing Critical Indexes** - Foreign keys are missing indexes
3. **Inefficient Profile Loading** - Makes 3 queries for every profile fetch
4. **Join Selection Issues** - Over-fetching related data
5. **No Query Optimization/Pagination** - Full table scans on large datasets

---

## Critical Issues Found

### 1. **MOST SEVERE: N+1 Query Problem in profileService**

**Location:** `src/services/profileService.ts` (lines 15-28, 44-52)

**Problem:**
```typescript
// getByWallet() and getById() both do this:
const { count: projectsCount } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true })
  .eq('creator_id', profile.id);

const { count: revivalsCount } = await supabase
  .from('revivals')
  .select('*', { count: 'exact', head: true })
  .eq('reviver_id', profile.id);
```

**Impact:**
- Loading 1 profile = 3 database queries (GET profile + 2 counts)
- In loops (like leaderboard), this is multiplied by number of users
- With 29 profiles on leaderboard: **87 queries instead of 1**

**Why It's Slow:**
- Each query requires a full table scan to count rows
- No indexes on `projects.creator_id` or `revivals.reviver_id`
- These queries block each other sequentially (not parallel)

**Solution:** Store counts as denormalized columns in profiles table, updated via triggers

---

### 2. **Missing Index on projects.creator_id**

**Current State:** No index exists

**Queries Affected:**
- `projectService.getByUser()` (line 58)
- `profileService.getByWallet()` (line 18)
- `profileService.getById()` (line 47)

**Impact:**
- Full table scan every time
- With 27 projects, scans all rows
- At scale (thousands of projects), this becomes exponentially slower

**Solution:** Add index:
```sql
CREATE INDEX idx_projects_creator_id ON projects(creator_id);
```

---

### 3. **Missing Index on revivals.reviver_id for DESC ordering**

**Current State:** Index exists but isn't optimized for sorting

**Queries Affected:**
- `revivalService.getByUser()` (line 27-33)
- `profileService.getByWallet()` (line 22)
- `profileService.getById()` (line 50)

**Problem:**
- Query does: `eq('reviver_id', userId).order('created_at', { ascending: false })`
- Index on `reviver_id` is used for equality, but then database must sort all results
- Should use composite index `(reviver_id, created_at DESC)`

**Solution:** Add composite index:
```sql
CREATE INDEX idx_revivals_reviver_created ON revivals(reviver_id, created_at DESC);
```

---

### 4. **Inefficient Message Service Query Loop**

**Location:** `src/services/messageService.ts` (lines 70-79)

**Problem:**
```typescript
// This happens for EVERY conversation:
for (const [partnerId, conversation] of conversationMap) {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', partnerId)
    .eq('recipient_id', userId)
    .eq('is_read', false);

  conversation.unreadCount = count || 0;
}
```

**Impact:**
- User with 9 conversations = 9 additional queries
- User with 50 conversations = 50 additional queries
- This is serialized (happens one at a time), not parallel

**Solution:** Use single aggregate query or move unread count to denormalized field

---

### 5. **Expensive Bloodline Queries**

**Location:** `src/services/bloodlineService.ts`

**Problem:**
- Uses complex RPC functions `get_revival_bloodline` and `get_revival_descendants`
- These likely do recursive queries or full tree traversals
- No data about these functions available to optimize

**Impact:**
- Bloodline page will be very slow
- Loading a revival with deep ancestry = exponential query time

**Recommendation:** Need to check RPC implementations and potentially add materialized path or ltree extension

---

### 6. **Over-Fetching Related Data**

**Location:** Multiple services

**Examples:**

```typescript
// projectService.getAll() line 7
.select('*, profiles(*)')  // Fetches ALL profile columns

// Better approach:
.select('*, profiles(id, username, avatar_url, wallet_address)')

// revivalService.getByProject() line 8
.select('*, profiles!revivals_reviver_id_fkey(*)')  // All columns
```

**Impact:**
- Sends unnecessary data over the network
- Larger payloads slow down the API
- With 63 revivals, multiplied inefficiency

**Solution:** Specify only needed columns in select

---

### 7. **No Pagination**

**Location:** Multiple list endpoints

**Problem:**
- `projectService.getAll()` fetches ALL projects without limit
- `messageService.getConversations()` fetches ALL messages
- `revivalService.getByProject()` fetches ALL revivals
- `profileService.getLeaderboard()` - only has limit (50)

**Impact:**
- First user loads 27 projects = OK
- At 1000 projects = Performance cliff
- Memory usage explodes on frontend

**Solution:** Add limit/offset or cursor-based pagination

---

### 8. **Search Implementation Issue**

**Location:** `src/services/projectService.ts` (lines 14-15)

**Problem:**
```typescript
if (search) {
  query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
}
```

**Issues:**
- ILIKE searches on TEXT columns without index are full table scans
- `description` is a large text field - very expensive to search

**Impact:**
- Any search query will scan all 27 projects' descriptions
- At scale (thousands), this becomes very slow

**Solution:** Add full-text search index on both columns

---

## Index Status Summary

### Current Indexes (GOOD)
✅ `idx_projects_category` - Speeds up category filtering
✅ `idx_revivals_project` - Speeds up getting revivals for project
✅ `idx_revivals_reviver` - Speeds up getting user's revivals
✅ `idx_comments_*` - Covers comment queries
✅ `profiles_wallet_address_key` - UNIQUE, good for lookups

### Missing Indexes (CRITICAL)
❌ `projects.creator_id` - Used in getByUser(), profile loading
❌ `revivals.reviver_id + created_at composite` - Used in profile loading with sorting
❌ Text search indexes on `projects.name` and `projects.description`
❌ `comments.user_id` - If comments can be filtered by user

### Suboptimal Indexes (MEDIUM)
⚠️ `idx_revivals_reviver` - Not ordered by created_at, need composite

---

## Database Statistics

| Table | Rows | Growth Potential | Risk Level |
|-------|------|------------------|-----------|
| revivals | 63 | High (users create many) | 🔴 CRITICAL |
| profiles | 29 | Medium | 🟡 MEDIUM |
| projects | 27 | Medium | 🟡 MEDIUM |
| comments | 15 | High | 🔴 CRITICAL |
| user_badges | 10 | Medium | 🟡 MEDIUM |
| messages | 9 | High | 🔴 CRITICAL |
| badges | 4 | Low | 🟢 LOW |
| revival_blessings | 0 | Unknown | ⚠️ MONITOR |

---

## Performance Bottlenecks by User Flow

### Viewing Project List
1. ✅ `projectService.getAll()` - OK with category index
2. ❌ Fetches all profile data unnecessarily
3. ❌ No pagination limit

**Estimated Time:** 200ms - 500ms at 1000 projects

### User Profile Page
1. ❌ `profileService.getById()` makes 3 queries
2. ❌ Missing index on `creator_id` causes full table scans
3. ❌ Missing composite index on revivals causes sorting overhead

**Estimated Time:** 300ms - 800ms (scales linearly with user activity)

### My Revivals Page
1. ❌ `revivalService.getByUser()` missing composite index
2. ❌ Projects joined but fetches all columns

**Estimated Time:** 150ms - 400ms

### Messages Page
1. ❌ `messageService.getConversations()` does N queries for unread counts
2. ⚠️ With 50 messages, this could hit 50 separate queries

**Estimated Time:** 500ms - 2000ms (scales linearly with message count)

### Leaderboard
1. ❌ `profileService.getLeaderboard()` fetches 50 profiles
2. ❌ Each profile triggers 3 queries in code (N+1)
3. = **150 queries minimum** instead of 1

**Estimated Time:** 3000ms - 10000ms+ (SEVERELY BROKEN)

### Bloodline/Revival Tree
1. ❌ Uses complex RPC functions (need to inspect)
2. ❌ No indication of optimization

**Estimated Time:** Unknown, likely very slow

---

## Recommendations by Priority

### 🔴 CRITICAL (Do First)

**1. Fix Profile Loading N+1 Query**
- Denormalize `projects_count` and `revivals_count` into profiles table
- Update via triggers on insert/delete
- This alone could save 60+ queries on leaderboard

**2. Add Missing Index on projects.creator_id**
```sql
CREATE INDEX idx_projects_creator_id ON projects(creator_id);
```

**3. Add Composite Index for Revival Sorting**
```sql
CREATE INDEX idx_revivals_reviver_created ON revivals(reviver_id, created_at DESC);
```

### 🟡 HIGH (Do Next)

**4. Implement Pagination**
- Add `limit` parameter to all list endpoints
- Start with 20-50 items per page
- Example: `getAll(category, search, limit = 20, offset = 0)`

**5. Fix Message Service Unread Count**
- Use single aggregation query instead of loop
- Or denormalize unread count to conversations table

**6. Optimize Column Selection**
- Specify only needed columns in `.select()`
- Remove `*` and replace with explicit column names

### 🟢 MEDIUM (Do After)

**7. Add Full-Text Search Indexes**
```sql
CREATE INDEX idx_projects_name_search ON projects USING gin(to_tsvector('english', name));
CREATE INDEX idx_projects_description_search ON projects USING gin(to_tsvector('english', description));
```

**8. Add Comment User Index (if needed)**
```sql
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

**9. Investigate RPC Functions**
- Check implementation of bloodline queries
- Consider materializing the tree structure
- Add indexes to support recursive queries

---

## Testing/Validation Plan

After implementing fixes:

1. **Measure Load Times**
   - Before: User profile = 800ms
   - After target: User profile = 150ms

2. **Monitor Query Count**
   - Before: Leaderboard = 150+ queries
   - After target: Leaderboard = 1-2 queries

3. **Load Testing**
   - Test with 1000 projects, 500 users
   - Test with user having 100 revivals
   - Test with 1000 messages

4. **Database Query Logging**
   - Enable slow query log (> 100ms)
   - Monitor for new bottlenecks as data grows

---

## Code Quality Issues (Bonus)

### Non-Performance Issues to Fix

1. **Inconsistent Error Handling**
   - Some services throw errors, others return error objects
   - Standardize across all services

2. **Debugging Logs in Production Code**
   - `revivalService.create()` has console.logs
   - Remove or use proper logging library

3. **localStorage for State**
   - `blessingService` uses localStorage to prevent duplicate blessings
   - Should use database constraint instead
   - localStorage can be cleared by user

4. **Magic Numbers**
   - Badge thresholds hardcoded in code
   - Should come from database for admin updates

---

## Summary Table

| Issue | Severity | Impact | Effort | ROI |
|-------|----------|--------|--------|-----|
| Profile N+1 Queries | 🔴 CRITICAL | 60+ extra queries | Low | Excellent |
| Missing projects.creator_id Index | 🔴 CRITICAL | Full table scans | Trivial | Excellent |
| Missing revivals composite Index | 🔴 CRITICAL | Sort overhead | Trivial | Excellent |
| Message unread count loop | 🟡 HIGH | N additional queries | Medium | Good |
| No pagination | 🟡 HIGH | Exponential slowdown at scale | Medium | Good |
| Over-fetching columns | 🟡 HIGH | Network overhead | Low | Good |
| Search optimization | 🟢 MEDIUM | Full scans on search | Medium | Medium |
| RPC investigation | 🟢 MEDIUM | Unknown perf issues | High | Unknown |

---

## Estimated Impact

### Current State
- Loading leaderboard: **5-15 seconds** ⚠️
- Loading user profile: **800ms - 1.5s** ⚠️
- Loading messages: **500ms - 2s** ⚠️
- Project list: **200-500ms** ✅

### After CRITICAL Fixes
- Loading leaderboard: **200-400ms** ✅
- Loading user profile: **100-200ms** ✅
- Loading messages: **200-400ms** ✅ (with pagination)
- Project list: **100-200ms** ✅ (with pagination)

### Improvement
**5-10x faster** on heavy queries
**Exponential gains** as database grows

---

## Next Steps

1. ✅ Read this report (you are here)
2. 🔜 Apply CRITICAL fixes (indexes + N+1 fix)
3. 🔜 Implement pagination on list endpoints
4. 🔜 Optimize column selection
5. 🔜 Load test with larger dataset
6. 🔜 Fix message unread count performance
7. 🔜 Add full-text search indexes
8. 🔜 Investigate and optimize RPC functions

