/**
 * 02-nested-routes.jsx
 *
 * ネストされたルート（レイアウトの共有）
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
} from 'react-router-dom';

// ========================================
// 共通レイアウト
// ========================================

function RootLayout() {
  return (
    <div>
      {/* ヘッダー（全ページ共通） */}
      <header style={{ borderBottom: '1px solid #ccc', padding: '1rem' }}>
        <nav>
          <Link to="/">ホーム</Link>
          {' | '}
          <Link to="/dashboard">ダッシュボード</Link>
          {' | '}
          <Link to="/settings">設定</Link>
        </nav>
      </header>

      {/* 子ルートがここに表示される */}
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>

      {/* フッター（全ページ共通） */}
      <footer style={{ borderTop: '1px solid #ccc', padding: '1rem' }}>
        &copy; 2024 My App
      </footer>
    </div>
  );
}

// ========================================
// ダッシュボード用レイアウト（サイドバー付き）
// ========================================

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* サイドバー */}
      <aside style={{ width: '200px', borderRight: '1px solid #ccc' }}>
        <h3>Dashboard</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/dashboard">概要</Link></li>
          <li><Link to="/dashboard/analytics">分析</Link></li>
          <li><Link to="/dashboard/reports">レポート</Link></li>
        </ul>
      </aside>

      {/* ダッシュボードの子ルートがここに表示される */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

// ========================================
// ページコンポーネント
// ========================================

function HomePage() {
  return <h1>ホーム</h1>;
}

function DashboardOverview() {
  return <h2>ダッシュボード概要</h2>;
}

function DashboardAnalytics() {
  return <h2>分析ページ</h2>;
}

function DashboardReports() {
  return <h2>レポートページ</h2>;
}

function SettingsPage() {
  return <h1>設定</h1>;
}

// ========================================
// アプリケーション
// ========================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ルートレイアウト */}
        <Route path="/" element={<RootLayout />}>
          {/* ホーム */}
          <Route index element={<HomePage />} />

          {/* ダッシュボード（ネストされたルート） */}
          <Route path="dashboard" element={<DashboardLayout />}>
            {/* /dashboard */}
            <Route index element={<DashboardOverview />} />
            {/* /dashboard/analytics */}
            <Route path="analytics" element={<DashboardAnalytics />} />
            {/* /dashboard/reports */}
            <Route path="reports" element={<DashboardReports />} />
          </Route>

          {/* 設定 */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// ========================================
// URL構造
// ========================================

/*
 * /                  → RootLayout > HomePage
 * /dashboard         → RootLayout > DashboardLayout > DashboardOverview
 * /dashboard/analytics → RootLayout > DashboardLayout > DashboardAnalytics
 * /dashboard/reports → RootLayout > DashboardLayout > DashboardReports
 * /settings          → RootLayout > SettingsPage
 *
 * ポイント:
 * - RootLayout は全ページで共有される（ヘッダー、フッター）
 * - DashboardLayout は dashboard/* でのみ共有される（サイドバー）
 * - <Outlet /> で子ルートを表示
 */

export default App;
