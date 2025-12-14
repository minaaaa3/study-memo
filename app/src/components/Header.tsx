'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { SearchDialog, SearchButton } from './SearchDialog';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cmd+K で検索ダイアログを開く
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 truncate"
          >
            Web開発 基礎から実践まで
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-4">
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ホーム
            </Link>
            <Link
              href="/docs/01-web-basics/01-what-is-web"
              className="text-gray-600 hover:text-gray-900"
            >
              学習を始める
            </Link>
            <Link
              href="/glossary"
              className="text-gray-600 hover:text-gray-900"
            >
              用語集
            </Link>
            <UserMenu />
          </nav>

          {/* モバイルナビゲーション */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
              aria-label="検索"
            >
              <svg
                className="w-5 h-5"
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
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* 検索ダイアログ */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
