/**
 * 01-basic-routing.jsx
 *
 * React Router v6 の基本的な使い方
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from 'react-router-dom';

// ========================================
// ページコンポーネント
// ========================================

function HomePage() {
  return (
    <div>
      <h1>ホーム</h1>
      <p>Welcome to our app!</p>
    </div>
  );
}

function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>This is the about page.</p>
    </div>
  );
}

function ContactPage() {
  return (
    <div>
      <h1>Contact</h1>
      <p>Get in touch with us.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <p>ページが見つかりません</p>
      <Link to="/">ホームに戻る</Link>
    </div>
  );
}

// ========================================
// ナビゲーション
// ========================================

function Navigation() {
  return (
    <nav>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
        <li>
          <Link to="/">ホーム</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
}

// ========================================
// アプリケーション
// ========================================

function App() {
  return (
    <BrowserRouter>
      {/* 全ページ共通のナビゲーション */}
      <Navigation />

      <main>
        {/* ルート定義 */}
        <Routes>
          {/* パスとコンポーネントを対応付け */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* どのルートにもマッチしない場合（404） */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

// ========================================
// Link vs a タグ
// ========================================

/*
 * <a href="/about">  → ページ全体をリロード（遅い）
 * <Link to="/about"> → JavaScript で画面を切り替え（速い）
 *
 * SPAでは Link を使う！
 */

function LinkComparison() {
  return (
    <div>
      {/* ❌ a タグ: ページ全体がリロードされる */}
      <a href="/about">About (a tag)</a>

      {/* ✅ Link: SPAとしてスムーズに遷移 */}
      <Link to="/about">About (Link)</Link>
    </div>
  );
}

export default App;
