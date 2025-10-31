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
    const { subscriptionId, amount, recipient, walletName, testnet = true } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }

    const chargeAmount = amount || '1.00';
    const finalWalletName = walletName || DEFAULT_WALLET_NAME;

    // Build charge options with optional recipient
    const chargeOptions: any = {
      id: subscriptionId,
      amount: chargeAmount,
      testnet,
      walletName: finalWalletName,
      cdpApiKeyId: process.env.CDP_API_KEY_ID,
      cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
      cdpWalletSecret: process.env.CDP_WALLET_SECRET,
    };

    // Add recipient if provided
    if (recipient) {
      chargeOptions.recipient = recipient;
    }

    // Use the CDP server wallet to charge the subscription
    const chargeResult = await base.subscription.charge(chargeOptions);

    console.log(`Successfully charged subscription: ${chargeResult.id}`);
    console.log(`Amount charged: ${chargeResult.amount}`);

    return res.status(200).json({
      success: true,
      transactionHash: chargeResult.id,
      amount: chargeResult.amount,
      subscriptionOwner: chargeResult.subscriptionOwner,
      message: `Successfully charged $${chargeResult.amount} USDC`,
      subscriptionId: chargeResult.subscriptionId,
      ...(chargeResult.recipient && { recipient: chargeResult.recipient })
    });

  } catch (error: any) {
    console.error('Charge failed:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to charge subscription'
    });
  }
}
