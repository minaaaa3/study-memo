'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { glossaryTerms, type GlossaryTerm } from '@/data/glossary';
import { useSearch } from '@/contexts/SearchContext';

interface SearchResult {
  type: 'doc' | 'glossary';
  title: string;
  description?: string;
  href: string;
  category?: string;
  matchedContent?: string; // 本文マッチのプレビュー
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { navSections } = useSearch();

  // 検索実行
  const search = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      // ドキュメント検索（ナビゲーションデータから）
      navSections.forEach((section) => {
        section.items.forEach((item) => {
          const titleMatch =
            item.title.toLowerCase().includes(lowerQuery) ||
            section.title.toLowerCase().includes(lowerQuery);
          const contentMatch =
            item.searchContent?.toLowerCase().includes(lowerQuery);

          if (titleMatch || contentMatch) {
            // 本文にマッチした場合、マッチ周辺のテキストを抽出
            let matchedContent: string | undefined;
            if (contentMatch && item.searchContent) {
              const content = item.searchContent;
              const matchIndex = content.toLowerCase().indexOf(lowerQuery);
              if (matchIndex !== -1) {
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(content.length, matchIndex + lowerQuery.length + 50);
                matchedContent =
                  (start > 0 ? '...' : '') +
                  content.slice(start, end) +
                  (end < content.length ? '...' : '');
              }
            }

            searchResults.push({
              type: 'doc',
              title: item.title,
              description: section.title,
              href: item.href,
              category: 'ドキュメント',
              matchedContent,
            });
          }
        });
      });

      // 用語集検索
      glossaryTerms.forEach((term: GlossaryTerm) => {
        if (
          term.term.toLowerCase().includes(lowerQuery) ||
          term.description.toLowerCase().includes(lowerQuery) ||
          term.reading?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            type: 'glossary',
            title: term.term,
            description:
              term.description.slice(0, 80) +
              (term.description.length > 80 ? '...' : ''),
            href: `/glossary?term=${term.id}`,
            category: '用語集',
          });
        }
      });

      setResults(searchResults.slice(0, 10)); // 最大10件
      setSelectedIndex(0);
    },
    [navSections]
  );

  // 検索クエリの変更を監視
  useEffect(() => {
    search(query);
  }, [query, search]);

  // ダイアログが開いたらフォーカス
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* ダイアログ */}
      <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* 検索入力 */}
          <div className="flex items-center border-b border-gray-200 px-4">
            <svg
              className="w-5 h-5 text-gray-400"
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
            <input
              ref={inputRef}
              type="text"
              placeholder="ドキュメントや用語を検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-4 outline-none text-gray-900 placeholder-gray-400"
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
              ESC
            </kbd>
          </div>

          {/* 検索結果 */}
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-2">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.href}`}>
                  <button
                    onClick={() => {
                      router.push(result.href);
                      onClose();
                    }}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 ${
                      index === selectedIndex
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded ${
                        result.type === 'doc'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      } flex items-center justify-center`}
                    >
                      {result.type === 'doc' ? (
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {result.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          {result.category}
                        </span>
                      </div>
                      {result.matchedContent ? (
                        <p className="text-sm text-gray-500 truncate">
                          {result.matchedContent}
                        </p>
                      ) : result.description ? (
                        <p className="text-sm text-gray-500 truncate">
                          {result.description}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>「{query}」に一致する結果がありません</p>
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <p className="text-sm">ドキュメントや用語を検索できます</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded">HTTP</span>
                <span className="px-2 py-1 bg-gray-100 rounded">API</span>
                <span className="px-2 py-1 bg-gray-100 rounded">認証</span>
                <span className="px-2 py-1 bg-gray-100 rounded">サーバー</span>
              </div>
            </div>
          )}

          {/* フッター */}
          <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↓</kbd>
                <span>で選択</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Enter</kbd>
                <span>で開く</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 検索ボタン
export function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <svg
        className="w-4 h-4"
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
      <span className="hidden sm:inline">検索</span>
      <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-xs bg-white text-gray-400 rounded border border-gray-200">
        ⌘K
      </kbd>
    </button>
  );
}
