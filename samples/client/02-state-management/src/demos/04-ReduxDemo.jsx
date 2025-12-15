/**
 * Redux Toolkit - 大規模アプリ向け状態管理
 * Redux Toolkitで設定が簡単になった
 */

import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useSelector, useDispatch } from "react-redux";
import { useState } from "react";

// Sliceを作成（action + reducerがまとまっている）
const todosSlice = createSlice({
  name: "todos",
  initialState: [
    { id: 1, text: "買い物", done: false },
    { id: 2, text: "掃除", done: true },
  ],
  reducers: {
    addTodo: (state, action) => {
      // Immerのおかげでミュータブルに書ける
      state.push({ id: Date.now(), text: action.payload, done: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    deleteTodo: (state, action) => {
      return state.filter((todo) => todo.id !== action.payload);
    },
  },
});

// Storeを作成
const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
});

// アクションをエクスポート
const { addTodo, toggleTodo, deleteTodo } = todosSlice.actions;

// 使う側のコンポーネント
function TodoInput() {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    dispatch(addTodo(input));
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
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={`todo-item ${todo.done ? "done" : ""}`}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => dispatch(toggleTodo(todo.id))}
          />
          <span>{todo.text}</span>
          <button onClick={() => dispatch(deleteTodo(todo.id))}>削除</button>
        </li>
      ))}
    </ul>
  );
}

function TodoStats() {
  const todos = useSelector((state) => state.todos);
  const completed = todos.filter((t) => t.done).length;

  return (
    <div
      style={{
        padding: 10,
        background: "#fff3e0",
        borderRadius: 5,
        marginTop: 15,
      }}
    >
      完了: {completed} / {todos.length}
    </div>
  );
}

export default function ReduxDemo() {
  return (
    <div>
      <h2 className="demo-title">Redux Toolkit - 大規模アプリ向け</h2>

      {/* Providerで囲む */}
      <Provider store={store}>
        <TodoInput />
        <TodoList />
        <TodoStats />
      </Provider>

      <div className="code-hint">
        {`// 1. Sliceを作成（action + reducerがまとまっている）
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      // Immerのおかげでミュータブルに書ける！
      state.push({ id: Date.now(), text: action.payload });
    },
  },
});

// 2. Storeを作成
const store = configureStore({
  reducer: { todos: todosSlice.reducer },
});

// 3. Providerで囲む
<Provider store={store}>
  <App />
</Provider>

// 4. 使う
const todos = useSelector(state => state.todos);
const dispatch = useDispatch();
dispatch(addTodo('新しいTODO'));

// メリット: 厳密な状態管理、DevTools、大規模向け
// デメリット: ボイラープレートが多い（Toolkitで軽減）`}
      </div>
    </div>
  );
}
