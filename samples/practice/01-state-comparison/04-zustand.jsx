/**
 * 04-zustand.jsx
 *
 * Zustandで状態管理
 * → シンプルなAPI、ボイラープレートが少ない
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ========================================
// 基本的な使い方
// ========================================

// ストアを作成（1行で完結！）
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

function Counter() {
  // 必要な状態だけ取り出す
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div>
      <h2>カウンター: {count}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}

// ========================================
// 複雑な状態（Todoアプリ）
// ========================================

const useTodoStore = create((set, get) => ({
  todos: [],
  filter: 'all',

  // アクション
  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false },
      ],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  setFilter: (filter) => set({ filter }),

  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed),
    })),

  // 計算値（getterのように使える）
  get filteredTodos() {
    const { todos, filter } = get();
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  },
}));

function TodoApp() {
  const todos = useTodoStore((state) => state.filteredTodos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const setFilter = useTodoStore((state) => state.setFilter);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const filter = useTodoStore((state) => state.filter);

  return (
    <div>
      <h2>Todo App (Zustand)</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.elements.todo;
          if (input.value.trim()) {
            addTodo(input.value);
            input.value = '';
          }
        }}
      >
        <input name="todo" placeholder="新しいTodo" />
        <button type="submit">追加</button>
      </form>

      <div>
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
          >
            {f === 'all' ? 'すべて' : f === 'active' ? '未完了' : '完了'}
          </button>
        ))}
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>

      <button onClick={clearCompleted}>完了したTodoを削除</button>
    </div>
  );
}

// ========================================
// ミドルウェア（devtools, persist）
// ========================================

const usePersistedStore = create(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        setTheme: (theme) => set({ theme }),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light',
          })),
      }),
      {
        name: 'theme-storage', // localStorage のキー
      }
    ),
    { name: 'ThemeStore' } // DevTools での名前
  )
);

// ========================================
// 非同期アクション
// ========================================

const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/users/${id}`);
      const user = await res.json();
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));

// ========================================
// コンポーネント外からのアクセス
// ========================================

// Zustand はコンポーネント外からもアクセス可能
function logCount() {
  const count = useCounterStore.getState().count;
  console.log('Current count:', count);
}

function incrementOutside() {
  useCounterStore.getState().increment();
}

// subscribe で変更を監視
useCounterStore.subscribe((state) => {
  console.log('Count changed:', state.count);
});

// ========================================
// Zustand の特徴まとめ
// ========================================

/*
 * ✅ メリット:
 *    - ボイラープレートが少ない
 *    - Provider 不要
 *    - TypeScript との相性が良い
 *    - コンポーネント外からアクセス可能
 *    - 必要な状態だけ選択して再レンダリング最適化
 *
 * 📦 Context vs Zustand:
 *    - シンプルなグローバル状態 → Zustand
 *    - サーバーコンポーネントとの連携 → Context
 *    - 既存プロジェクト（追加ライブラリ避けたい）→ Context
 */

export { Counter, TodoApp, usePersistedStore, useUserStore };
