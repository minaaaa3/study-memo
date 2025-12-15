/**
 * 04-protected-routes.jsx
 *
 * 認証が必要なルート（Protected Routes）
 */

import { createContext, useContext, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// ========================================
// 認証コンテキスト
// ========================================

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // 実際のアプリではAPIを叩く
    if (username === 'admin' && password === 'password') {
      setUser({ name: username, role: 'admin' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// ========================================
// 認証ガード（Protected Route）
// ========================================

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // ログインしていない場合はログインページにリダイレクト
    // state に現在のパスを保存（ログイン後に戻れるように）
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ロール（権限）による制限
function RequireRole({ children, role }) {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ========================================
// ページコンポーネント
// ========================================

function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>ホーム</h1>
      {user ? (
        <p>ようこそ、{user.name}さん</p>
      ) : (
        <p>ログインしてください</p>
      )}
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  // ログイン前にいたページ（なければホーム）
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    const success = login(username, password);
    if (success) {
      // ログイン成功 → 元いたページに戻る
      navigate(from, { replace: true });
    } else {
      setError('ログインに失敗しました');
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input name="username" placeholder="ユーザー名" />
        </div>
        <div>
          <input name="password" type="password" placeholder="パスワード" />
        </div>
        <button type="submit">ログイン</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p style={{ color: 'gray', fontSize: '0.8rem' }}>
        ヒント: admin / password
      </p>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      <p>ログインしている人だけが見れます</p>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>プロフィール</h1>
      <p>名前: {user?.name}</p>
      <p>権限: {user?.role}</p>
    </div>
  );
}

function AdminPage() {
  return (
    <div>
      <h1>管理者ページ</h1>
      <p>admin権限を持つユーザーだけが見れます</p>
    </div>
  );
}

// ========================================
// ナビゲーション
// ========================================

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
      <Link to="/">ホーム</Link>
      <Link to="/dashboard">ダッシュボード</Link>
      <Link to="/profile">プロフィール</Link>
      <Link to="/admin">管理者</Link>

      {user ? (
        <button onClick={handleLogout}>ログアウト</button>
      ) : (
        <Link to="/login">ログイン</Link>
      )}
    </nav>
  );
}

// ========================================
// アプリケーション
// ========================================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />

        <Routes>
          {/* 公開ページ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 認証が必要なページ */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />

          {/* 特定の権限が必要なページ */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireRole role="admin">
                  <AdminPage />
                </RequireRole>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
