/**
 * 03-tanstack-query.jsx
 *
 * TanStack Query でAPI呼び出し
 * → キャッシュ、状態管理、再取得を自動で
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './02-axios'; // Axiosインスタンスを再利用

// ========================================
// Query Keys の管理
// ========================================

export const queryKeys = {
  users: {
    all: ['users'],
    list: (filters) => ['users', 'list', filters],
    detail: (id) => ['users', 'detail', id],
  },
  posts: {
    all: ['posts'],
    list: (filters) => ['posts', 'list', filters],
    detail: (id) => ['posts', 'detail', id],
    byUser: (userId) => ['posts', 'user', userId],
  },
};

// ========================================
// Users Hooks
// ========================================

// ユーザー一覧
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => api.get('/users', { params: filters }).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5分
  });
}

// 個別ユーザー
export function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => api.get(`/users/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

// ユーザー作成
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/users', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// ユーザー更新
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/${id}`, data).then(res => res.data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.setQueryData(queryKeys.users.detail(id), data);
    },
  });
}

// ユーザー削除
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// ========================================
// Posts Hooks
// ========================================

export function usePosts(filters = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: () => api.get('/posts', { params: filters }).then(res => res.data),
  });
}

export function usePost(id) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => api.get(`/posts/${id}`).then(res => res.data),
    enabled: !!id,
  });
}

export function useUserPosts(userId) {
  return useQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: () => api.get(`/users/${userId}/posts`).then(res => res.data),
    enabled: !!userId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/posts', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// ========================================
// 使用例（コンポーネント）
// ========================================

function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreate = () => {
    createUser.mutate({
      name: 'New User',
      email: 'new@example.com',
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Add User'}
      </button>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name}
            <button
              onClick={() => deleteUser.mutate(user.id)}
              disabled={deleteUser.isPending}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserDetail({ userId }) {
  const { data: user, isLoading } = useUser(userId);
  const { data: posts, isLoading: postsLoading } = useUserPosts(userId);
  const updateUser = useUpdateUser();

  if (isLoading) return <div>Loading...</div>;

  const handleUpdate = () => {
    updateUser.mutate({
      id: userId,
      data: { name: user.name + ' (updated)' },
    });
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={handleUpdate} disabled={updateUser.isPending}>
        Update Name
      </button>

      <h2>Posts</h2>
      {postsLoading ? (
        <div>Loading posts...</div>
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
// 比較まとめ
// ========================================

/*
 * fetch:
 *   - ブラウザ標準、軽量
 *   - エラーハンドリングが面倒
 *   - 機能が少ない
 *
 * Axios:
 *   - 便利な機能が多い（インターセプター、タイムアウト）
 *   - エラーハンドリングが楽
 *   - キャッシュ機能はない
 *
 * TanStack Query:
 *   - キャッシュ管理
 *   - 状態管理（loading, error）
 *   - 自動再取得
 *   - 楽観的更新
 *   - React との統合
 *
 * 推奨:
 *   - シンプルなAPI → Axios
 *   - React アプリ → TanStack Query + Axios
 */

export { UserList, UserDetail };
