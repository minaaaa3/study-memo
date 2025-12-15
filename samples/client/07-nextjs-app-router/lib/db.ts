/**
 * データアクセス層
 *
 * 実際はPrisma等のORMを使用。
 * ここでは学習用にインメモリデータを使用。
 */

export type Post = {
  id: string;
  title: string;
  content: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
};

// インメモリデータ（実際はDB）
const posts: Post[] = [
  {
    id: '1',
    title: 'Next.js App Router入門',
    content: 'App Routerは Next.js 13 で導入された新しいルーティングシステムです。Server Componentsをデフォルトで使用し、より効率的なアプリケーションを構築できます。',
    author: '田中太郎',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Server Components vs Client Components',
    content: 'Server Components はサーバーでのみ実行され、Client Components はブラウザで実行されます。適切に使い分けることでパフォーマンスを最適化できます。',
    author: '山田花子',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
    title: 'データフェッチのベストプラクティス',
    content: 'Next.js App Router では Server Components で直接データを取得できます。useEffect + fetch のパターンは必要ありません。',
    author: '佐藤次郎',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
];

// === 投稿の取得 ===
export async function getPosts(options?: {
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  // 遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 100));

  let result = [...posts];

  if (options?.offset) {
    result = result.slice(options.offset);
  }

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getPost(id: string): Promise<Post | null> {
  await new Promise(resolve => setTimeout(resolve, 50));

  return posts.find(post => post.id === id) || null;
}

// === 投稿の作成 ===
export async function createPost(data: {
  title: string;
  content?: string;
  author?: string;
}): Promise<Post> {
  const now = new Date().toISOString();

  const post: Post = {
    id: String(posts.length + 1),
    title: data.title,
    content: data.content || null,
    author: data.author || null,
    createdAt: now,
    updatedAt: now,
  };

  posts.push(post);

  return post;
}

// === 投稿の更新 ===
export async function updatePost(
  id: string,
  data: { title?: string; content?: string }
): Promise<Post | null> {
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) return null;

  posts[index] = {
    ...posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return posts[index];
}

// === 投稿の削除 ===
export async function deletePost(id: string): Promise<boolean> {
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) return false;

  posts.splice(index, 1);

  return true;
}

/*
 * 実際の実装では:
 *
 * 1. Prisma を使用
 *    import { prisma } from './prisma';
 *
 *    export async function getPosts() {
 *      return prisma.post.findMany({
 *        orderBy: { createdAt: 'desc' },
 *      });
 *    }
 *
 * 2. エラーハンドリング
 *    try-catch でDBエラーを適切に処理
 *
 * 3. 型安全性
 *    Prismaが自動生成する型を使用
 */
