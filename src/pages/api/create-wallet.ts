import type { NextApiRequest, NextApiResponse } from 'next';
import { base } from '@base-org/account/node';

const WALLET_NAME = 'subscription-playground-v1';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get or create a CDP smart wallet to act as the subscription owner
    const owner = await base.subscription.getOrCreateSubscriptionOwnerWallet({
      cdpApiKeyId: process.env.CDP_API_KEY_ID,
      cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
      cdpWalletSecret: process.env.CDP_WALLET_SECRET,
      walletName: WALLET_NAME,
    });
    
    // Return the smart wallet address
    return res.status(200).json({
      address: owner.address,
      walletName: owner.walletName,
      message: 'CDP smart wallet ready for subscription management'
    });
  } catch (error: any) {
    console.error('Error creating/retrieving wallet:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Failed to create/retrieve wallet'
    });
  }
}


