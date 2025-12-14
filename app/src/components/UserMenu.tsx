'use client';

import { useSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { useState } from 'react';

interface UserMenuProps {
  initialSession: Session | null;
}

export function UserMenu({ initialSession }: UserMenuProps) {
  // useSessionでリアルタイム更新を監視しつつ、初期値はサーバーから取得した値を使用
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // サーバーから取得したセッション or クライアントで更新されたセッション
  const currentSession = session ?? initialSession;

  if (!currentSession) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/auth/signin"
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          ログイン
        </Link>
        <Link
          href="/auth/signup"
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          {currentSession.user?.name?.[0]?.toUpperCase() || currentSession.user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="hidden md:inline text-sm text-gray-700">
          {currentSession.user?.name || currentSession.user?.email}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {currentSession.user?.name || 'ユーザー'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentSession.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}
