# Next.js App Router サンプル

Next.js 13+ のApp Routerを使った実装例です。

## ファイル構成

```
07-nextjs-app-router/
├── app/
│   ├── layout.tsx       # ルートレイアウト
│   ├── page.tsx         # ホームページ
│   ├── loading.tsx      # ローディングUI
│   ├── error.tsx        # エラーUI
│   ├── posts/
│   │   ├── page.tsx     # 投稿一覧
│   │   └── [id]/
│   │       └── page.tsx # 投稿詳細
│   └── api/
│       └── posts/
│           ├── route.ts       # GET /api/posts, POST /api/posts
│           └── [id]/
│               └── route.ts   # GET/PUT/DELETE /api/posts/:id
├── components/
│   ├── Header.tsx       # Server Component
│   └── Counter.tsx      # Client Component
└── lib/
    └── db.ts            # データアクセス層
```

## App Router の特徴

| 機能 | 説明 |
|------|------|
| **Server Components** | デフォルトでサーバーで実行（バンドルサイズ削減） |
| **ファイルベースルーティング** | `app/`ディレクトリ構造がURLになる |
| **レイアウト** | `layout.tsx`でネストしたレイアウト |
| **ローディング/エラー** | `loading.tsx`, `error.tsx`で自動処理 |
| **Route Handlers** | `route.ts`でAPIエンドポイント |

## Server Components vs Client Components

```tsx
// Server Component（デフォルト）
// - DBアクセス可能
// - 秘密情報にアクセス可能
// - useStateなどのフック使用不可
async function ServerComponent() {
  const data = await db.query('SELECT * FROM posts');
  return <div>{data.title}</div>;
}

// Client Component
// - 'use client'を先頭に記述
// - useStateなどのフック使用可能
// - ブラウザAPIにアクセス可能
'use client'
function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## 学習の流れ

1. `app/layout.tsx` - レイアウトの仕組み
2. `app/page.tsx` - Server Componentの基本
3. `components/Counter.tsx` - Client Componentの使い方
4. `app/posts/page.tsx` - データフェッチ
5. `app/api/posts/route.ts` - API Routes

## セットアップ

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
```
