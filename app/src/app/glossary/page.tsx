'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  glossaryTerms,
  getAllCategories,
  getTermById,
  type GlossaryTerm,
} from '@/data/glossary';

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  const categories = useMemo(() => getAllCategories(), []);

  const filteredTerms = useMemo(() => {
    let terms = [...glossaryTerms];

    // カテゴリでフィルタリング
    if (selectedCategory) {
      terms = terms.filter((term) => term.category === selectedCategory);
    }

    // 検索クエリでフィルタリング
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      terms = terms.filter(
        (term) =>
          term.term.toLowerCase().includes(lowerQuery) ||
          term.description.toLowerCase().includes(lowerQuery) ||
          term.reading?.toLowerCase().includes(lowerQuery)
      );
    }

    // 用語名でソート
    return terms.sort((a, b) => a.term.localeCompare(b.term, 'ja'));
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (termId: string) => {
    setExpandedTermId(expandedTermId === termId ? null : termId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">用語集</h1>
      <p className="text-gray-600 mb-8">
        Web開発に関する用語を検索・閲覧できます。
      </p>

      {/* 検索ボックス */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="用語を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 検索結果数 */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredTerms.length} 件の用語
        {searchQuery && ` 「${searchQuery}」の検索結果`}
        {selectedCategory && ` (${selectedCategory})`}
      </div>

      {/* 用語リスト */}
      <div className="space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>該当する用語が見つかりませんでした</p>
          </div>
        ) : (
          filteredTerms.map((term) => (
            <TermCard
              key={term.id}
              term={term}
              isExpanded={expandedTermId === term.id}
              onToggle={() => toggleExpand(term.id)}
              onTermClick={(id) => {
                setExpandedTermId(id);
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            />
          ))
        )}
      </div>

      {/* ホームに戻るリンク */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}

interface TermCardProps {
  term: GlossaryTerm;
  isExpanded: boolean;
  onToggle: () => void;
  onTermClick: (id: string) => void;
}

function TermCard({ term, isExpanded, onToggle, onTermClick }: TermCardProps) {
  return (
    <div
      className={`border rounded-lg transition-all ${
        isExpanded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{term.term}</span>
          {term.reading && (
            <span className="text-sm text-gray-500">({term.reading})</span>
          )}
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            {term.category}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
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
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <p className="text-gray-700 mb-3">{term.description}</p>

          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 mr-2">関連用語:</span>
              <div className="inline-flex flex-wrap gap-1">
                {term.relatedTerms.map((relatedId) => {
                  const relatedTerm = getTermById(relatedId);
                  if (!relatedTerm) return null;
                  return (
                    <button
                      key={relatedId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTermClick(relatedId);
                      }}
                      className="px-2 py-0.5 bg-white border border-gray-300 rounded text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {relatedTerm.term}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
