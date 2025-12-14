'use client';

import { useState, type ReactNode } from 'react';

interface WhyButtonProps {
  children: ReactNode;
  title?: string;
}

export function WhyButton({ children, title = 'なぜ？' }: WhyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span>{title}</span>
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="prose prose-sm prose-blue max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// コンセプト説明とWhyButtonを組み合わせたコンポーネント
interface ConceptProps {
  title: string;
  children: ReactNode;
  why?: ReactNode;
}

export function Concept({ title, children, why }: ConceptProps) {
  return (
    <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <div className="text-gray-700">{children}</div>
      {why && <WhyButton>{why}</WhyButton>}
    </div>
  );
}
