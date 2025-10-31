export const DEFAULT_BE_GET_OR_CREATE_WALLET_CODE = `import { base } from '@base-org/account'

try {
  const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet()
  
  return wallet;
} catch (error) {
  throw error;
}`;

export const WALLET_WITH_CUSTOM_NAME_CODE = `import { base } from '@base-org/account'

try {
  const wallet = await base.subscription.getOrCreateSubscriptionOwnerWallet({
    walletName: "my-app-subscription-wallet"
  })
  
  return wallet;
} catch (error) {
  throw error;
}`;

export const DEFAULT_FE_SUBSCRIBE_CODE = `import { base } from '@base-org/account'

try {
  const subscription = await base.subscription.subscribe({
    recurringCharge: "5",
    subscriptionOwner: "0xYourAppAddress",
    periodInDays: 30,
    testnet: true
  })
  
  return subscription;
} catch (error) {
  throw error;
}`;

// Frontend Subscription with Fast Testing Period
export const SUBSCRIBE_FAST_TESTING_CODE = `import { base } from '@base-org/account'

try {
  const subscription = await base.subscription.subscribe({
    recurringCharge: ".01",
    subscriptionOwner: "0xYourAppAddress",
    periodInDays: 30,
    overridePeriodInSecondsForTestnet: 10,
    testnet: true
  })
  
  return subscription;
} catch (error) {
  throw error;
}`;

// Frontend Subscription without Balance Check
export const SUBSCRIBE_NO_BALANCE_CHECK_CODE = `import { base } from '@base-org/account'

try {
  const subscription = await base.subscription.subscribe({
    recurringCharge: "5",
    subscriptionOwner: "0xYourAppAddress",
    periodInDays: 30,
    requireBalance: false,
    testnet: true
  })
  
  return subscription;
} catch (error) {
  throw error;
}`;

