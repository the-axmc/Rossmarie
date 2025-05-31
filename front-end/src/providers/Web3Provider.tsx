"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes'; // Assuming next-themes is used for light/dark mode

const queryClient = new QueryClient();

// Get project ID from WalletConnect
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Error: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. Please add it to your .env.local file");
}

const config = getDefaultConfig({
  appName: 'Finance DApp',
  projectId: projectId,
  chains: [mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme(); // Get current theme

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
