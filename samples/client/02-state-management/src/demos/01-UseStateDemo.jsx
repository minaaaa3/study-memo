/**
 * useState - ローカル状態管理
 * 1つのコンポーネント内でだけ使う状態に最適
 */

import { useState } from "react";

// カウンターコンポーネント
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <button onClick={() => setCount(count - 1)}>-</button>
      <span className="count">{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

// TODOリストコンポーネント
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "買い物", done: false },
    { id: 2, text: "掃除", done: true },
  ]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput("");
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
    <div>
      <div className="todo-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいTODO"
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button onClick={addTodo}>追加</button>
      </div>
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
    </div>
  );
}

export default function UseStateDemo() {
  return (
    <div>
      <h2 className="demo-title">useState - ローカル状態管理</h2>

      <h3>カウンター</h3>
      <Counter />

      <h3 style={{ marginTop: 30 }}>TODOリスト</h3>
      <TodoList />

      <div className="code-hint">
        {`// 基本的な使い方
const [count, setCount] = useState(0);

// 配列の場合（イミュータブルに更新）
setTodos([...todos, newTodo]);

// オブジェクトの場合
setUser({ ...user, name: "新しい名前" });

// 良いケース: このコンポーネントでしか使わない状態
// 悪いケース: 他のコンポーネントでも使いたい状態 → Context or Zustand`}
      </div>
    </div>
  );
}
