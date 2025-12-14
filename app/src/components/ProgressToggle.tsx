'use client';

import { useState } from 'react';
import { useProgress } from '@/contexts/ProgressContext';
import Link from 'next/link';

interface ProgressToggleProps {
  slug: string;
}

export function ProgressToggle({ slug }: ProgressToggleProps) {
  const { isCompleted, toggleProgress, isAuthenticated } = useProgress();
  const [isUpdating, setIsUpdating] = useState(false);
  const completed = isCompleted(slug);

  const handleToggle = async () => {
    setIsUpdating(true);
    await toggleProgress(slug, !completed);
    setIsUpdating(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-blue-700">
            学習の進捗を記録するにはログインしてください
          </span>
        </div>
        <Link
          href="/auth/signin"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ログイン
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            completed
              ? 'bg-green-500 border-green-500'
              : 'bg-white border-gray-300 hover:border-green-400'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={completed ? 'この章を未完了にする' : 'この章を完了にする'}
        >
          {completed && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
        <span className="text-sm text-gray-700">
          {completed ? 'この章は完了しました' : 'この章を完了としてマークする'}
        </span>
      </div>
      {isUpdating && (
        <svg
          className="w-5 h-5 text-gray-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
    </div>
  );
}
