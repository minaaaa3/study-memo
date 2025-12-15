/**
 * 05-navigation.jsx
 *
 * プログラム的なナビゲーション
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// ========================================
// Link vs NavLink
// ========================================

function Navigation() {
  return (
    <nav>
      {/* 通常のリンク */}
      <Link to="/">ホーム</Link>

      {/* アクティブ状態がわかるリンク */}
      <NavLink
        to="/about"
        className={({ isActive }) => isActive ? 'active' : ''}
        style={({ isActive }) => ({
          fontWeight: isActive ? 'bold' : 'normal',
          color: isActive ? 'red' : 'black',
        })}
      >
        About
      </NavLink>

      {/* end属性: 完全一致のみアクティブ */}
      <NavLink to="/users" end>
        ユーザー一覧
      </NavLink>
      {/* /users → アクティブ */}
      {/* /users/1 → アクティブにならない */}
    </nav>
  );
}

// ========================================
// useNavigate: プログラム的な遷移
// ========================================

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ログイン処理...
    const success = true;

    if (success) {
      // ダッシュボードに遷移
      navigate('/dashboard');

      // 履歴を置き換え（戻るボタンでログイン画面に戻らない）
      // navigate('/dashboard', { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">ログイン</button>
    </form>
  );
}

// ========================================
// navigate の使い方いろいろ
// ========================================

function NavigationExamples() {
  const navigate = useNavigate();

  return (
    <div>
      {/* 絶対パス */}
      <button onClick={() => navigate('/about')}>
        About へ
      </button>

      {/* 相対パス */}
      <button onClick={() => navigate('profile')}>
        現在のパス/profile へ
      </button>

      {/* 戻る */}
      <button onClick={() => navigate(-1)}>
        戻る
      </button>

      {/* 進む */}
      <button onClick={() => navigate(1)}>
        進む
      </button>

      {/* データを渡す（state） */}
      <button onClick={() => navigate('/result', { state: { score: 100 } })}>
        結果を渡して遷移
      </button>

      {/* 履歴を置き換え（replace） */}
      <button onClick={() => navigate('/home', { replace: true })}>
        置き換えて遷移
      </button>
    </div>
  );
}

// ========================================
// useLocation: 現在の位置情報
// ========================================

function CurrentLocation() {
  const location = useLocation();

  return (
    <div>
      <h2>現在の位置情報</h2>
      <pre>
        {JSON.stringify({
          pathname: location.pathname,  // /users/1
          search: location.search,      // ?tab=posts
          hash: location.hash,          // #section1
          state: location.state,        // navigate で渡された state
          key: location.key,            // ユニークなキー
        }, null, 2)}
      </pre>
    </div>
  );
}

// ========================================
// state を使ったデータの受け渡し
// ========================================

function SendData() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/receive', {
      state: {
        message: 'Hello from SendData!',
        timestamp: Date.now(),
      },
    });
  };

  return (
    <button onClick={handleClick}>
      データを渡して遷移
    </button>
  );
}

function ReceiveData() {
  const location = useLocation();
  const { message, timestamp } = location.state || {};

  return (
    <div>
      <h2>受け取ったデータ</h2>
      <p>メッセージ: {message || 'なし'}</p>
      <p>タイムスタンプ: {timestamp || 'なし'}</p>
    </div>
  );
}

// ========================================
// フォーム送信後のリダイレクト
// ========================================

function CreatePostForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      // 投稿を作成
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
        }),
      });

      const newPost = await response.json();

      // 作成した投稿の詳細ページに遷移
      navigate(`/posts/${newPost.id}`);

    } catch (error) {
      alert('投稿に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="タイトル" />
      <textarea name="content" placeholder="本文" />
      <button type="submit">投稿</button>
    </form>
  );
}

// ========================================
// 確認ダイアログ付きの遷移
// ========================================

function UnsavedChangesForm() {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);

  const handleNavigate = (path) => {
    if (isDirty) {
      const confirmed = window.confirm(
        '保存されていない変更があります。移動しますか？'
      );
      if (!confirmed) return;
    }
    navigate(path);
  };

  return (
    <div>
      <input
        onChange={() => setIsDirty(true)}
        placeholder="何か入力..."
      />

      <button onClick={() => handleNavigate('/')}>
        ホームに戻る
      </button>
    </div>
  );
}

// ========================================
// アプリケーション
// ========================================

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <CurrentLocation />

      <Routes>
        <Route path="/" element={<h1>ホーム</h1>} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route path="/users" element={<h1>ユーザー一覧</h1>} />
        <Route path="/dashboard" element={<h1>ダッシュボード</h1>} />
        <Route path="/send" element={<SendData />} />
        <Route path="/receive" element={<ReceiveData />} />
        <Route path="/examples" element={<NavigationExamples />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
