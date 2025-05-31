import { MiniKit } from '@worldcoin/minikit-js';
import { signIn } from 'next-auth/react';
import { getNewNonces } from './server-helpers';

export const walletAuth = async () => {
  const { nonce, signedNonce } = await getNewNonces();

  if (MiniKit.commandsAsync?.walletAuth) {
    const result = await MiniKit.commandsAsync.walletAuth({
      nonce,
      expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
      notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000), // -1 day
      statement: `Authenticate (${crypto.randomUUID().replace(/-/g, '')}).`
    });

    console.log('Wallet auth result:', result);

    if (!result || result.finalPayload?.status !== 'success') {
      console.warn('Wallet authentication failed');
      return;
    }

    await signIn('credentials', {
      redirectTo: '/home',
      nonce,
      signedNonce,
      finalPayloadJson: JSON.stringify(result.finalPayload)
    });
  } else {
    console.warn('⚠️ walletAuth is not available — using mock data for local dev.');

    const mockPayload = {
      status: 'success',
      user_id: 'mock-user-id'
    };

    await signIn('credentials', {
      redirectTo: '/home',
      nonce,
      signedNonce,
      finalPayloadJson: JSON.stringify(mockPayload)
    });
  }
};

