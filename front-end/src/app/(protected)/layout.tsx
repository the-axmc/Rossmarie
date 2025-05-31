"use client"; // Required for using client-side hooks

import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';
import { useNftOwnership } from '@/hooks/useNftOwnership'; // Adjust path if necessary
import { useSession } from "next-auth/react"; // For client-side session check
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For client-side redirect

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { ownsNft, isLoading: isNftLoading } = useNftOwnership();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log('Not authenticated by next-auth, redirecting to /');
      router.replace('/'); // Redirect to home/login page
    }
  }, [status, router]);

  if (status === "loading" || isNftLoading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          Loading access information...
        </div>
        <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
          <Navigation />
        </Page.Footer>
      </Page>
    );
  }

  if (!ownsNft) {
    return (
      <Page>
        <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
          <h1>Access Denied</h1>
          <p>You need to own the specific FinanceDApp NFT to access this section.</p>
          <p>Please connect your wallet and ensure you hold the required NFT.</p>
          {process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS && process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
            <p>NFT Contract: {process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}</p>
          )}
        </div>
        <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
          <Navigation />
        </Page.Footer>
      </Page>
    );
  }

  // If session is authenticated by next-auth and user owns NFT
  if (status === "authenticated" && ownsNft) {
    return (
      <Page>
        {children}
        <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
          <Navigation />
        </Page.Footer>
      </Page>
    );
  }

  // Fallback or if still authenticating, show loading.
  // This case should ideally be handled by the loading check above or session redirect.
  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        Verifying access...
      </div>
      <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer>
    </Page>
  );
}
