# 6-5. ミニアプリを作る

## 目標

学んだ内容を組み合わせて、実際に動くアプリを作る。

---

## お題：メモアプリ

```
機能:
- メモの作成、編集、削除
- メモ一覧の表示
- 検索/フィルター
- 永続化（リロードしても消えない）

使用技術:
- React（Next.js App Router）
- Zustand（状態管理）
- TanStack Query（API通信）
- React Hook Form + Zod（フォーム）
- Tailwind CSS（スタイル）
```

---

## ステップ1：プロジェクト作成

```bash
npx create-next-app@latest memo-app --typescript --tailwind --app --src-dir
cd memo-app
npm install zustand @tanstack/react-query zod @hookform/resolvers react-hook-form
```

---

## ステップ2：API（仮実装）

```typescript
// src/app/api/memos/route.ts
import { NextResponse } from 'next/server';

// 仮のDB（実際はDBを使う）
let memos = [
  { id: '1', title: 'はじめてのメモ', content: 'Hello World!', createdAt: new Date().toISOString() },
];

export async function GET() {
  return NextResponse.json(memos);
}

export async function POST(request: Request) {
  const body = await request.json();
  const memo = {
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date().toISOString(),
  };
  memos.push(memo);
  return NextResponse.json(memo, { status: 201 });
}
```

```typescript
// src/app/api/memos/[id]/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const index = memos.findIndex(m => m.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  memos[index] = { ...memos[index], ...body };
  return NextResponse.json(memos[index]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const index = memos.findIndex(m => m.id === params.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  memos.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
```

---

## ステップ3：型定義

```typescript
// src/types/memo.ts
export interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export type MemoInput = Omit<Memo, 'id' | 'createdAt'>;
```

---

## ステップ4：API クライアント

