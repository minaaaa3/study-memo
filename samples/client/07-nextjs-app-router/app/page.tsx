/**
 * ホームページ（Server Component）
 *
 * app/page.tsx → / のルート
 */

import Link from 'next/link';
import { Counter } from '@/components/Counter';

// Server Componentでデータ取得
async function getStats() {
  // 実際はDBから取得
  return {
    totalPosts: 42,
    totalUsers: 156,
    lastUpdated: new Date().toISOString(),
  };
}

export default async function HomePage() {
  // Server Componentなのでawait可能
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Welcome to My App</h1>
        <p className="text-gray-600 mt-2">
          Next.js App Router のサンプルアプリケーションです。
        </p>
      </section>

      {/* Server Componentでフェッチしたデータを表示 */}
      <section className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold">{stats.totalPosts}</div>
          <div className="text-gray-600">投稿数</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-gray-600">ユーザー数</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600">最終更新</div>
          <div className="text-sm">{stats.lastUpdated}</div>
        </div>
      </section>

      {/* Client Component を埋め込み */}
      <section>
        <h2 className="text-xl font-bold mb-4">Client Component の例</h2>
        <Counter />
      </section>

      {/* ナビゲーション */}
      <section>
        <h2 className="text-xl font-bold mb-4">ページ一覧</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/posts" className="text-blue-500 hover:underline">
              投稿一覧 →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

/*
 * Server Component の特徴:
 *
 * ✅ できること:
 * - async/await でデータ取得
 * - DBに直接アクセス
 * - 環境変数（秘密情報含む）にアクセス
 * - ファイルシステムにアクセス
 *
 * ❌ できないこと:
 * - useState, useEffect などのフック
 * - onClick などのイベントハンドラ
 * - ブラウザAPIの使用
 *
 * → インタラクティブな部分は Client Component に分離
 */
