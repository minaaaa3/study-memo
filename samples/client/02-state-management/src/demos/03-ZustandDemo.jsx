/**
 * Zustand - シンプルな状態管理ライブラリ
 * Reduxより軽量で、セットアップが簡単
 */

import { create } from "zustand";
import { useState } from "react";

// ストアを作成（シンプル！）
const useTodoStore = create((set) => ({
  todos: [
    { id: 1, text: "買い物", done: false },
    { id: 2, text: "掃除", done: true },
  ],

  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, done: false }],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}));

// 使う側のコンポーネント（Providerで囲む必要なし！）
function TodoInput() {
  const addTodo = useTodoStore((state) => state.addTodo);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    addTodo(input);
    setInput("");
  };

  return (
    <div className="todo-input">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="新しいTODO"
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <button onClick={handleAdd}>追加</button>
    </div>
  );
}

function TodoList() {
  // 必要な部分だけ購読（todosが変わった時だけ再レンダリング）
  const todos = useTodoStore((state) => state.todos);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={`todo-item ${todo.done ? "done" : ""}`}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggleTodo(todo.id)}
          />
          <span>{todo.text}</span>
          <button onClick={() => deleteTodo(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
}

function TodoStats() {
  const todos = useTodoStore((state) => state.todos);
  const completed = todos.filter((t) => t.done).length;

  return (
    <div
      style={{
        padding: 10,
        background: "#e8f5e9",
        borderRadius: 5,
        marginTop: 15,
      }}
    >
      完了: {completed} / {todos.length}
    </div>
  );
}

export default function ZustandDemo() {
  return (
    <div>
      <h2 className="demo-title">Zustand - シンプルな状態管理</h2>

      {/* Providerで囲む必要なし！ */}
      <TodoInput />
      <TodoList />
      <TodoStats />

      <div className="code-hint">
        {`// ストアを作成（とてもシンプル！）
const useStore = create((set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text }]
  })),
}));

// 使う（Providerで囲む必要なし！）
function TodoList() {
  // 必要な部分だけ購読 → パフォーマンスが良い
  const todos = useStore(state => state.todos);
  const addTodo = useStore(state => state.addTodo);
  ...
}

// メリット:
// - セットアップが簡単
// - 必要な部分だけ購読できる（パフォーマンス良い）
// - Providerで囲む必要なし`}
      </div>
    </div>
  );
}
