# Wallet Connection Test Guide

## Pre-Test Setup

1. **Clear Previous Data**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   location.reload();
   ```

2. **Check MetaMask Installation**
   ```javascript
   // In console, check if MetaMask is available:
   console.log('MetaMask available:', typeof window.ethereum !== 'undefined');
   console.log('Is MetaMask:', window.ethereum?.isMetaMask);
   ```

## Testing Steps

### Test 1: Mock Wallet Connection (No MetaMask)

**Expected Console Output:**
```
Starting wallet connection...
MetaMask not detected, using mock wallet...
Generated mock address: 0x[40-character-hex]
Loading profile for address: 0x[40-character-hex]
Profile not found, creating new profile...
New profile created: {id, wallet_address, username, ...}
Mock wallet connection successful!
Header render - isConnected: true, loading: false, profile: {...}
Sidebar - isConnected: true
Sidebar rendering - isOpen: false
```

**Steps:**
1. Open app in browser without MetaMask
2. Click "Connect Wallet" button
3. Watch console for logs
4. Verify:
   - ✅ Alert does NOT appear
   - ✅ Sidebar appears on left
   - ✅ Avatar appears in header
   - ✅ "Disconnect" button shows

### Test 2: MetaMask Connection

**Expected Console Output:**
```
Starting wallet connection...
MetaMask detected, requesting accounts...
MetaMask connected with address: 0x[your-address]
Loading profile for address: 0x[your-address]
Profile not found, creating new profile...
New profile created: {id, wallet_address, username, ...}
Wallet connection successful!
Header render - isConnected: true, loading: false, profile: {...}
Sidebar - isConnected: true
```

**Steps:**
1. Install MetaMask browser extension
2. Create/login to MetaMask account
3. Click "Connect Wallet" button
4. Approve connection in MetaMask popup
5. Verify:
   - ✅ MetaMask popup appears
   - ✅ After approval, wallet connects
   - ✅ Sidebar appears
   - ✅ Avatar appears in header
   - ✅ Real wallet address used

### Test 3: Connection Persistence

**Steps:**
1. Connect wallet (either method)
2. Refresh page (F5)
3. Verify:
   - ✅ Wallet remains connected
   - ✅ Sidebar still visible
   - ✅ Profile still loaded
   - ✅ No re-connection needed

**Expected Console Output:**
```
Found stored wallet address: 0x[address]
Loading profile for address: 0x[address]
Profile loaded: {id, wallet_address, username, ...}
```

### Test 4: Disconnection

**Steps:**
1. Connect wallet
2. Click "Disconnect" button (desktop) or Logout in sidebar
3. Verify:
   - ✅ Sidebar disappears
   - ✅ Avatar disappears
   - ✅ "Connect Wallet" button appears
   - ✅ localStorage cleared

**Expected Console Output:**
```
Disconnecting wallet...
Wallet disconnected
```

### Test 5: Error Handling - Rejection

**Steps (MetaMask only):**
1. Click "Connect Wallet"
2. Click "Reject" in MetaMask popup
3. Verify:
   - ✅ Alert shows: "Failed to connect wallet: Connection request rejected"
   - ✅ Wallet not connected
   - ✅ Sidebar not visible

**Expected Console Output:**
```
Starting wallet connection...
MetaMask detected, requesting accounts...
Wallet connection error: Error: Connection request rejected. Please try again.
```

## Common Issues & Solutions

### Issue: "Failed to connect wallet" Alert

**Solution:**
1. Check console for specific error
2. Verify Supabase connection:
   ```javascript
   // In console:
   import { supabase } from './src/lib/supabase';
   const { data, error } = await supabase.from('profiles').select('*').limit(1);
   console.log('Supabase test:', { data, error });
   ```
3. Clear cache and retry

### Issue: Sidebar Not Appearing

**Solution:**
1. Check console for: "Sidebar - isConnected: true"
2. If false, wallet not connected properly
3. If true but sidebar hidden, check browser width (mobile view?)
4. Try toggling with hamburger menu

### Issue: Profile Creation Fails

**Solution:**
1. Check Supabase RLS policies are updated
2. Verify API keys in .env file
3. Check network tab for failed requests
4. Look for CORS errors

## Success Criteria

✅ Mock wallet connects without errors
✅ MetaMask wallet connects when approved
✅ Connection persists after refresh
✅ Sidebar appears after connection
✅ Profile created in Supabase database
✅ Disconnection works properly
✅ Error handling shows appropriate messages
✅ Console logs are detailed and helpful

## Debug Commands

Run these in browser console if issues occur:

```javascript
// Check wallet state
console.log('Connected:', localStorage.getItem('walletAddress'));

// Force disconnect
localStorage.clear();
location.reload();

// Check MetaMask
console.log('Ethereum:', window.ethereum);
console.log('Accounts:', await window.ethereum?.request({ method: 'eth_accounts' }));

// Test Supabase
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('profiles').select('*');
console.log('Profiles:', data, error);
```
