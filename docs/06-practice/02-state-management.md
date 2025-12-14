# 6-2. 状態管理を実装する

## 目標

TODOアプリを題材に、状態管理の各アプローチを比較する。

---

## 要件

```
TODOアプリ:
- TODOの追加、完了、削除
- フィルター（全部/未完了/完了）
- 件数表示
```

---

## 1. useState のみ（小規模向け）

```jsx
// App.jsx
import { useState } from 'react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (!inputValue.trim()) return;
    setTodos([...todos, { id: Date.now(), text: inputValue, done: false }]);
    setInputValue('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true;
  });

  return (
    <div>
      <h1>TODO</h1>

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>追加</button>

      <div>
        <button onClick={() => setFilter('all')}>全部</button>
        <button onClick={() => setFilter('active')}>未完了</button>
        <button onClick={() => setFilter('completed')}>完了</button>
      </div>

      <p>{todos.filter(t => !t.done).length}件未完了</p>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**問題点**: コンポーネントを分割すると、propsを渡す必要がある。

---

## 2. Context API（Props drilling回避）

```jsx
// TodoContext.jsx
import { createContext, useContext, useState } from 'react';

const TodoContext = createContext(null);

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.done;
    if (filter === 'completed') return todo.done;
    return true;
  });

  const activeCount = todos.filter(t => !t.done).length;

  return (
    <TodoContext.Provider value={{
      todos: filteredTodos,
      activeCount,
      filter,
      setFilter,
      addTodo,
      toggleTodo,
      deleteTodo,
    }}>
      {children}
    </TodoContext.Provider>
  );
}

export const useTodo = () => useContext(TodoContext);
```

```jsx
// コンポーネント（どこからでもアクセス可能）
import { useTodo } from './TodoContext';

function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useTodo();

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function TodoItem({ todo }) {
  const { toggleTodo, deleteTodo } = useTodo();

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleTodo(todo.id)}
      />
      {todo.text}
      <button onClick={() => deleteTodo(todo.id)}>削除</button>
    </li>
  );
}
```

**問題点**: 状態が変わると、Providerの子が全部再レンダリングされる。

---

## 3. Zustand（シンプルで高性能）

```jsx
// store.js
import { create } from 'zustand';

const useTodoStore = create((set, get) => ({
  todos: [],
  filter: 'all',

  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),

  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  })),

  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter(todo => todo.id !== id)
  })),

  setFilter: (filter) => set({ filter }),

  // セレクター（派生状態）
  getFilteredTodos: () => {
    const { todos, filter } = get();
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'completed') return todos.filter(t => t.done);
    return todos;
  },

  getActiveCount: () => get().todos.filter(t => !t.done).length,
}));

export default useTodoStore;
```

```jsx
// コンポーネント
import useTodoStore from './store';

function TodoList() {
  // 必要な部分だけsubscribe（他が変わっても再レンダリングされない）
  const todos = useTodoStore(state => state.getFilteredTodos());

  return (
    <ul>
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </ul>
  );
}

function TodoItem({ todo }) {
  const toggleTodo = useTodoStore(state => state.toggleTodo);
  const deleteTodo = useTodoStore(state => state.deleteTodo);

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleTodo(todo.id)}
      />
      {todo.text}
      <button onClick={() => deleteTodo(todo.id)}>削除</button>
    </li>
  );
}

function ActiveCount() {
  // activeCountが変わったときだけ再レンダリング
  const count = useTodoStore(state => state.getActiveCount());
  return <p>{count}件未完了</p>;
}
```

---

## 4. Redux Toolkit（大規模向け）

```jsx
// todosSlice.js
import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    filter: 'all',
  },
  reducers: {
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        done: false,
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { addTodo, toggleTodo, deleteTodo, setFilter } = todosSlice.actions;

// セレクター
export const selectFilteredTodos = (state) => {
  const { items, filter } = state.todos;
  if (filter === 'active') return items.filter(t => !t.done);
  if (filter === 'completed') return items.filter(t => t.done);
  return items;
};

export const selectActiveCount = (state) =>
  state.todos.items.filter(t => !t.done).length;

export default todosSlice.reducer;
```

```jsx
// store.js
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './todosSlice';

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
});
```

```jsx
// コンポーネント
import { useSelector, useDispatch } from 'react-redux';
import { toggleTodo, deleteTodo, selectFilteredTodos } from './todosSlice';

function TodoList() {
  const todos = useSelector(selectFilteredTodos);
  const dispatch = useDispatch();

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => dispatch(toggleTodo(todo.id))}
          />
          {todo.text}
          <button onClick={() => dispatch(deleteTodo(todo.id))}>削除</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 比較

| 観点 | useState | Context | Zustand | Redux |
|------|----------|---------|---------|-------|
| 学習コスト | 低 | 低 | 低 | 中 |
| ボイラープレート | 少 | 中 | 少 | 多 |
| パフォーマンス | - | 低 | 高 | 高 |
| DevTools | - | - | あり | 強力 |
| 適したサイズ | 小 | 小〜中 | 小〜大 | 中〜大 |

---

## 選び方

```
「コンポーネント内で完結」
  → useState

「数コンポーネントで共有」
  → Context（または単にprops）

「アプリ全体で共有」「パフォーマンス重視」
  → Zustand

「大規模」「厳密な管理」「強力なDevTools」
  → Redux Toolkit
```

---

## 演習

1. useStateだけで作る
2. Zustandに書き換える
3. どちらが管理しやすいか比較する

