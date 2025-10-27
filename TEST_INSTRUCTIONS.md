# Testing Instructions for DeadTime Application

## Testing Wallet Connection

1. Open the application in your browser
2. Open browser console (F12 or right-click > Inspect > Console)
3. You should see console logs for:
   - "Layout - isConnected: false, loading: true" (initially)
   - "Sidebar - isConnected: false" (initially)

4. Click "Connect Wallet" button on the homepage
5. You should see:
   - "Attempting to connect wallet..."
   - Either "MetaMask detected" or "MetaMask not found, using mock wallet"
   - "Mock wallet address: 0x..."
   - "Profile loaded: {wallet_address, username, ...}"
   - "Wallet connected: 0x..."

6. After connection:
   - Sidebar should appear on the left (on desktop)
   - Header should show "Disconnect" button
   - User avatar should appear in header

## Testing Sidebar

After connecting wallet:
1. Sidebar should be visible on desktop screens
2. On mobile, tap the hamburger menu icon to toggle sidebar
3. Navigate between pages using sidebar menu
4. Current page should be highlighted in sidebar

## Testing Database Connection

1. Go to Projects page (/projects)
2. You should see 6 projects loaded from Supabase
3. Each project should have long, detailed descriptions
4. Click on any project to see full details
5. Check that creator information appears

## Expected Behavior

✅ Wallet connects (mock wallet if no MetaMask)
✅ Sidebar appears after connection
✅ All pages load data from Supabase
✅ Project descriptions are comprehensive
✅ Navigation works smoothly
✅ No console errors

## Troubleshooting

If wallet doesn't connect:
- Check browser console for error messages
- Clear localStorage: `localStorage.clear()`
- Refresh page and try again

If sidebar doesn't appear:
- Check console for "Sidebar - isConnected: true"
- Verify wallet is connected (avatar in header)
- Try clicking hamburger menu on mobile
