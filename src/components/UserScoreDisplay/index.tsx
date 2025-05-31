"use client";

import { CheckCircle, XCircle, Calendar, Mail } from 'iconoir-react'; // Using icons for visual cues

export interface UserScoreData {
  quizCompletions: bigint | number; // wagmi useReadContract returns bigint
  hasSubscribedToNewsletter: boolean;
  hasBookedCall: boolean;
}

interface UserScoreDisplayProps {
  score: UserScoreData | null | undefined;
  isLoading: boolean;
  error?: string | null;
}

export function UserScoreDisplay({ score, isLoading, error }: UserScoreDisplayProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400">Error fetching score: {error}</p>;
  }

  if (!score) {
    return <p className="text-gray-600 dark:text-gray-400">No score data available.</p>;
  }

  // Convert bigint to number for display if necessary, or handle as BigInt if operations require it.
  const quizCompletionsDisplay = typeof score.quizCompletions === 'bigint'
    ? score.quizCompletions.toString()
    : score.quizCompletions;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Your Engagement Score</h2>
      <ul className="space-y-3">
        <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
          <Calendar className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
          Quizzes Completed: <span className="font-bold ml-2">{quizCompletionsDisplay}</span>
        </li>
        <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
          <Mail className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />
          Newsletter Subscription:
          {score.hasSubscribedToNewsletter ? (
            <CheckCircle className="w-6 h-6 ml-2 text-green-500 dark:text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 ml-2 text-red-500 dark:text-red-400" />
          )}
        </li>
        <li className="flex items-center text-lg text-gray-700 dark:text-gray-300">
          <CheckCircle className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" /> {/* Generic icon for call booking */}
          1:1 Call Booked:
          {score.hasBookedCall ? (
            <CheckCircle className="w-6 h-6 ml-2 text-green-500 dark:text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 ml-2 text-red-500 dark:text-red-400" />
          )}
        </li>
      </ul>
    </div>
  );
}
