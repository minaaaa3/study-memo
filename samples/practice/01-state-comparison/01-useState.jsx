/**
 * 01-useState.jsx
 *
 * useStateのみで状態管理
 * → 最もシンプル、ローカル状態向け
 */

import { useState } from 'react';

// ========================================
// シンプルなカウンター
// ========================================

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>カウンター: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}

// ========================================
// 複数の状態
// ========================================

function MultipleStates() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 問題: 状態が増えると管理が大変になる

  return (
    <div>
      <p>カウント: {count}</p>
      <p>名前: {name}</p>
      <p>ローディング: {isLoading ? 'Yes' : 'No'}</p>
    </div>
  );
}

// ========================================
// オブジェクト状態
// ========================================

function ObjectState() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0,
  });

  const updateName = (name) => {
    // オブジェクトを更新するときはスプレッド
    setUser({ ...user, name });
  };

  const updateEmail = (email) => {
    setUser({ ...user, email });
  };

  return (
    <div>
      <input
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
        placeholder="名前"
      />
      <input
        value={user.email}
        onChange={(e) => updateEmail(e.target.value)}
        placeholder="メール"
      />
      <p>ユーザー: {JSON.stringify(user)}</p>
    </div>
  );
}

// ========================================
// Props Drilling の問題
// ========================================

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <Parent theme={theme} setTheme={setTheme} />
  );
}

function Parent({ theme, setTheme }) {
  return (
    <Child theme={theme} setTheme={setTheme} />
  );
}

function Child({ theme, setTheme }) {
  return (
    <GrandChild theme={theme} setTheme={setTheme} />
  );
}

function GrandChild({ theme, setTheme }) {
  // ようやくここで使う
  // → 途中のコンポーネントは渡すだけで使っていない（バケツリレー）
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      現在のテーマ: {theme}
    </button>
  );
}

// ========================================
// useStateの限界
// ========================================

/*
 * ✅ 向いているケース:
 *    - コンポーネント内のローカルな状態
 *    - フォームの入力値
 *    - UI状態（モーダルの開閉、選択中のタブなど）
 *
 * ❌ 向いていないケース:
 *    - 複数コンポーネントで共有する状態
 *    - 深いコンポーネントツリーでの状態共有
 *    - 複雑な状態遷移（useReducerの方が良い）
 */

export { Counter, MultipleStates, ObjectState, App };
