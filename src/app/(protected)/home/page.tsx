"use client";

import { useState, useEffect } from 'react';
import { Page } from '@/components/PageLayout';
import { UserScoreDisplay, UserScoreData } from '@/components/UserScoreDisplay';
import { Button } from '@worldcoin/mini-apps-ui-kit-react'; // Or your preferred button
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import ScoringAbiJson from '@/abi/Scoring.json'; // Import the ABI
import { TopBar, Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { useSession } from 'next-auth/react'; // For client-side session

const scoringContractAbi = ScoringAbiJson.abi;
const scoringContractAddress = process.env.NEXT_PUBLIC_SCORING_CONTRACT_ADDRESS as Address;

// Helper function for API calls
async function updateBackend(endpoint: string, userAddress: Address, status: boolean) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: userAddress, [endpoint.includes('newsletter') ? 'subscribed' : 'booked']: status }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update status');
  }
  return response.json();
}


export default function HomePage() {
  const { data: session } = useSession(); // Get session client-side
  const { address: userAddress, isConnected } = useAccount();

  // Wagmi hook to read user score
  const { data: userScore, isLoading: isScoreLoading, error: scoreError, refetch: refetchUserScore } = useReadContract({
    abi: scoringContractAbi,
    address: scoringContractAddress,
    functionName: 'getUserScore',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: isConnected && !!userAddress && !!scoringContractAddress && scoringContractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const [newsletterStatus, setNewsletterStatus] = useState(false);
  const [callBookedStatus, setCallBookedStatus] = useState(false);
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (userScore) {
      // userScore is type readonly [bigint, boolean, boolean] & { __mode: "prepared"; }
      // or UserScoreData if using a transform function in useReadContract
      // For now, let's assume it's the tuple and cast/map it
      const scoreData = userScore as unknown as [bigint, boolean, boolean];
      setNewsletterStatus(scoreData[1]);
      setCallBookedStatus(scoreData[2]);
    }
  }, [userScore]);

  useEffect(() => {
    if (!scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000") {
        console.warn("Warning: NEXT_PUBLIC_SCORING_CONTRACT_ADDRESS is not defined or is a placeholder. Score display and updates will not work correctly.");
    }
  }, []);

  const handleToggleSubscription = async () => {
    if (!userAddress) {
      setApiError({ ...apiError, newsletter: "Please connect your wallet." });
      return;
    }
    setApiLoading({ ...apiLoading, newsletter: true });
    setApiError({ ...apiError, newsletter: null });
    try {
      await updateBackend('/api/newsletter-subscription', userAddress, !newsletterStatus);
      setNewsletterStatus(!newsletterStatus); // Optimistic update or update after refetch
      refetchUserScore(); // Re-fetch score from contract
      setApiLoading({ ...apiLoading, newsletter: false });
    } catch (e: any) {
      setApiLoading({ ...apiLoading, newsletter: false });
      setApiError({ ...apiError, newsletter: e.message });
    }
  };

  const handleToggleCallBooking = async () => {
    if (!userAddress) {
      setApiError({ ...apiError, call: "Please connect your wallet." });
      return;
    }
    setApiLoading({ ...apiLoading, call: true });
    setApiError({ ...apiError, call: null });
    try {
      // Assuming booking a call always sets it to true. If it's a toggle, logic needs adjustment.
      await updateBackend('/api/book-call', userAddress, !callBookedStatus);
      setCallBookedStatus(!callBookedStatus); // Optimistic update or update after refetch
      refetchUserScore(); // Re-fetch score from contract
      setApiLoading({ ...apiLoading, call: false });
    } catch (e: any) {
      setApiLoading({ ...apiLoading, call: false });
      setApiError({ ...apiError, call: e.message });
    }
  };

  // Map the raw userScore from useReadContract (which might be a tuple) to UserScoreData
  const formattedUserScore: UserScoreData | null = userScore
    ? {
        quizCompletions: (userScore as unknown as [bigint, boolean, boolean])[0],
        hasSubscribedToNewsletter: (userScore as unknown as [bigint, boolean, boolean])[1],
        hasBookedCall: (userScore as unknown as [bigint, boolean, boolean])[2],
      }
    : null;

  return (
    <>
      <Page.Header className="p-0 sticky top-0 z-10 bg-white dark:bg-black">
         {/* Simplified TopBar for client component, adapt as needed */}
        <TopBar title="Dashboard" />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-6 p-4 md:p-6 mb-16">
        <div className="w-full max-w-2xl space-y-6">
          <UserScoreDisplay
            score={formattedUserScore}
            isLoading={isScoreLoading || (isConnected && !userScore && !scoreError)} // Show loading if connected but no score yet
            error={scoreError?.message}
          />

          {/* Newsletter Subscription Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Newsletter Subscription</h3>
            <Button
              onClick={handleToggleSubscription}
              variant={newsletterStatus ? 'destructive' : 'primary'}
              disabled={apiLoading.newsletter || !isConnected || !scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000"}
              className="w-full md:w-auto"
            >
              {apiLoading.newsletter ? 'Processing...' : (newsletterStatus ? 'Unsubscribe' : 'Subscribe')}
            </Button>
            {apiError.newsletter && <p className="text-red-500 dark:text-red-400 mt-2">{apiError.newsletter}</p>}
          </div>

          {/* 1:1 Call Booking Section */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Book a 1:1 Call</h3>
            <Button
              onClick={handleToggleCallBooking}
              variant={callBookedStatus ? 'secondary' : 'primary'} // 'secondary' if already booked, or disable
              disabled={apiLoading.call || !isConnected || callBookedStatus || !scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000"} // Disable if already booked
              className="w-full md:w-auto"
            >
              {apiLoading.call ? 'Processing...' : (callBookedStatus ? 'Call Booked' : 'Book Call')}
            </Button>
            {callBookedStatus && <p className="text-green-500 dark:text-green-400 mt-2">You have already booked a call. Manage bookings elsewhere.</p>}
            {apiError.call && <p className="text-red-500 dark:text-red-400 mt-2">{apiError.call}</p>}
          </div>

          {(!isConnected || !scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000") && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-700 rounded-lg text-yellow-700 dark:text-yellow-100">
                {!isConnected && <p>Please connect your wallet to view your score and interact.</p>}
                {(!scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000") && <p>Engagement scoring features are currently unavailable. Please check back later.</p>}
            </div>
          )}
        </div>
      </Page.Main>
    </>
  );
}
