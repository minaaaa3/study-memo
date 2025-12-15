/**
 * TodoList.jsx
 *
 * Todo一覧コンポーネント
 */

import { useTodos } from '../hooks/useTodos';
import { TodoItem } from './TodoItem';

export function TodoList({ filter }) {
  const { data: todos, isLoading, error, isFetching } = useTodos(filter);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>読み込み中...</p>
        <style>{`
          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            color: #6b7280;
          }
          .spinner {
            width: 2rem;
            height: 2rem;
            border: 3px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>エラーが発生しました: {error.message}</p>
        <style>{`
          .error {
            padding: 1rem;
            background: #fee2e2;
            color: #dc2626;
            border-radius: 4px;
          }
        `}</style>
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="empty">
        <p>Todoがありません</p>
        <style>{`
          .empty {
            padding: 2rem;
            text-align: center;
            color: #9ca3af;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      {isFetching && !isLoading && (
        <div className="updating-indicator">更新中...</div>
      )}

      <ul className="todo-list">
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>

      <div className="todo-stats">
        <span>全{todos.length}件</span>
        <span>完了: {todos.filter(t => t.completed).length}件</span>
        <span>未完了: {todos.filter(t => !t.completed).length}件</span>
      </div>

      <style>{`
        .todo-list-container {
          position: relative;
        }
        .updating-indicator {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0.25rem 0.5rem;
          background: #fef3c7;
          color: #d97706;
          font-size: 0.75rem;
          border-radius: 4px;
        }
        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .todo-stats {
          display: flex;
          gap: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
