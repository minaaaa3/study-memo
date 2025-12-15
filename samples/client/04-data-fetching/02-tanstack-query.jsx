/**
 * 02-tanstack-query.jsx
 *
 * TanStack Query の基本的な使い方
 * useQuery でデータを取得する
 */

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ========================================
// セットアップ（アプリのルートで1回だけ）
// ========================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルトの設定
      staleTime: 60 * 1000,      // 1分間は「新鮮」とみなす
      retry: 3,                   // 失敗時は3回までリトライ
      refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
      {/* 開発時はDevToolsを表示 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// ========================================
// 基本的な使い方
// ========================================

function UserList() {
  const { data, isLoading, error } = useQuery({
    // キャッシュのキー（配列で指定）
    queryKey: ['users'],

    // データ取得関数
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ========================================
// パラメータ付きクエリ
// ========================================

function UserDetail({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    // パラメータをキーに含める
    queryKey: ['users', userId],

    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('User not found');
      return res.json();
    },

    // userIdがあるときだけ実行
    enabled: !!userId,
  });

  if (!userId) return <div>ユーザーを選択してください</div>;
  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// ========================================
// 検索クエリ（動的パラメータ）
// ========================================

function UserSearch({ searchTerm }) {
  const { data, isLoading, isFetching } = useQuery({
    // 検索条件もキーに含める
    queryKey: ['users', 'search', searchTerm],

    queryFn: async () => {
      const res = await fetch(`/api/users?search=${searchTerm}`);
      return res.json();
    },

    // 検索ワードが2文字以上のときだけ実行
    enabled: searchTerm.length >= 2,

    // 検索中は古いデータを表示し続ける
    placeholderData: (previousData) => previousData,
  });

  return (
    <div>
      {/* isFetching: バックグラウンドで取得中 */}
      {isFetching && <span>更新中...</span>}

      {isLoading ? (
        <div>検索中...</div>
      ) : (
        <ul>
          {data?.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ========================================
// 複数のクエリを同時に実行
// ========================================

function Dashboard() {
  // 複数のuseQueryは並列実行される
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  });

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
  });

  // どれかがロード中
  if (usersQuery.isLoading || postsQuery.isLoading || statsQuery.isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h2>ユーザー数: {usersQuery.data?.length}</h2>
      <h2>投稿数: {postsQuery.data?.length}</h2>
      <h2>統計: {JSON.stringify(statsQuery.data)}</h2>
    </div>
  );
}

// ========================================
// 状態の種類を理解する
// ========================================

function StatusExample() {
  const {
    data,
    error,
    isLoading,    // 初回読み込み中（データなし）
    isFetching,   // 再取得中（データあり/なし問わず）
    isRefetching, // 明示的な再取得中
    isPending,    // データがまだない
    isSuccess,    // 取得成功
    isError,      // 取得失敗
    isStale,      // キャッシュが古い
    refetch,      // 手動で再取得
  } = useQuery({
    queryKey: ['example'],
    queryFn: fetchData,
  });

  return (
    <div>
      {/* 初回ロード時のみローディング表示 */}
      {isLoading && <Spinner />}

      {/* バックグラウンド更新中は小さいインジケータ */}
      {isFetching && !isLoading && <SmallIndicator />}

      {/* 手動で再取得 */}
      <button onClick={() => refetch()}>
        再読み込み
      </button>

      {/* データ表示 */}
      {isSuccess && <DataDisplay data={data} />}

      {/* エラー表示 */}
      {isError && <ErrorMessage error={error} />}
    </div>
  );
}

export { App, UserList, UserDetail, UserSearch, Dashboard };
