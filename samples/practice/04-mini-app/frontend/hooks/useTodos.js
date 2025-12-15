/**
 * useTodos.js
 *
 * Todo操作のカスタムフック（TanStack Query）
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = 'http://localhost:3001/api';

// ========================================
// API関数
// ========================================

async function fetchTodos(filter) {
  const url = filter
    ? `${API_BASE}/todos?completed=${filter === 'completed'}`
    : `${API_BASE}/todos`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

async function createTodo(title) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

async function updateTodo({ id, ...data }) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete todo');
}

// ========================================
// カスタムフック
// ========================================

// Todo一覧取得
export function useTodos(filter) {
  return useQuery({
    queryKey: ['todos', { filter }],
    queryFn: () => fetchTodos(filter),
  });
}

// Todo作成
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,

    // 楽観的更新
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueryData(['todos', { filter: undefined }]);

      queryClient.setQueryData(['todos', { filter: undefined }], (old) => [
        ...(old || []),
        { id: Date.now(), title, completed: false, createdAt: new Date() },
      ]);

      return { previousTodos };
    },

    onError: (err, title, context) => {
      queryClient.setQueryData(
        ['todos', { filter: undefined }],
        context?.previousTodos
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Todo更新
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodo,

    // 楽観的更新
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const queryKeys = queryClient.getQueryCache()
        .findAll({ queryKey: ['todos'] })
        .map(query => query.queryKey);

      const previousData = {};

      queryKeys.forEach(key => {
        previousData[JSON.stringify(key)] = queryClient.getQueryData(key);
        queryClient.setQueryData(key, (old) =>
          old?.map(todo =>
            todo.id === id ? { ...todo, ...data } : todo
          )
        );
      });

      return { previousData };
    },

    onError: (err, variables, context) => {
      Object.entries(context?.previousData || {}).forEach(([key, data]) => {
        queryClient.setQueryData(JSON.parse(key), data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Todo削除
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,

    // 楽観的更新
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const queryKeys = queryClient.getQueryCache()
        .findAll({ queryKey: ['todos'] })
        .map(query => query.queryKey);

      const previousData = {};

      queryKeys.forEach(key => {
        previousData[JSON.stringify(key)] = queryClient.getQueryData(key);
        queryClient.setQueryData(key, (old) =>
          old?.filter(todo => todo.id !== id)
        );
      });

      return { previousData };
    },

    onError: (err, id, context) => {
      Object.entries(context?.previousData || {}).forEach(([key, data]) => {
        queryClient.setQueryData(JSON.parse(key), data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
