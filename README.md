# Subscription Playground

An interactive playground for exploring Base subscription functionality with split-screen frontend and backend controls.

## Features

### Split-Screen Layout
- **Frontend Section** (Left/Top): Client-side subscription functions
- **Backend Section** (Right/Bottom): Server-side subscription management

### Frontend Functions
1. **base.subscription.subscribe**
   - Create recurring USDC subscriptions on Base
   - Configure subscription owner, amount, and period
   - Testnet support

2. **base.subscription.getStatus**
   - Check subscription status
   - View remaining charge in period
   - See next billing date

### Backend Functions
1. **base.subscription.charge**
   - Charge a subscription for the current period
   - Specify custom charge amounts
   - Uses CDP wallet (server-side with API credentials)
   - Optional recipient address for USDC transfer

2. **base.subscription.getStatus**
   - Same as frontend, but for backend verification
   - Check subscription validity before processing

3. **base.subscription.revoke**
   - Cancel/revoke a subscription
   - Owner-controlled revocation (uses CDP wallet credentials)
   - Prevents future charges
   - Server-side only operation

### Data Sharing
- **Pass Subscription Owner Wallet to Frontend**: Automatically updates frontend subscribe code with wallet address
- **Pass Subscription ID to Backend**: Automatically populates backend functions with subscription ID from frontend

### Code Execution
- Live code editing with syntax highlighting
- Real-time execution with mock Base SDK
- Console output capture
- Error handling and display
- Code sanitization for security

### Styling
- Clean, modern UI inspired by the Base testapp
- Responsive design
- Color-coded sections (Frontend: Yellow, Backend: Blue)
- Interactive code editors with tips

## Development

### Install Dependencies
```bash
yarn install
```

### Run Development Server
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the playground.

### Build for Production
```bash
yarn build
yarn start
```

## Technology Stack
- **Next.js**: React framework
- **TypeScript**: Type safety
- **CSS Modules**: Scoped styling
- **Acorn**: JavaScript parsing and validation
- **@base-org/account**: Base subscription SDK (real implementation)

## Security
- Code sanitization and validation using AST parsing
- Whitelist-based function execution
- No access to dangerous globals
- Import/export stripping
- Console output capture

## Reference Apps
This playground combines concepts from:
- `/Users/spencerstock/src/cdp-wallet-subscription-demo`: Backend/Frontend integration patterns
- `/Users/spencerstock/src/account-sdk/examples/testapp`: Code editor styling and execution

## Usage Flow

1. **Enter Subscription Owner Wallet**
   - Input your wallet address in the control panel
   - Click "Pass to Frontend →" to auto-fill the subscribe function

2. **Create a Subscription (Frontend)**
   - Edit the subscription parameters (amount, period)
   - Click "Execute Code" to create subscription
   - Note the generated subscription ID

3. **Pass Subscription ID to Backend**
   - Click "Pass to Backend ←" to auto-fill backend functions
   - This enables charging, status checks, and revocation

4. **Charge Subscription (Backend)**
   - Specify charge amount (must be ≤ recurringCharge)
   - Execute to charge the subscription
   - View transaction details

5. **Check Status (Either Side)**
   - Execute getStatus to view subscription details
   - See remaining charge in period
   - Check subscription active status

6. **Revoke Subscription (Backend)**
   - Execute revoke to cancel subscription
   - No more charges can be made after revocation

## Quick Tips

### Frontend Subscribe
- Get testnet USDC at https://faucet.circle.com/ (Base Sepolia)
- subscriptionOwner is your app's address
- recurringCharge is in USDC (e.g., "10.50")
- Users can revoke anytime from their wallet

### Backend Charge
- Amount must be ≤ recurringCharge
- Can only charge up to remainingChargeInPeriod
- Uses CDP wallet credentials (server-side only)
- Multiple charges allowed per period
- Optional recipient parameter to send USDC to a different address

### Backend Revoke
- Only subscription owner can revoke (via CDP wallet credentials)
- Uses CDP wallet (server-side with API credentials)
- Once revoked, subscription is permanently cancelled
- Payer can also revoke from their wallet directly

## Environment Setup

To use real Base SDK functionality, you need to configure CDP API credentials:

1. **Get CDP API Keys**
   - Sign up at https://portal.cdp.coinbase.com/
   - Create API keys from the dashboard
   - Note your API Key ID and Secret

2. **Create Environment File**
   - Copy `.env.example` to `.env.local`
   - Fill in your CDP credentials:
     ```
     CDP_API_KEY_ID=your_api_key_id
     CDP_API_KEY_SECRET=your_api_key_secret
     CDP_WALLET_SECRET=your_secure_random_string
     ```
   - Generate a secure random string for `CDP_WALLET_SECRET`

3. **Restart Development Server**
   ```bash
   yarn dev
   ```

The playground now uses the real `@base-org/account` SDK with:
- Client-side functions: `subscribe`, `getStatus`
- Server-side functions: `charge`, `revoke`, `getOrCreateSubscriptionOwnerWallet`

## License

MIT
