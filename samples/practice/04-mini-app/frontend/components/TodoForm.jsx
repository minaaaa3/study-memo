/**
 * TodoForm.jsx
 *
 * 新しいTodoを追加するフォーム（React Hook Form + Zod）
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTodo } from '../hooks/useTodos';

// ========================================
// バリデーションスキーマ
// ========================================

const todoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
});

// ========================================
// コンポーネント
// ========================================

export function TodoForm() {
  const createTodo = useCreateTodo();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createTodo.mutateAsync(data.title);
      reset(); // フォームをリセット
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="todo-form">
      <div className="input-group">
        <input
          {...register('title')}
          type="text"
          placeholder="新しいTodoを入力..."
          disabled={isSubmitting}
          className="todo-input"
        />
        <button
          type="submit"
          disabled={isSubmitting || createTodo.isPending}
          className="add-button"
        >
          {createTodo.isPending ? '追加中...' : '追加'}
        </button>
      </div>

      {errors.title && (
        <p className="error-message">{errors.title.message}</p>
      )}

      {createTodo.isError && (
        <p className="error-message">
          エラー: {createTodo.error.message}
        </p>
      )}

      <style>{`
        .todo-form {
          margin-bottom: 1.5rem;
        }
        .input-group {
          display: flex;
          gap: 0.5rem;
        }
        .todo-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .todo-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .add-button {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
        }
        .add-button:hover:not(:disabled) {
          background: #2563eb;
        }
        .add-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </form>
  );
}
