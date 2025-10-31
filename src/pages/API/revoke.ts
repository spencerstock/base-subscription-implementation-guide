import type { NextApiRequest, NextApiResponse } from 'next';
import { base } from '@base-org/account/node';

const DEFAULT_WALLET_NAME = 'subscription-playground-v1';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscriptionId, walletName, testnet = true } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }

    const finalWalletName = walletName || DEFAULT_WALLET_NAME;

    // Use the CDP server wallet to revoke the subscription
    const revokeResult = await base.subscription.revoke({
      id: subscriptionId,
      testnet,
      walletName: finalWalletName,
      cdpApiKeyId: process.env.CDP_API_KEY_ID,
      cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
      cdpWalletSecret: process.env.CDP_WALLET_SECRET,
    });

    console.log(`Successfully revoked subscription: ${subscriptionId}`);

    return res.status(200).json({
      success: true,
      subscriptionId,
      message: 'Subscription revoked successfully',
      revokeResult
    });

  } catch (error: any) {
    console.error('Revoke failed:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to revoke subscription'
    });
  }
}
