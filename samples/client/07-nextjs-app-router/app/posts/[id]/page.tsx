/**
 * 投稿詳細ページ（動的ルート）
 *
 * app/posts/[id]/page.tsx → /posts/:id のルート
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getPosts } from '@/lib/db';
import type { Metadata } from 'next';

// 動的メタデータ
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPost(params.id);

  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: post.title,
    description: post.content?.slice(0, 160),
  };
}

// 静的生成するパスを指定（SSG）
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(params.id);

  // 投稿が見つからない場合は404
  if (!post) {
    notFound();
  }

  return (
    <article>
      <Link
        href="/posts"
        className="text-blue-500 hover:underline mb-4 inline-block"
      >
        ← 一覧に戻る
      </Link>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="text-gray-500 mb-6">
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {post.author && <span className="ml-4">by {post.author}</span>}
      </div>

      <div className="prose max-w-none">
        {post.content?.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t">
        <Link
          href={`/posts/${params.id}/edit`}
          className="text-blue-500 hover:underline"
        >
          編集する
        </Link>
      </div>
    </article>
  );
}

/*
 * 動的ルートの特徴:
 *
 * 1. パラメータの取得
 *    [id] → params.id
 *    [slug] → params.slug
 *
 * 2. generateStaticParams
 *    ビルド時に静的生成するパスを指定
 *    指定外のパスはオンデマンドで生成
 *
 * 3. notFound()
 *    not-found.tsx を表示
 *    自動で404ステータス
 *
 * 4. 動的メタデータ
 *    generateMetadata() でSEO最適化
 */
