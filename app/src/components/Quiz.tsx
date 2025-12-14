'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { Quiz as QuizType, QuizQuestion } from '@/data/quizzes';

interface QuizProps {
  quiz: QuizType;
}

interface Answer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export function Quiz({ quiz }: QuizProps) {
  const { data: session, status } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const score = answers.filter((a) => a.correct).length;

  const handleSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.correctIndex;
    setShowExplanation(true);

    // Save answer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedIndex: selectedAnswer,
        correct: isCorrect,
      },
    ]);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Submit results to server
      if (session?.user) {
        setIsSubmitting(true);
        try {
          await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: quiz.slug,
              score: score + (selectedAnswer === question.correctIndex ? 1 : 0),
              total: quiz.questions.length,
              answers: [
                ...answers,
                {
                  questionId: question.id,
                  selectedIndex: selectedAnswer,
                  correct: selectedAnswer === question.correctIndex,
                },
              ],
            }),
          });
        } catch (error) {
          console.error('Failed to save quiz result:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
      setShowResult(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setShowExplanation(false);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  // Result screen
  if (showResult) {
    const finalScore = answers.filter((a) => a.correct).length;
    const percentage = Math.round((finalScore / quiz.questions.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">クイズ結果</h3>

        <div className="text-center py-6">
          <div
            className={`text-5xl font-bold mb-2 ${
              isPassing ? 'text-green-600' : 'text-orange-500'
            }`}
          >
            {percentage}%
          </div>
          <div className="text-gray-600">
            {finalScore} / {quiz.questions.length} 問正解
          </div>
        </div>

        <div
          className={`p-4 rounded-lg mb-6 ${
            isPassing ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'
          }`}
        >
          {isPassing ? (
            <p>素晴らしい！この章の内容をよく理解しています。</p>
          ) : (
            <p>もう一度復習してから再チャレンジしてみましょう。</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            もう一度挑戦
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">理解度チェック</h3>
        <span className="text-sm text-gray-500">
          {currentQuestion + 1} / {quiz.questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestion + (showExplanation ? 1 : 0)) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <p className="text-gray-900 font-medium mb-4">{question.question}</p>

      {/* Options */}
      <div className="space-y-2 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctIndex;
          const showCorrectness = showExplanation;

          let buttonClass = 'w-full p-3 text-left rounded-lg border transition-all ';

          if (showCorrectness) {
            if (isCorrect) {
              buttonClass += 'bg-green-50 border-green-500 text-green-800';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'bg-red-50 border-red-500 text-red-800';
            } else {
              buttonClass += 'bg-gray-50 border-gray-200 text-gray-500';
            }
          } else {
            if (isSelected) {
              buttonClass += 'bg-blue-50 border-blue-500 text-blue-800';
            } else {
              buttonClass += 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showExplanation}
              className={buttonClass}
            >
              <span className="flex items-center">
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 text-sm ${
                    showCorrectness && isCorrect
                      ? 'border-green-500 bg-green-500 text-white'
                      : showCorrectness && isSelected && !isCorrect
                      ? 'border-red-500 bg-red-500 text-white'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {showCorrectness && isCorrect && '✓'}
                  {showCorrectness && isSelected && !isCorrect && '✗'}
                  {!showCorrectness && String.fromCharCode(65 + index)}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="p-4 bg-blue-50 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-medium">解説：</span>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!showExplanation ? (
          <button
            onClick={handleCheck}
            disabled={selectedAnswer === null}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            回答を確認
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : isLastQuestion ? '結果を見る' : '次の問題へ'}
          </button>
        )}
      </div>

      {/* Login prompt for non-authenticated users */}
      {!session && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            ログイン
          </Link>
          すると結果が保存されます
        </p>
      )}
    </div>
  );
}
