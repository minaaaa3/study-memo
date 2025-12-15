/**
 * 05-custom-hooks.jsx
 *
 * 実際のプロジェクトでの使い方
 * カスタムフックでAPI呼び出しをまとめる
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ========================================
// API クライアント（共通設定）
// ========================================

const API_BASE = '/api';

async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      // 認証トークンがあれば付与
      ...(localStorage.getItem('token') && {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ========================================
// Users API Hooks
// ========================================

// ユーザー一覧
export function useUsers(options = {}) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient('/users'),
    staleTime: 60 * 1000,
    ...options,
  });
}

// 個別ユーザー
export function useUser(id, options = {}) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient(`/users/${id}`),
    enabled: !!id,
    ...options,
  });
}

// ユーザー作成
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      apiClient('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ユーザー更新
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      apiClient(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
}

// ユーザー削除
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiClient(`/users/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ========================================
// Posts API Hooks
// ========================================

export function usePosts(userId, options = {}) {
  return useQuery({
    queryKey: ['posts', { userId }],
    queryFn: () =>
      apiClient(userId ? `/posts?userId=${userId}` : '/posts'),
    ...options,
  });
}

export function usePost(id, options = {}) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => apiClient(`/posts/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      apiClient('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ========================================
// 使用例: ユーザー管理画面
// ========================================

function UserManagement() {
  // ユーザー一覧
  const { data: users, isLoading, error } = useUsers();

  // 作成・更新・削除のミューテーション
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  const handleCreate = async () => {
    try {
      await createUser.mutateAsync({
        name: 'New User',
        email: 'new@example.com',
      });
      alert('作成しました');
    } catch (error) {
      alert(`エラー: ${error.message}`);
    }
  };

  const handleUpdate = async (user) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { name: user.name + ' (更新)' },
      });
      alert('更新しました');
    } catch (error) {
      alert(`エラー: ${error.message}`);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('削除しますか？')) return;

    try {
      await deleteUser.mutateAsync(userId);
      alert('削除しました');
    } catch (error) {
      alert(`エラー: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>ユーザー管理</h1>

      <button
        onClick={handleCreate}
        disabled={createUser.isPending}
      >
        {createUser.isPending ? '作成中...' : '新規作成'}
      </button>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleUpdate(user)}>編集</button>
            <button onClick={() => handleDelete(user.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ========================================
// 使用例: ユーザー詳細と投稿
// ========================================

function UserProfile({ userId }) {
  // ユーザー情報
  const { data: user, isLoading: userLoading } = useUser(userId);

  // ユーザーの投稿
  const { data: posts, isLoading: postsLoading } = usePosts(userId);

  if (userLoading) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>

      <h2>投稿一覧</h2>
      {postsLoading ? (
        <div>投稿を読み込み中...</div>
      ) : (
        <ul>
          {posts?.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ========================================
// Query Keys の管理（大規模プロジェクト向け）
// ========================================

// keys.js として別ファイルに切り出すと管理しやすい
export const queryKeys = {
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
  posts: {
    all: ['posts'],
    lists: () => [...queryKeys.posts.all, 'list'],
    list: (filters) => [...queryKeys.posts.lists(), filters],
    details: () => [...queryKeys.posts.all, 'detail'],
    detail: (id) => [...queryKeys.posts.details(), id],
  },
};

// 使用例
// useQuery({ queryKey: queryKeys.users.detail(1), ... })
// queryClient.invalidateQueries({ queryKey: queryKeys.users.all })

export { UserManagement, UserProfile };
