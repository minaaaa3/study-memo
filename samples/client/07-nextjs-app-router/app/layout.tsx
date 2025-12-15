/**
 * ルートレイアウト
 *
 * すべてのページで共有されるレイアウト。
 * html, body タグはここでのみ定義。
 */

import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import './globals.css';

// メタデータ（SEO）
export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
  description: 'Next.js App Router サンプル',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {/* Server Component: DBアクセス可能 */}
        <Header />

        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="text-center py-4 text-gray-500">
          © 2024 My App
        </footer>
      </body>
    </html>
  );
}

/*
 * レイアウトの特徴:
 *
 * 1. ネスト可能
 *    app/layout.tsx     → 全ページ
 *    app/posts/layout.tsx → /posts以下のページ
 *
 * 2. 状態保持
 *    ページ遷移してもレイアウトは再レンダリングされない
 *    → ナビゲーションの状態が保持される
 *
 * 3. Server Component
 *    デフォルトでサーバーで実行
 *    DBアクセスやAPI呼び出しが直接可能
 */
