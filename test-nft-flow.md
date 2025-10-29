# NFT Badge Claiming Test Flow

## Test Steps

1. **Connect Wallet**
   - Go to http://localhost:5173
   - Click "Connect Wallet" in header
   - Connect MetaMask to Scroll Sepolia network

2. **Create a Project** 
   - Navigate to "Submit Project" in sidebar
   - Fill out project details:
     - Title: "Test NFT Project"
     - Description: "Testing NFT badge claiming"
     - Category: "Web Development"
     - GitHub URL: "https://github.com/test/repo"
   - Submit project

3. **Create a Revival**
   - Go to project detail page
   - Click "Revive This Project"
   - Fill out revival details:
     - Title: "Test Revival for NFT"
     - Description: "Testing the badge system"
     - Deployed URL: "https://test.com"
   - Submit revival

4. **Bless the Revival**
   - Go to revival detail page
   - Click "Bless This Revival" button
   - Should see success toast message
   - Blessing count should increment to 1

5. **Check Badge Creation**
   - Go to user profile page
   - Should see "Grave Keeper" badge in NFT Badges section
   - Badge should show "NEW" indicator and "Claim NFT Badge" button

6. **Claim NFT Badge**
   - Click "Claim NFT Badge" button
   - MetaMask should prompt for transaction
   - After confirmation, should see success message with token ID
   - Badge should update to show claimed status with transaction hash

## Expected Results

- Badge threshold: 1 blessing = Grave Keeper badge
- Smart contract: 0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
- Network: Scroll Sepolia
- Badge should be claimable immediately after 1 blessing
- Transaction should be gasless (paid by platform)

## Troubleshooting

If badges don't appear:
1. Check browser console for errors
2. Verify database migrations are applied
3. Check if blessing was recorded in database
4. Ensure wallet is connected to correct network

If NFT claiming fails:
1. Check MetaMask network (should be Scroll Sepolia)
2. Verify smart contract is deployed and accessible
3. Check if signature generation is working
4. Ensure sufficient ETH for gas (even though platform pays)