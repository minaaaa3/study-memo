/**
 * 04-cache-control.jsx
 *
 * TanStack Query のキャッシュ制御
 */

import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';

// ========================================
// staleTime と gcTime の違い
// ========================================

/*
 * staleTime: キャッシュが「新鮮」とみなされる時間
 *   - この期間中は再取得しない
 *   - デフォルト: 0（常に古いとみなす）
 *
 * gcTime: キャッシュがメモリに保持される時間
 *   - コンポーネントがアンマウントされてからの時間
 *   - デフォルト: 5分
 *   - この期間が過ぎるとキャッシュは削除される
 */

function ProductList() {
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,

    // 5分間は再取得しない
    staleTime: 5 * 60 * 1000,

    // 10分間キャッシュを保持
    gcTime: 10 * 60 * 1000,
  });

  return (/* ... */);
}

// ========================================
// 再取得のタイミング
// ========================================

function RealTimeData() {
  const { data } = useQuery({
    queryKey: ['realtime'],
    queryFn: fetchRealtimeData,

    // ウィンドウにフォーカスしたとき
    refetchOnWindowFocus: true,

    // ネットワーク復帰時
    refetchOnReconnect: true,

    // 30秒ごとに自動更新（ポーリング）
    refetchInterval: 30 * 1000,

    // ブラウザがバックグラウンドでも更新
    refetchIntervalInBackground: false,
  });

  return (/* ... */);
}

// ========================================
// キャッシュの無効化（invalidateQueries）
// ========================================

function InvalidateExample() {
  const queryClient = useQueryClient();

  // 特定のキーを無効化
  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    // ['users'], ['users', 1], ['users', { status: 'active' }]
    // ↑ 全部無効化される（部分マッチ）
  };

  // 完全一致で無効化
  const invalidateExact = () => {
    queryClient.invalidateQueries({
      queryKey: ['users'],
      exact: true,  // ['users'] のみ無効化
    });
  };

  // すべてのクエリを無効化
  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  // 条件付きで無効化
  const invalidateStale = () => {
    queryClient.invalidateQueries({
      queryKey: ['users'],
      // 古いキャッシュのみ無効化
      stale: true,
    });
  };

  return (/* ... */);
}

// ========================================
// キャッシュの直接操作（setQueryData）
// ========================================

function DirectCacheManipulation() {
  const queryClient = useQueryClient();

  // キャッシュを直接読み取り
  const getCache = () => {
    const users = queryClient.getQueryData(['users']);
    console.log('現在のキャッシュ:', users);
  };

  // キャッシュを直接更新（新規追加）
  const addToCache = (newUser) => {
    queryClient.setQueryData(['users'], (oldUsers) => {
      if (!oldUsers) return [newUser];
      return [...oldUsers, newUser];
    });
  };

  // キャッシュを直接更新（更新）
  const updateInCache = (userId, updates) => {
    queryClient.setQueryData(['users'], (oldUsers) => {
      if (!oldUsers) return oldUsers;
      return oldUsers.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      );
    });
  };

  // キャッシュを直接更新（削除）
  const removeFromCache = (userId) => {
    queryClient.setQueryData(['users'], (oldUsers) => {
      if (!oldUsers) return oldUsers;
      return oldUsers.filter(user => user.id !== userId);
    });
  };

  // キャッシュをプリフェッチ
  const prefetchUsers = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: fetchUsers,
    });
  };

  return (/* ... */);
}

// ========================================
// プレースホルダーデータとイニシャルデータ
// ========================================

function DataWithPlaceholder({ userId }) {
  const { data } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),

    // ローディング中に表示するダミーデータ
    placeholderData: {
      id: userId,
      name: '読み込み中...',
      email: '...',
    },
  });

  // placeholderData があるとき isLoading は false になる
  // → いきなりデータ（プレースホルダー）が表示される

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  );
}

function DataWithInitial() {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,

    // 初期データ（キャッシュとして扱われる）
    initialData: {
      theme: 'light',
      language: 'ja',
    },

    // 初期データの鮮度
    initialDataUpdatedAt: Date.now() - 60 * 1000, // 1分前
  });

  return (/* ... */);
}

// ========================================
// ユースケース別の設定例
// ========================================

// ユーザー設定（めったに変わらない）
function useUserSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: Infinity,  // 手動更新まで再取得しない
    gcTime: Infinity,     // 永続的にキャッシュ
  });
}

// ニュースフィード（頻繁に更新）
function useNewsFeed() {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 30 * 1000,       // 30秒は新鮮
    refetchInterval: 60 * 1000, // 1分ごとに更新
  });
}

// 株価（リアルタイム）
function useStockPrice(symbol) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockPrice(symbol),
    staleTime: 0,               // 常に古い
    refetchInterval: 5 * 1000,  // 5秒ごとに更新
    refetchIntervalInBackground: true,
  });
}

// 検索結果（同じ検索なら再利用）
function useSearch(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => search(query),
    staleTime: 5 * 60 * 1000,   // 5分間は再利用
    enabled: query.length >= 2, // 2文字以上で検索
  });
}

export {
  ProductList,
  RealTimeData,
  InvalidateExample,
  DirectCacheManipulation,
  useUserSettings,
  useNewsFeed,
  useStockPrice,
  useSearch,
};
