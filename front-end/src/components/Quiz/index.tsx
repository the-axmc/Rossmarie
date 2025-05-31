"use client";

import { useState } from 'react';
import { Button } from '@worldcoin/mini-apps-ui-kit-react'; // Using existing button

export interface Question {
  id: string;
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

interface QuizProps {
  questions: Question[];
  passThreshold?: number; // Number of correct answers to pass
  onQuizSubmit: (score: number, totalQuestions: number, passed: boolean) => void;
}

export function Quiz({ questions, passThreshold = 1, onQuizSubmit }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOptionText }
  const [score, setScore] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionText: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionText,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    questions.forEach(q => {
      const selectedOptionText = selectedAnswers[q.id];
      const correctOption = q.options.find(opt => opt.isCorrect);
      if (selectedOptionText && correctOption && selectedOptionText === correctOption.text) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    const passed = calculatedScore >= passThreshold;
    onQuizSubmit(calculatedScore, questions.length, passed);
  };

  if (score !== null) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Quiz Completed!</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Your score: {score} / {questions.length}
        </p>
        {score >= passThreshold ? (
            <p className="text-lg font-medium text-green-500 dark:text-green-400">Congratulations, you passed!</p>
        ) : (
            <p className="text-lg font-medium text-red-500 dark:text-red-400">You did not pass. Better luck next time!</p>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return <p>No questions available.</p>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">Question {currentQuestionIndex + 1} of {questions.length}</h2>
      <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">{currentQuestion.text}</p>
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(option.text)}
            className={`block w-full text-left p-3 rounded-md border transition-colors
                        ${selectedAnswers[currentQuestion.id] === option.text
                            ? 'bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600'
                            : 'bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
          >
            {option.text}
          </button>
        ))}
      </div>
      {currentQuestionIndex < questions.length - 1 ? (
        <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.id]} className="w-full md:w-auto">
          Next
        </Button>
      ) : (
        <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestion.id]} className="w-full md:w-auto">
          Submit
        </Button>
      )}
    </div>
  );
}
