/**
 * Context API - グローバル状態管理
 * Props drillingを避けるために使う
 */

import { createContext, useContext, useState } from "react";

// 1. Contextを作成
const TodoContext = createContext(null);

// 2. Providerコンポーネント
function TodoProvider({ children }) {
  const [todos, setTodos] = useState([
    { id: 1, text: "買い物", done: false },
    { id: 2, text: "掃除", done: true },
  ]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

// カスタムフック（使いやすくするため）
function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
}

// 3. 使う側のコンポーネント（Props不要！）
function TodoInput() {
  const { addTodo } = useTodos();
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
  const { todos, toggleTodo, deleteTodo } = useTodos();

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
  const { todos } = useTodos();
  const completed = todos.filter((t) => t.done).length;

  return (
    <div
      style={{
        padding: 10,
        background: "#e3f2fd",
        borderRadius: 5,
        marginTop: 15,
      }}
    >
      完了: {completed} / {todos.length}
    </div>
  );
}

export default function ContextDemo() {
  return (
    <div>
      <h2 className="demo-title">Context API - グローバル状態管理</h2>

      <TodoProvider>
        <TodoInput />
        <TodoList />
        <TodoStats />
      </TodoProvider>

      <div className="code-hint">
        {`// 1. Contextを作成
const TodoContext = createContext(null);

// 2. Providerで囲む
<TodoContext.Provider value={{ todos, addTodo }}>
  {children}
</TodoContext.Provider>

// 3. 使いたい場所でuseContext
const { todos, addTodo } = useContext(TodoContext);

// メリット: Props drillingを避けられる
// デメリット: 状態が1つでも変わると、全部再レンダリング
//           → 大規模アプリではパフォーマンス問題`}
      </div>
    </div>
  );
}
