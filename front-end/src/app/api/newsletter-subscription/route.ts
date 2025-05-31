import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseAbiItem, publicActions, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains'; // Or your desired chain
import 'dotenv/config';

// THIS IS A PLACEHOLDER ABI - REPLACE WITH YOUR ACTUAL ABI
const scoringContractAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "quizCompletions",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "hasSubscribedToNewsletter",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "hasBookedCall",
            "type": "bool"
          }
        ],
        "indexed": false,
        "internalType": "struct Scoring.UserScore",
        "name": "score",
        "type": "tuple"
      }
    ],
    "name": "ScoreUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserScore",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "quizCompletions",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "hasSubscribedToNewsletter",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "hasBookedCall",
            "type": "bool"
          }
        ],
        "internalType": "struct Scoring.UserScore",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "submitQuizAttestation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "booked",
        "type": "bool"
      }
    ],
    "name": "updateCallBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "subscribed",
        "type": "bool"
      }
    ],
    "name": "updateNewsletterSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userScores",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "quizCompletions",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "hasSubscribedToNewsletter",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "hasBookedCall",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Ensure environment variables are set
const contractAddress = process.env.SCORING_CONTRACT_ADDRESS as Address;
const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY as `0x${string}`;
const rpcUrl = process.env.RPC_URL;

if (!contractAddress || !privateKey || !rpcUrl) {
  console.error("Missing environment variables: SCORING_CONTRACT_ADDRESS, BACKEND_WALLET_PRIVATE_KEY, or RPC_URL");
  // In a real app, you might throw an error or have a more robust config check
}

const account = privateKeyToAccount(privateKey);

const walletClient = createWalletClient({
  account,
  chain: sepolia, // Or your desired chain
  transport: http(rpcUrl),
}).extend(publicActions);


export async function POST(req: NextRequest) {
  if (!contractAddress || !privateKey || !rpcUrl) {
    return NextResponse.json({ error: 'Server configuration error: Missing environment variables.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const userAddress = body.address as Address;
    const subscribed = body.subscribed as boolean; // true or false

    if (!userAddress || typeof subscribed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body: address and subscribed status (boolean) are required.' }, { status: 400 });
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
        return NextResponse.json({ error: 'Invalid user address format.' }, { status: 400 });
    }

    const { request } = await walletClient.simulateContract({
        address: contractAddress,
        abi: scoringContractAbi,
        functionName: 'updateNewsletterSubscription',
        args: [userAddress, subscribed],
        account, // The contract owner
    });

    const hash = await walletClient.writeContract(request);

    // Optionally, wait for the transaction to be mined
    // const receipt = await walletClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({ success: true, message: `Newsletter subscription updated for ${userAddress}. Transaction hash: ${hash}` });

  } catch (error: any) {
    console.error("Error updating newsletter subscription:", error);
    // Distinguish between contract errors and other errors
    if (error.shortMessage) {
        return NextResponse.json({ error: `Contract interaction error: ${error.shortMessage}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to update newsletter subscription.', details: error.message }, { status: 500 });
  }
}
