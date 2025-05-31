"use client";

import { useState } from 'react';
import { Quiz, Question } from '@/components/Quiz'; // Adjust path if necessary
import { Page } from '@/components/PageLayout';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import { Address } from 'viem';

// Import the ABI
import ScoringAbiJson from '@/abi/Scoring.json'; // Importing the JSON ABI

const scoringContractAbi = ScoringAbiJson.abi; // Extract ABI from imported JSON

// Get Scoring contract address from environment variable
const scoringContractAddress = process.env.NEXT_PUBLIC_SCORING_CONTRACT_ADDRESS as Address;

const mockQuizQuestions: Question[] = [
  {
    id: 'q1',
    text: 'What is the primary purpose of a blockchain?',
    options: [
      { text: 'To store images securely', isCorrect: false },
      { text: 'To provide a decentralized and immutable ledger', isCorrect: true },
      { text: 'To speed up internet browsing', isCorrect: false },
      { text: 'To manage social media accounts', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    text: 'Which of the following is a common use case for NFTs?',
    options: [
      { text: 'Sending encrypted emails', isCorrect: false },
      { text: 'Tracking physical goods in a supply chain', isCorrect: false },
      { text: 'Representing ownership of digital art', isCorrect: true },
      { text: 'Calculating complex mathematical equations', isCorrect: false },
    ],
  },
  {
    id: 'q3',
    text: 'What does "DeFi" stand for?',
    options: [
      { text: 'Decentralized Finance', isCorrect: true },
      { text: 'Distributed File System', isCorrect: false },
      { text: 'Digital Foundation', isCorrect: false },
      { text: 'Delegated Funding Initiative', isCorrect: false },
    ],
  },
];

const PASS_THRESHOLD = 2; // User needs to answer at least 2 questions correctly

export default function QuizPage() {
  const { address: userAddress, isConnected } = useAccount();
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, error: txError } = useWaitForTransactionReceipt({ hash });

  const handleQuizFinished = async (score: number, totalQuestions: number, passed: boolean) => {
    setQuizResult({ score, total: totalQuestions, passed });
    setSubmissionMessage(null); // Clear previous messages

    if (passed) {
      if (!isConnected || !userAddress) {
        setSubmissionMessage("Please connect your wallet to submit your quiz attestation.");
        return;
      }
      if (!scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000") {
        setSubmissionMessage("Scoring contract address is not configured. Cannot submit attestation.");
        console.error("Scoring contract address not set in .env NEXT_PUBLIC_SCORING_CONTRACT_ADDRESS");
        return;
      }

      try {
        console.log("Attempting to call submitQuizAttestation on", scoringContractAddress);
        writeContract({
          address: scoringContractAddress,
          abi: scoringContractAbi,
          functionName: 'submitQuizAttestation',
          // args: [], // No arguments for this function
        });
      } catch (e: any) {
        console.error("Error preparing contract write:", e);
        setSubmissionMessage(`Error preparing transaction: ${e.message}`);
      }
    } else {
      setSubmissionMessage("You did not pass the quiz. Attestation not submitted.");
    }
  };

  if (!scoringContractAddress || scoringContractAddress === "0x0000000000000000000000000000000000000000") {
     console.warn("Warning: NEXT_PUBLIC_SCORING_CONTRACT_ADDRESS is not defined or is a placeholder. Quiz attestation submission will not work.");
  }


  return (
    <Page>
      <Page.Header title="Crypto Knowledge Quiz" />
      <Page.Body className="p-4 md:p-6">
        {!quizResult ? (
          <Quiz questions={mockQuizQuestions} passThreshold={PASS_THRESHOLD} onQuizSubmit={handleQuizFinished} />
        ) : (
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quiz Results</h2>
            <p className="text-lg">Your score: {quizResult.score} / {quizResult.total}</p>
            {quizResult.passed ? (
              <p className="text-green-500 dark:text-green-400 font-medium">Congratulations, you passed!</p>
            ) : (
              <p className="text-red-500 dark:text-red-400 font-medium">You did not pass. Better luck next time.</p>
            )}

            {isWritePending && <p className="mt-4 text-blue-500 dark:text-blue-400">Submitting your attestation to the blockchain... Please confirm in your wallet.</p>}
            {isTxLoading && <p className="mt-4 text-blue-500 dark:text-blue-400">Transaction is processing... (Hash: {hash})</p>}
            {isTxSuccess && <p className="mt-4 text-green-500 dark:text-green-400">Attestation submitted successfully! Your score has been recorded on-chain.</p>}

            {writeError && <p className="mt-4 text-red-500 dark:text-red-400">Error submitting: {writeError.message}</p>}
            {txError && <p className="mt-4 text-red-500 dark:text-red-400">Transaction error: {txError.message}</p>}
            {submissionMessage && !isWritePending && !isTxLoading && !isTxSuccess && !writeError && !txError && (
              <p className={`mt-4 ${quizResult.passed && isConnected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{submissionMessage}</p>
            )}

            {!quizResult.passed && (
                 <Button onClick={() => setQuizResult(null)} className="mt-6">Try Again</Button>
            )}
          </div>
        )}
      </Page.Body>
    </Page>
  );
}
