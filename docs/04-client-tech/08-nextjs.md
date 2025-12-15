# 4-8. Next.jsの基礎

## 例え話：全部入りの弁当箱

Reactだけだと「ご飯だけ」のようなもの。おかず（ルーティング、API、最適化）を自分で用意する必要があります。

Next.jsは「全部入りの弁当箱」。必要なものが最初から揃っています。

---

## 核心：Next.jsが解決すること

### Reactだけの場合

```
必要なものを自分で選んで設定:
├── ルーティング → react-router
├── サーバーサイドレンダリング → 自分で設定
├── APIエンドポイント → Express + 別プロジェクト
├── 画像最適化 → 別ツール
├── ビルド設定 → webpack
└── デプロイ → 自分で設定
```

### Next.jsなら

```
最初から全部入り:
├── ルーティング → ファイルベース
├── サーバーサイドレンダリング → 組み込み
├── APIエンドポイント → app/api
├── 画像最適化 → next/image
├── ビルド設定 → 不要
└── デプロイ → Vercelで簡単
```

---

## プロジェクト作成

```bash
npx create-next-app@latest my-app

# 対話式の設問
# ✓ TypeScript? → Yes
# ✓ ESLint? → Yes
# ✓ Tailwind CSS? → Yes
# ✓ src/ directory? → Yes
# ✓ App Router? → Yes
# ✓ import alias? → @/*
```

### ディレクトリ構成

```
my-app/
├── src/
│   ├── app/              # App Router（ルーティング）
│   │   ├── layout.tsx    # 共通レイアウト
│   │   ├── page.tsx      # / のページ
│   │   ├── about/
│   │   │   └── page.tsx  # /about のページ
│   │   └── api/
│   │       └── hello/
│   │           └── route.ts  # APIエンドポイント
│   ├── components/       # コンポーネント
│   └── lib/              # ユーティリティ
├── public/               # 静的ファイル
├── next.config.js        # Next.js設定
└── package.json
```

---

## ルーティング（App Router）

### ファイルベースルーティング

```
src/app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/hello-world
├── users/
│   └── [id]/
│       └── page.tsx      → /users/123
└── (auth)/               → URLに影響しないグループ
    ├── login/
    │   └── page.tsx      → /login
    └── register/
        └── page.tsx      → /register
```

### 特殊なファイル

```
page.tsx      → ページ本体
layout.tsx    → 共通レイアウト（ヘッダー、フッターなど）
loading.tsx   → ローディング中の表示
error.tsx     → エラー時の表示
not-found.tsx → 404ページ
```

### ページの書き方

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>ホームページ</h1>
    </main>
  );
}
```

```tsx
// src/app/about/page.tsx
export default function About() {
  return (
    <main>
      <h1>このサイトについて</h1>
    </main>
  );
}
```

### 動的ルート

```tsx
// src/app/blog/[slug]/page.tsx
interface Props {
  params: { slug: string };
}

export default function BlogPost({ params }: Props) {
  return (
    <article>
      <h1>記事: {params.slug}</h1>
    </article>
  );
}

// /blog/hello-world → params.slug = "hello-world"
// /blog/my-first-post → params.slug = "my-first-post"
```

### レイアウト

```tsx
// src/app/layout.tsx
// 全ページに適用されるレイアウト

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>サイトヘッダー</header>
        <main>{children}</main>
        <footer>サイトフッター</footer>
      </body>
    </html>
  );
}
```

```tsx
// src/app/dashboard/layout.tsx
// /dashboard 以下だけに適用されるレイアウト

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <aside>サイドバー</aside>
      <main>{children}</main>
    </div>
  );
}
```

---

## Server Components と Client Components

### Server Components（デフォルト）

サーバーで実行され、HTMLとして送られる。

```tsx
// src/app/users/page.tsx
// デフォルトはServer Component

