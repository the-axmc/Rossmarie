"use client";

import { useAccount, useReadContract } from 'wagmi';
import { Address, parseAbi } from 'viem';
import { useEffect, useState } from 'react';

// Minimal ABI for ERC721 balanceOf function
const erc721Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
]);

// Get NFT contract address from environment variable
const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address;

if (!nftContractAddress) {
  console.warn(
    "Warning: NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is not defined. NFT ownership checks will not work. " +
    "Please add it to your .env.local file. Using a placeholder address."
  );
}
const placeholderNftAddress = '0x0000000000000000000000000000000000000000';


export function useNftOwnership() {
  const { address: userAddress, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [ownsNft, setOwnsNft] = useState(false);

  const contractAddressToUse = nftContractAddress || placeholderNftAddress;

  const { data: balance, error, isLoading: isBalanceLoading, refetch } = useReadContract({
    abi: erc721Abi,
    address: contractAddressToUse,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined, // Pass args only if userAddress is defined
    query: {
      enabled: isConnected && !!userAddress && !!contractAddressToUse && contractAddressToUse !== placeholderNftAddress, // Only run query if connected, address available, and contract address is not placeholder
    },
  });

  useEffect(() => {
    // Update loading state based on query loading state
    setIsLoading(isBalanceLoading);
  }, [isBalanceLoading]);

  useEffect(() => {
    if (!isConnected || !userAddress) {
      setOwnsNft(false);
      setIsLoading(false);
      return;
    }

    if (contractAddressToUse === placeholderNftAddress) {
        console.warn("Using placeholder NFT address for ownership check. This will always return false.");
        setOwnsNft(false);
        setIsLoading(false);
        return;
    }

    if (error) {
      console.error("Error fetching NFT balance:", error);
      setOwnsNft(false);
      setIsLoading(false);
      return;
    }

    if (balance !== undefined && balance !== null) {
      setOwnsNft(balance > 0n); // balance is a BigInt, compare with BigInt zero
      setIsLoading(false);
    }
  }, [balance, error, isConnected, userAddress, contractAddressToUse]);

  // Expose refetch to allow manual re-checking of balance if needed
  return { ownsNft, isLoading, refetchNftBalance: refetch };
}
