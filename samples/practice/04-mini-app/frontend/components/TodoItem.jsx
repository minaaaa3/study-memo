/**
 * TodoItem.jsx
 *
 * 個別のTodoアイテム
 */

import { useState } from 'react';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';

export function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  // 完了状態を切り替え
  const handleToggle = () => {
    updateTodo.mutate({
      id: todo.id,
      completed: !todo.completed,
    });
  };

  // タイトルを更新
  const handleSave = () => {
    if (editTitle.trim() === '') return;

    updateTodo.mutate({
      id: todo.id,
      title: editTitle.trim(),
    });
    setIsEditing(false);
  };

  // キャンセル
  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  // 削除
  const handleDelete = () => {
    if (confirm('本当に削除しますか？')) {
      deleteTodo.mutate(todo.id);
    }
  };

  // Enterキーで保存
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        className="todo-checkbox"
      />

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          className="edit-input"
        />
      ) : (
        <span
          className="todo-title"
          onDoubleClick={() => setIsEditing(true)}
        >
          {todo.title}
        </span>
      )}

      <div className="todo-actions">
        {!isEditing && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="edit-button"
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteTodo.isPending}
              className="delete-button"
            >
              削除
            </button>
          </>
        )}
      </div>

      <style>{`
        .todo-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
        }
        .todo-item:last-child {
          border-bottom: none;
        }
        .todo-item.completed .todo-title {
          text-decoration: line-through;
          color: #9ca3af;
        }
        .todo-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }
        .todo-title {
          flex: 1;
          cursor: pointer;
        }
        .edit-input {
          flex: 1;
          padding: 0.25rem 0.5rem;
          border: 1px solid #3b82f6;
          border-radius: 4px;
          font-size: 1rem;
        }
        .todo-actions {
          display: flex;
          gap: 0.5rem;
        }
        .edit-button, .delete-button {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .edit-button {
          background: #e5e7eb;
          color: #374151;
        }
        .edit-button:hover {
          background: #d1d5db;
        }
        .delete-button {
          background: #fee2e2;
          color: #dc2626;
        }
        .delete-button:hover {
          background: #fecaca;
        }
        .delete-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </li>
  );
}
