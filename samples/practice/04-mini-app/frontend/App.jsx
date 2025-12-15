/**
 * App.jsx
 *
 * Todoアプリのメインコンポーネント
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';

// ========================================
// Query Client 設定
// ========================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1分
      retry: 1,
    },
  },
});

// ========================================
// フィルタータブ
// ========================================

function FilterTabs({ filter, onFilterChange }) {
  const tabs = [
    { key: undefined, label: 'すべて' },
    { key: 'active', label: '未完了' },
    { key: 'completed', label: '完了済み' },
  ];

  return (
    <div className="filter-tabs">
      {tabs.map(tab => (
        <button
          key={tab.key || 'all'}
          onClick={() => onFilterChange(tab.key)}
          className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}

      <style>{`
        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .filter-tab {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .filter-tab:hover {
          background: #f9fafb;
        }
        .filter-tab.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

// ========================================
// メインアプリ
// ========================================

function TodoApp() {
  const [filter, setFilter] = useState(undefined);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <p>TanStack Query + React Hook Form + Zod</p>
      </header>

      <main className="app-main">
        <TodoForm />
        <FilterTabs filter={filter} onFilterChange={setFilter} />
        <TodoList filter={filter} />
      </main>

      <style>{`
        .app {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .app-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .app-header h1 {
          margin: 0;
          color: #1f2937;
        }
        .app-header p {
          margin: 0.5rem 0 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .app-main {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

// ========================================
// プロバイダーでラップ
// ========================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
