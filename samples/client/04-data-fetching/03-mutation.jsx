/**
 * 03-mutation.jsx
 *
 * useMutation でデータを作成・更新・削除する
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ========================================
// 基本的な useMutation
// ========================================

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // データ送信関数
    mutationFn: async (newUser) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error('Failed to create user');
      return res.json();
    },

    // 成功時
    onSuccess: (data) => {
      console.log('作成成功:', data);
      // ユーザー一覧のキャッシュを無効化 → 再取得される
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },

    // エラー時
    onError: (error) => {
      console.error('作成失敗:', error);
      alert('作成に失敗しました');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    mutation.mutate({
      name: formData.get('name'),
      email: formData.get('email'),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="名前" required />
      <input name="email" type="email" placeholder="メール" required />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? '作成中...' : 'ユーザー作成'}
      </button>

      {mutation.isError && (
        <p style={{ color: 'red' }}>エラー: {mutation.error.message}</p>
      )}
      {mutation.isSuccess && (
        <p style={{ color: 'green' }}>作成しました！</p>
      )}
    </form>
  );
}

// ========================================
// 楽観的更新（Optimistic Update）
// ========================================

function TodoList() {
  const queryClient = useQueryClient();

  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(r => r.json()),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      return res.json();
    },

    // 楽観的更新: APIの結果を待たずにUIを更新
    onMutate: async ({ id, completed }) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // 現在のキャッシュを保存（ロールバック用）
      const previousTodos = queryClient.getQueryData(['todos']);

      // キャッシュを楽観的に更新
      queryClient.setQueryData(['todos'], (old) =>
        old.map(todo =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );

      // ロールバック用のコンテキストを返す
      return { previousTodos };
    },

    // エラー時はロールバック
    onError: (error, variables, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
      alert('更新に失敗しました');
    },

    // 成功でもエラーでも、最後にサーバーから再取得
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <ul>
      {todos.map(todo => (
        <li
          key={todo.id}
          onClick={() => toggleMutation.mutate({
            id: todo.id,
            completed: !todo.completed,
          })}
          style={{
            textDecoration: todo.completed ? 'line-through' : 'none',
            cursor: 'pointer',
          }}
        >
          {todo.title}
        </li>
      ))}
    </ul>
  );
}

// ========================================
// 削除の実装
// ========================================

function UserCard({ user }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },

    onSuccess: () => {
      // ユーザー一覧から削除されたユーザーを除外
      queryClient.setQueryData(['users'], (old) =>
        old?.filter(u => u.id !== user.id)
      );
    },
  });

  const handleDelete = () => {
    if (confirm('本当に削除しますか？')) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? '削除中...' : '削除'}
      </button>
    </div>
  );
}

// ========================================
// 更新の実装
// ========================================

function EditUserForm({ user, onClose }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },

    onSuccess: (updatedUser) => {
      // ユーザー一覧を更新
      queryClient.setQueryData(['users'], (old) =>
        old?.map(u => u.id === user.id ? updatedUser : u)
      );

      // 個別ユーザーのキャッシュも更新
      queryClient.setQueryData(['users', user.id], updatedUser);

      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateMutation.mutate({
      name: formData.get('name'),
      email: formData.get('email'),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" defaultValue={user.name} required />
      <input name="email" type="email" defaultValue={user.email} required />

      <button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? '更新中...' : '更新'}
      </button>
      <button type="button" onClick={onClose}>
        キャンセル
      </button>

      {updateMutation.isError && (
        <p style={{ color: 'red' }}>{updateMutation.error.message}</p>
      )}
    </form>
  );
}

export { CreateUserForm, TodoList, UserCard, EditUserForm };
