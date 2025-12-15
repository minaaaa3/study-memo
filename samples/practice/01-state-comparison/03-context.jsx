/**
 * 03-context.jsx
 *
 * React Contextで状態管理
 * → Props drilling を解決
 */

import { createContext, useContext, useState, useReducer } from 'react';

// ========================================
// シンプルな Context（useState）
// ========================================

// 1. Context を作成
const ThemeContext = createContext(null);

// 2. Provider コンポーネント
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. カスタムフック（使いやすくする）
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 4. 使用例
function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      現在のテーマ: {theme}
    </button>
  );
}

function ThemedApp() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

function Header() {
  const { theme } = useTheme();
  return <header style={{ background: theme === 'dark' ? '#333' : '#fff' }}>Header</header>;
}

function Main() {
  return <main><ThemeButton /></main>;
}

function Footer() {
  const { theme } = useTheme();
  return <footer style={{ background: theme === 'dark' ? '#333' : '#fff' }}>Footer</footer>;
}

// ========================================
// 複雑な Context（useReducer）
// ========================================

// 認証コンテキスト
const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'logout':
      return { ...state, user: null, isAuthenticated: false };
    case 'setLoading':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (email, password) => {
    dispatch({ type: 'setLoading', payload: true });
    try {
      // API呼び出し（仮）
      const user = { email, name: 'User' };
      dispatch({ type: 'login', payload: user });
    } finally {
      dispatch({ type: 'setLoading', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'logout' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ========================================
// 複数の Context を組み合わせる
// ========================================

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <Dashboard />
    </AppProviders>
  );
}

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      <p>ようこそ、{user?.name}さん</p>
      <button onClick={toggleTheme}>テーマ切替</button>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();

  return (
    <button onClick={() => login('test@example.com', 'password')}>
      ログイン
    </button>
  );
}

// ========================================
// Context の注意点
// ========================================

/*
 * ✅ メリット:
 *    - Props drilling を解決
 *    - React 標準機能（追加ライブラリ不要）
 *
 * ⚠️ 注意点:
 *    - Context の値が変わると、全ての Consumer が再レンダリング
 *    - パフォーマンスに注意（大きな状態を1つのContextに入れない）
 *    - 状態と更新関数を分けると最適化しやすい
 */

// パフォーマンス最適化の例
const CountContext = createContext(null);
const CountDispatchContext = createContext(null);

function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <CountContext.Provider value={count}>
      <CountDispatchContext.Provider value={setCount}>
        {children}
      </CountDispatchContext.Provider>
    </CountContext.Provider>
  );
}

// count を読むだけのコンポーネント
function CountDisplay() {
  const count = useContext(CountContext);
  return <p>Count: {count}</p>;
}

// count を更新するだけのコンポーネント（countが変わっても再レンダリングしない）
function CountButton() {
  const setCount = useContext(CountDispatchContext);
  return <button onClick={() => setCount(c => c + 1)}>+1</button>;
}

export { ThemedApp, App, CountProvider, CountDisplay, CountButton };
