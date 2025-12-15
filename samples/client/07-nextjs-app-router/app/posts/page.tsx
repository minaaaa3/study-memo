/**
 * 投稿一覧ページ（Server Component）
 *
 * app/posts/page.tsx → /posts のルート
 */

import Link from 'next/link';
import { getPosts } from '@/lib/db';
import type { Metadata } from 'next';

// ページ固有のメタデータ
export const metadata: Metadata = {
  title: '投稿一覧',
  description: '全ての投稿を表示します',
};

// キャッシュ設定
export const revalidate = 60; // 60秒ごとに再検証

export default async function PostsPage() {
  // Server Componentなので直接DBアクセス可能
  const posts = await getPosts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">投稿一覧</h1>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-500">投稿がありません</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-lg font-semibold text-blue-600 hover:underline">
                  {post.title}
                </h2>
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {post.content}
                </p>
                <div className="text-sm text-gray-400 mt-2">
                  {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/*
 * データフェッチの特徴:
 *
 * 1. Server Component でフェッチ
 *    - useEffect 不要
 *    - ローディング状態の管理不要
 *    - エラー処理は error.tsx に任せる
 *
 * 2. キャッシュ
 *    - revalidate でISR（Incremental Static Regeneration）
 *    - fetch() は自動でキャッシュ
 *
 * 3. 並列フェッチ
 *    const [posts, users] = await Promise.all([
 *      getPosts(),
 *      getUsers(),
 *    ]);
 */