```typescript
// src/lib/api.ts
import { Memo, MemoInput } from '@/types/memo';

const BASE_URL = '';

export const memoApi = {
  getAll: async (): Promise<Memo[]> => {
    const res = await fetch(`${BASE_URL}/api/memos`);
    if (!res.ok) throw new Error('Failed to fetch memos');
    return res.json();
  },

  create: async (data: MemoInput): Promise<Memo> => {
    const res = await fetch(`${BASE_URL}/api/memos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create memo');
    return res.json();
  },

  update: async (id: string, data: MemoInput): Promise<Memo> => {
    const res = await fetch(`${BASE_URL}/api/memos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update memo');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/memos/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete memo');
  },
};
```

---

## ステップ5：React Queryフック

```typescript
// src/hooks/useMemos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoApi } from '@/lib/api';
import { MemoInput } from '@/types/memo';

export function useMemos() {
  return useQuery({
    queryKey: ['memos'],
    queryFn: memoApi.getAll,
  });
}

export function useCreateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemoInput) => memoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}

export function useUpdateMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemoInput }) =>
      memoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}

export function useDeleteMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
  });
}
```

---

## ステップ6：UIストア（検索/選択状態）

```typescript
// src/store/uiStore.ts
import { create } from 'zustand';

interface UIState {
  searchQuery: string;
  selectedMemoId: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedMemoId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  selectedMemoId: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedMemoId: (id) => set({ selectedMemoId: id }),
}));
```

---

## ステップ7：コンポーネント

```tsx
// src/components/MemoList.tsx
'use client';

import { useMemos, useDeleteMemo } from '@/hooks/useMemos';
import { useUIStore } from '@/store/uiStore';

export function MemoList() {
  const { data: memos, isLoading, error } = useMemos();
  const deleteMemo = useDeleteMemo();
  const { searchQuery, selectedMemoId, setSelectedMemoId } = useUIStore();

  if (isLoading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-500">エラー</div>;

  const filteredMemos = memos?.filter(memo =>
    memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memo.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="divide-y">
      {filteredMemos?.map(memo => (
        <div
          key={memo.id}
          className={`p-4 cursor-pointer hover:bg-gray-50 ${
            selectedMemoId === memo.id ? 'bg-blue-50' : ''
          }`}
          onClick={() => setSelectedMemoId(memo.id)}
        >
          <h3 className="font-medium">{memo.title}</h3>
          <p className="text-sm text-gray-500 truncate">{memo.content}</p>
          <button
            className="text-red-500 text-sm mt-2"
            onClick={(e) => {
              e.stopPropagation();
              deleteMemo.mutate(memo.id);
            }}
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// src/components/MemoForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateMemo } from '@/hooks/useMemos';

const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, '内容は必須です'),
});

type FormData = z.infer<typeof schema>;

export function MemoForm() {
  const createMemo = useCreateMemo();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    createMemo.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      <div>
        <input
          {...register('title')}
          placeholder="タイトル"
          className="w-full p-2 border rounded"
        />
        {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
      </div>
      <div>
        <textarea
          {...register('content')}
          placeholder="内容"
          className="w-full p-2 border rounded h-32"
        />
        {errors.content && <span className="text-red-500 text-sm">{errors.content.message}</span>}
      </div>
      <button
        type="submit"
        disabled={createMemo.isPending}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {createMemo.isPending ? '作成中...' : '作成'}
      </button>
    </form>
  );
}
```

---

## ステップ8：メインページ

```tsx
// src/app/page.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoList } from '@/components/MemoList';
import { MemoForm } from '@/components/MemoForm';
import { useUIStore } from '@/store/uiStore';

const queryClient = new QueryClient();

function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();
  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="検索..."
      className="w-full p-2 border-b"
    />
  );
}

function App() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold p-4">メモアプリ</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded">
          <SearchBar />
          <MemoList />
        </div>
        <div className="border rounded">
          <MemoForm />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
```

---

## 発展課題

1. **編集機能**: 選択したメモを編集できるように
2. **永続化**: LocalStorageまたはDBに保存
3. **認証**: ユーザーごとのメモ管理
4. **Markdown対応**: メモ内容をMarkdownで記述
5. **タグ機能**: メモにタグを付けて分類

---

## このアプリで学べること

```
✓ React コンポーネント設計
✓ 状態管理（ローカル/グローバル/サーバー）
✓ API設計と通信
✓ フォームバリデーション
✓ TypeScript の型定義
✓ Tailwind CSS でのスタイリング
```

---

## よくある誤解

### 「最初から完璧に作らないといけない」？

**段階的に作るのが正解**です。

```
良い進め方:
1. 最小限の機能で動くものを作る（MVP）
2. 実際に使ってみる
3. 問題点を発見する
4. 改善する
5. 2-4を繰り返す

悪い進め方:
1. 完璧な設計を目指す
2. 全機能を一度に実装しようとする
3. 複雑になりすぎて挫折
```

### 「ライブラリをたくさん使えば良いアプリになる」？

**必要なものだけ使う**のが正解です。

```javascript
// 過剰な例（小規模アプリには不要）
- Redux + Redux Saga + Reselect + Immer
- Axios + React Query + SWR
- Formik + Yup + React Hook Form

// 適切な例（このメモアプリの場合）
- Zustand（シンプルな状態管理）
- TanStack Query（サーバー状態）
- React Hook Form + Zod（フォーム）
```

### 「コンポーネントは細かく分けるほど良い」？

**適度な粒度**が大切です。

```jsx
// 細かすぎる例
<MemoCard>
  <MemoCardHeader>
    <MemoCardTitle />
    <MemoCardDate />
  </MemoCardHeader>
  <MemoCardBody>
    <MemoCardContent />
  </MemoCardBody>
  <MemoCardFooter>
    <MemoCardDeleteButton />
  </MemoCardFooter>
</MemoCard>

// 適切な例
<MemoCard memo={memo} onDelete={handleDelete} />
```

### 「型定義は面倒だから後回し」？

**最初から定義する**方が結果的に早いです。

```typescript
// 型を先に定義すると...
interface Memo {
  id: string;
  title: string;
  content: string;
}

// エディタが補完してくれる
// 間違った使い方をすると即座にエラー
// リファクタリングも安全
```

---

## まとめ

- **段階的に作る**: MVP → 改善の繰り返し
- **技術選定**: 規模に合ったライブラリを選ぶ
- **状態の分類**: UI状態（Zustand）とサーバー状態（TanStack Query）を分ける
- **型定義**: 最初から定義して開発効率を上げる
- **コンポーネント設計**: 適度な粒度で分割

---

## おわりに

このメモアプリは「最小限の実装」です。
実際のプロダクトでは、エラーハンドリング、ローディング状態、アクセシビリティなど、
さらに多くの考慮が必要です。

しかし、ここまでの学習で「何が起きているか」は理解できるようになっているはずです。
わからないことがあれば、各章に戻って復習してください。

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [ミニアプリサンプル](/samples/practice/04-mini-app) - Express + React + TanStack Query の統合例（Todoアプリ）
