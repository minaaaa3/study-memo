/**
 * 02-useReducer.jsx
 *
 * useReducerで状態管理
 * → 複雑な状態遷移を「アクション」で管理
 */

import { useReducer } from 'react';

// ========================================
// 基本的な useReducer
// ========================================

// 初期状態
const initialState = { count: 0 };

// リデューサー: (現在の状態, アクション) => 新しい状態
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'set':
      return { count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div>
      <h2>カウンター: {state.count}</h2>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'reset' })}>リセット</button>
      <button onClick={() => dispatch({ type: 'set', payload: 100 })}>
        100にセット
      </button>
    </div>
  );
}

// ========================================
// 複雑な状態管理（Todoアプリ）
// ========================================

const todoInitialState = {
  todos: [],
  filter: 'all', // 'all' | 'active' | 'completed'
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: Date.now(), text: action.payload, completed: false },
        ],
      };

    case 'toggle':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case 'delete':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };

    case 'setFilter':
      return {
        ...state,
        filter: action.payload,
      };

    case 'clearCompleted':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
      };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, todoInitialState);

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true;
  });

  const addTodo = (text) => {
    dispatch({ type: 'add', payload: text });
  };

  return (
    <div>
      <h2>Todo App (useReducer)</h2>

      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.target.elements.todo;
        if (input.value.trim()) {
          addTodo(input.value);
          input.value = '';
        }
      }}>
        <input name="todo" placeholder="新しいTodo" />
        <button type="submit">追加</button>
      </form>

      <div>
        <button onClick={() => dispatch({ type: 'setFilter', payload: 'all' })}>
          すべて
        </button>
        <button onClick={() => dispatch({ type: 'setFilter', payload: 'active' })}>
          未完了
        </button>
        <button onClick={() => dispatch({ type: 'setFilter', payload: 'completed' })}>
          完了
        </button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'delete', payload: todo.id })}>
              削除
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: 'clearCompleted' })}>
        完了したTodoを削除
      </button>
    </div>
  );
}

// ========================================
// useState vs useReducer
// ========================================

/*
 * useState:
 *   - シンプルな状態（boolean, number, string）
 *   - 状態の更新が単純
 *   - 状態が少ない
 *
 * useReducer:
 *   - 複雑な状態（オブジェクト、配列）
 *   - 状態の更新が複雑（条件分岐が多い）
 *   - アクションとして状態変更を明示したい
 *   - テストしやすい（リデューサーは純粋関数）
 */

export { Counter, TodoApp };
