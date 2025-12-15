# 6-3. APIクライアントを作る

## 目標

fetchの自前ラッパーと、ライブラリの違いを理解する。

---

## 1. 素のfetch

```javascript
// 毎回書くのは面倒
async function getUsers() {
  const response = await fetch('/api/users', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

---

## 2. 自前ラッパー

```javascript
// lib/api.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 認証トークンを自動付与
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);

    // エラーハンドリング
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'API Error');
    }

    // 204 No Content の場合
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const api = new ApiClient(BASE_URL);
```

```javascript
// 使用例
import { api } from '@/lib/api';

// シンプルに書ける
const users = await api.get('/api/users');
const newUser = await api.post('/api/users', { name: '田中' });
await api.delete('/api/users/1');
```

---

## 3. TanStack Query（サーバー状態管理）

```jsx
// hooks/useUsers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ユーザー一覧取得
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users'),
  });
}

// ユーザー詳細取得
export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get(`/api/users/${id}`),
    enabled: !!id,  // idがあるときだけ実行
  });
}

// ユーザー作成
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/api/users', data),
    onSuccess: () => {
      // 成功したらキャッシュを更新
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ユーザー削除
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

```jsx
// コンポーネント
function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
          <button
            onClick={() => deleteUser.mutate(user.id)}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? '削除中...' : '削除'}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

## TanStack Query の嬉しいポイント

### キャッシュ

```jsx
// ページAで取得
const { data } = useUsers();  // APIリクエスト

// ページBに移動してまた取得
const { data } = useUsers();  // キャッシュから即座に表示
                              // バックグラウンドで最新を取得
```

### 自動再取得

```jsx
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000,    // 5分間はキャッシュを新鮮とみなす
  refetchOnWindowFocus: true,  // ウィンドウフォーカスで再取得
  refetchInterval: 30000,      // 30秒ごとに再取得
});
```

### エラーリトライ

```jsx
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: 3,           // 3回まで自動リトライ
  retryDelay: 1000,   // 1秒後にリトライ
});
```

### 楽観的更新

```jsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateUser,
  // 送信前にUIを更新
  onMutate: async (newUser) => {
    await queryClient.cancelQueries({ queryKey: ['users', newUser.id] });
    const previousUser = queryClient.getQueryData(['users', newUser.id]);
    queryClient.setQueryData(['users', newUser.id], newUser);
    return { previousUser };
  },
  // エラー時にロールバック
  onError: (err, newUser, context) => {
    queryClient.setQueryData(['users', newUser.id], context.previousUser);
  },
});
```

---

## 比較

| 観点 | 素のfetch | 自前ラッパー | TanStack Query |
|------|-----------|-------------|----------------|
| ボイラープレート | 多い | 少ない | 最小 |
| キャッシュ | なし | 自前実装 | 自動 |
| ローディング状態 | 手動 | 手動 | 自動 |
| エラーハンドリング | 手動 | 共通化可能 | 自動 |
| 再取得 | 手動 | 手動 | 自動 |
| 学習コスト | 低 | 低 | 中 |

---

## 選び方

```
「シンプルなAPI呼び出し」「1回きり」
  → 素のfetch + 自前ラッパー

「一覧画面」「キャッシュしたい」「ローディング/エラー状態」
  → TanStack Query

「サーバーコンポーネント」
  → fetch（Next.js App Router）
```

---

## よくある誤解

### 「全部TanStack Queryで書けばいい」？

TanStack Queryは**サーバー状態の管理**に特化しています。

```javascript
// 良い使い方：サーバーからのデータ
const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// 不要な使い方：ローカルの状態
// → useStateやZustandの方が適切
const { data: isModalOpen } = useQuery({ ... }); // ❌
const [isModalOpen, setIsModalOpen] = useState(false); // ✅
```

### 「fetchで十分」？

小規模なら十分ですが、以下の場合はTanStack Queryの恩恵が大きい：

- 同じデータを複数コンポーネントで使う（キャッシュ）
- ローディング/エラー状態の管理が面倒
- データの自動更新が必要
- 楽観的更新をしたい

### 「Axiosは必須」？

fetchでほとんどのケースは対応できます。Axiosが必要なのは：

- リクエスト/レスポンスのインターセプター
- タイムアウト設定
- ブラウザ互換性（古いブラウザ対応）

---

## まとめ

- **素のfetch**: 単純だが毎回同じコードを書く必要がある
- **自前ラッパー**: 共通処理をまとめて再利用可能に
- **TanStack Query**: キャッシュ、自動再取得、状態管理を自動化
- **使い分け**: 規模と要件に応じて選択

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [APIクライアント比較サンプル](/samples/practice/02-api-client-comparison) - 素のfetch / Axios / TanStack Query の比較

---

## セットアップ

```bash
# TanStack Queryのインストール
npm install @tanstack/react-query

# 開発ツール（オプション）
npm install @tanstack/react-query-devtools
```

```jsx
// app/providers.jsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

---

## 演習

1. 自前ラッパーでCRUD APIを叩く
2. TanStack Queryに書き換える
3. キャッシュの動作を確認する（DevToolsで確認）

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [CRUD APIサーバー](https://github.com/minaaaa3/study-memo/tree/main/samples/server/03-crud-api) - APIクライアントのテスト用サーバー

