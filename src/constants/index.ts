// Backend Get or Create Wallet Code
export const DEFAULT_BE_GET_OR_CREATE_WALLET_CODE = `import { base } from '@base-org/account'

try {
  // This creates or retrieves your subscription owner wallet
  // This wallet will receive subscription payments
  const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
    testnet: true
  })
  
  console.log('Wallet address:', wallet.address);
  
  return wallet;
} catch (error) {
  console.error('Failed to get/create wallet:', error.message);
  throw error;
}`;

// Frontend Subscription Code
export const DEFAULT_FE_SUBSCRIBE_CODE = `import { base } from '@base-org/account'

try {
  const subscription = await base.subscription.subscribe({
    recurringCharge: "10.50",
    subscriptionOwner: "0xYourAppAddress", // Your app's address
    periodInDays: 30,
    testnet: true
  })
  
  return subscription;
} catch (error) {
  console.error('Subscription failed:', error.message);
  throw error;
}`;

// Frontend Get Status Code
export const DEFAULT_FE_GET_STATUS_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.getStatus({
    id: '0x...', // Replace with subscription ID
    testnet: true
  })
  
  return result;
} catch (error) {
  console.error('Failed to check subscription status:', error.message);
  throw error;
}`;

// Backend Charge Code
export const DEFAULT_BE_CHARGE_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.charge({
    subscriptionId: '0x...', // Replace with subscription ID
    amount: "5.00", // Amount to charge (must be <= recurringCharge)
    testnet: true
  })
  
  return result;
} catch (error) {
  console.error('Charge failed:', error.message);
  throw error;
}`;

// Backend Get Status Code
export const DEFAULT_BE_GET_STATUS_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.getStatus({
    id: '0x...', // Replace with subscription ID
    testnet: true
  })
  
  return result;
} catch (error) {
  console.error('Failed to check subscription status:', error.message);
  throw error;
}`;

// Backend Revoke Code
export const DEFAULT_BE_REVOKE_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.revoke({
    subscriptionId: '0x...', // Replace with subscription ID
    testnet: true
  })
  
  return result;
} catch (error) {
  console.error('Revoke failed:', error.message);
  throw error;
}`;

// Quick Tips
export const BE_GET_OR_CREATE_WALLET_TIPS = [
  'This function creates a new wallet or retrieves an existing one',
  'The wallet is stored securely and associated with your CDP API credentials',
  'This is the wallet that will receive subscription payments',
  'Save the wallet address for use in the subscribe function',
];

export const FE_SUBSCRIBE_TIPS = [
  'Get testnet USDC at <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">https://faucet.circle.com/</a> - select "Base Sepolia"',
  'subscriptionOwner is your application\'s address that will control the subscription',
  'recurringCharge is the amount of USDC to charge per period (e.g., "10.50" = $10.50)',
  'The user can revoke the subscription at any time',
];

export const FE_GET_STATUS_TIPS = [
  'Use the subscription ID returned from the subscribe function',
  'remainingChargeInPeriod shows how much can still be charged this period',
  'Make sure to use the same testnet setting as the original subscription',
];

export const BE_CHARGE_TIPS = [
  'The charge amount must be less than or equal to the recurringCharge',
  'You can only charge up to the remainingChargeInPeriod',
  'Charges can be made multiple times within a period up to the total recurring charge',
  'Use the subscriptionId returned from the subscribe function',
];

export const BE_GET_STATUS_TIPS = [
  'Same function as frontend, but typically called from your backend',
  'Use this to verify subscription status before granting access',
  'Check isSubscribed and remainingChargeInPeriod fields',
];

export const BE_REVOKE_TIPS = [
  'Only the subscription owner can revoke a subscription',
  'Once revoked, no more charges can be made',
  'The subscription payer can also revoke from their wallet',
  'Use the subscriptionId returned from the subscribe function',
];