// Frontend Get Status Code
export const DEFAULT_FE_GET_STATUS_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.getStatus({
    id: '0x...',
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;

// Backend Charge Code
export const DEFAULT_BE_CHARGE_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.charge({
    id: '0x...',
    amount: "1.00",
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;

// Backend Charge with Recipient
export const CHARGE_WITH_RECIPIENT_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.charge({
    id: '0x...',
    amount: "1.00",
    recipient: "0x...",
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;

// Backend Charge Max Remaining
export const CHARGE_MAX_REMAINING_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.charge({
    id: '0x...',
    amount: "max-remaining-charge",
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;

// Backend Get Status Code
export const DEFAULT_BE_GET_STATUS_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.getStatus({
    id: '0x...',
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;

// Backend Revoke Code
export const DEFAULT_BE_REVOKE_CODE = `import { base } from '@base-org/account'

try {
  const result = await base.subscription.revoke({
    id: '0x...',
    testnet: true
  })
  
  return result;
} catch (error) {
  throw error;
}`;

// Backend Recurring Charge Pattern (Rudimentary Cron)
export const RECURRING_CHARGE_CRON_CODE = `import { base } from '@base-org/account'

// Rudimentary cron for automatic recurring charges
async function collectRecurringCharges(subscriptionId, maxCycles = 3) {
  console.log(\`Starting recurring charge monitor for subscription: \${subscriptionId}\`)
  console.log(\`Will run for up to \${maxCycles} charge cycles (set maxCycles to null for continuous operation)\`)
  console.log('---')
  
  let cycleCount = 0
  
  while (maxCycles === null || cycleCount < maxCycles) {
    try {
      cycleCount++
      console.log(\`\\n[Cycle \${cycleCount}] Checking subscription status...\`)
      
      // Get current subscription status
      const status = await base.subscription.getStatus({
        id: subscriptionId,
        testnet: true
      })
      
      console.log(\`[Cycle \${cycleCount}] Subscription active: \${status.isSubscribed}\`)
      console.log(\`[Cycle \${cycleCount}] Remaining charge in period: \${status.remainingChargeInPeriod}\`)
      
      if (!status.isSubscribed) {
        console.log(\`[Cycle \${cycleCount}] ❌ Subscription is no longer active - stopping monitor\`)
        break
      }
      
      // Calculate time until next period
      const now = Date.now()
      const nextPeriodStart = status.nextPeriodStart
      const millisecondsUntilNextPeriod = nextPeriodStart - now
      const secondsUntilNextPeriod = Math.floor(millisecondsUntilNextPeriod / 1000)
      
      if (millisecondsUntilNextPeriod > 0) {
        console.log(\`[Cycle \${cycleCount}] ⏳ Waiting \${secondsUntilNextPeriod}s until next period starts...\`)
        await new Promise(resolve => setTimeout(resolve, millisecondsUntilNextPeriod))
      }
      
      // Charge for the new period
      console.log(\`[Cycle \${cycleCount}] 💳 Charging subscription...\`)
      const chargeResult = await base.subscription.charge({
        id: subscriptionId,
        amount: "max-remaining-charge",
        testnet: true
      })
      
      console.log(\`[Cycle \${cycleCount}] ✅ Charge successful!\`)
      console.log(\`[Cycle \${cycleCount}] Transaction: \${chargeResult.transactionHash}\`)
      console.log(\`[Cycle \${cycleCount}] Amount charged: \${chargeResult.amount}\`)
      
    } catch (error) {
      console.error(\`[Cycle \${cycleCount}] ❌ Error in charge cycle:\`, error.message)
      console.log(\`[Cycle \${cycleCount}] Waiting 60s before retry...\`)
      await new Promise(resolve => setTimeout(resolve, 60000))
    }
  }
  
  if (maxCycles !== null) {
    console.log(\`\\n✅ Completed \${cycleCount} charge cycles\`)
  }
  
  return {
    cyclesCompleted: cycleCount,
    message: 'Charge monitor completed'
  }
}

// Execute the cron job
// Replace '0x...' with actual subscription ID
return await collectRecurringCharges('0x...')`;

// Quick Tips
export const BE_GET_OR_CREATE_WALLET_TIPS = [
  'This function creates a new wallet or retrieves an existing one',
  'The wallet is stored securely and associated with your CDP API credentials',
  'This is the wallet that will receive subscription payments',
  'Save the wallet address for use in the subscribe function',
  'Optional: use walletName parameter to create a custom-named wallet',
];

export const FE_SUBSCRIBE_TIPS = [
  'Get testnet USDC at <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">https://faucet.circle.com/</a> - select "Base Sepolia"',
  'subscriptionOwner is your application\'s address that will control the subscription',
  'recurringCharge is the amount of USDC to charge per period (e.g., "10.50" = $10.50)',
  'Optional: use overridePeriodInSecondsForTestnet (testnet only) for fast testing (e.g., 10 = 10 second period)',
  'Optional: set requireBalance: false to skip balance check',
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
  'Use "max-remaining-charge" to charge the maximum remaining amount',
  'Optional: specify a recipient address to receive the USDC',
];

export const BE_GET_STATUS_TIPS = [
  'Same function as frontend, but typically called from your backend',
  'Use this to verify subscription status before granting access',
  'Check isSubscribed and remainingChargeInPeriod fields',
];

export const BE_REVOKE_TIPS = [
  'Once revoked, no more charges can be made',
  'The subscription payer can also revoke from their wallet',
];

export const RECURRING_CHARGE_CRON_TIPS = [
  'This demo executes automatically and shows real-time output for each charging cycle',
  'By default, runs for 3 cycles - set maxCycles to null for continuous operation',
  'Each cycle checks subscription status, waits for the next period, then charges',
  'In production, use a proper scheduler like node-cron, bull queue, or cloud-based schedulers',
  'Store subscription IDs in a database and iterate through active subscriptions',
  'Use "max-remaining-charge" to collect the full recurring amount each period',
];