async function getUsers() {
  const res = await fetch('https://api.example.com/users');
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();  // サーバーで実行される

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Client Components

ブラウザで実行される。useState, useEffectなどを使う場合に必要。

```tsx
// src/components/Counter.tsx
'use client';  // ← これを付けるとClient Component

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 使い分け

```
Server Component（デフォルト）:
├── データ取得
├── バックエンドリソースへのアクセス
├── 秘密情報を使う処理
└── 大きな依存関係を使う処理

Client Component（'use client'）:
├── useState, useEffect を使う
├── イベントハンドラ（onClick など）
├── ブラウザAPIを使う
└── カスタムフックを使う
```

---

## データ取得

### Server Componentでのデータ取得

```tsx
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }  // 1時間ごとに再検証
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### キャッシュ設定

```tsx
// 毎回取得
fetch(url, { cache: 'no-store' });

// 静的にキャッシュ（ビルド時のみ取得）
fetch(url, { cache: 'force-cache' });

// 時間ベースで再検証
fetch(url, { next: { revalidate: 60 } });  // 60秒ごと

// タグベースで再検証
fetch(url, { next: { tags: ['posts'] } });
// → revalidateTag('posts') で手動更新
```

---

## APIルート

### 基本

```tsx
// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello!' });
}
```

### CRUD

```tsx
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users
export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

```tsx
// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

// GET /api/users/123
export async function GET(request: NextRequest, { params }: Params) {
  const user = await db.user.findUnique({
    where: { id: parseInt(params.id) }
  });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT /api/users/123
export async function PUT(request: NextRequest, { params }: Params) {
  const body = await request.json();
  const user = await db.user.update({
    where: { id: parseInt(params.id) },
    data: body,
  });
  return NextResponse.json(user);
}

// DELETE /api/users/123
export async function DELETE(request: NextRequest, { params }: Params) {
  await db.user.delete({
    where: { id: parseInt(params.id) }
  });
  return new NextResponse(null, { status: 204 });
}
```

---

## ナビゲーション

### Link コンポーネント

```tsx
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/">ホーム</Link>
      <Link href="/about">About</Link>
      <Link href="/blog/my-post">記事</Link>
    </nav>
  );
}
```

### プログラムでの遷移

```tsx
'use client';
import { useRouter } from 'next/navigation';

export function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    await login();
    router.push('/dashboard');  // 遷移
    // router.replace('/dashboard');  // 履歴を置き換え
    // router.back();  // 戻る
    // router.refresh();  // 現在のページを更新
  };

  return <button onClick={handleLogin}>ログイン</button>;
}
```

---

## よく使う機能

### 画像最適化

```tsx
import Image from 'next/image';

export function Avatar() {
  return (
    <Image
      src="/avatar.png"
      alt="アバター"
      width={100}
      height={100}
      // 自動で:
      // - WebP/AVIF変換
      // - 遅延読み込み
      // - サイズ最適化
    />
  );
}
```

### メタデータ

```tsx
// src/app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ホーム | My Site',
  description: 'サイトの説明',
};

export default function Home() {
  return <h1>ホーム</h1>;
}
```

### 環境変数

```bash
# .env.local
DATABASE_URL=postgres://...
NEXT_PUBLIC_API_URL=https://api.example.com

# NEXT_PUBLIC_ で始まるものだけクライアントで使える
```

```tsx
// サーバーのみ
const dbUrl = process.env.DATABASE_URL;

// クライアントでも使える
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## よくある誤解

### 「全部Client Componentにすればいい」？

Server Componentの方が:
- 初回読み込みが速い
- JavaScriptバンドルが小さい
- SEOに有利

必要なところだけClient Componentにします。

### 「APIルートは必須」？

Server Componentから直接DBにアクセスできます。

```tsx
// APIルート不要のパターン
export default async function UsersPage() {
  const users = await db.user.findMany();  // 直接DB
  return <UserList users={users} />;
}
```

APIルートが必要なのは:
- クライアントからの呼び出し
- 外部サービスからのWebhook
- 認証が必要なエンドポイント

---

## まとめ

- **Next.js** = Reactの全部入りフレームワーク
- **App Router** = ファイルベースのルーティング
- **Server Components** = サーバーで実行（デフォルト）
- **Client Components** = ブラウザで実行（'use client'）
- **APIルート** = app/api にファイルを作る
- **Image, Link** = 最適化された組み込みコンポーネント

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [Next.js App Routerサンプル](/samples/client/07-nextjs-app-router) - レイアウト / Server Components / Client Components / API Routes

