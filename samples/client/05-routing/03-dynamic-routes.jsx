/**
 * 03-dynamic-routes.jsx
 *
 * 動的ルーティング（URLパラメータ）
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom';

// ========================================
// URLパラメータの取得（useParams）
// ========================================

// /users/:id にアクセスしたとき
function UserDetail() {
  // URLから :id を取得
  const { id } = useParams();

  return (
    <div>
      <h1>ユーザー詳細</h1>
      <p>ユーザーID: {id}</p>

      {/* 実際のアプリでは、このIDを使ってAPIを叩く */}
      {/*
        const { data } = useQuery({
          queryKey: ['users', id],
          queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
        });
      */}
    </div>
  );
}

// ========================================
// 複数のパラメータ
// ========================================

// /users/:userId/posts/:postId
function UserPost() {
  const { userId, postId } = useParams();

  return (
    <div>
      <h1>投稿詳細</h1>
      <p>ユーザーID: {userId}</p>
      <p>投稿ID: {postId}</p>
    </div>
  );
}

// ========================================
// クエリパラメータ（useSearchParams）
// ========================================

// /search?q=keyword&page=2
function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // クエリパラメータを取得
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // クエリパラメータを更新
  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: String(newPage) });
  };

  return (
    <div>
      <h1>検索</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="検索キーワード"
      />

      <p>検索ワード: {query}</p>
      <p>現在のページ: {page}</p>

      <div>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          前のページ
        </button>
        <button onClick={() => handlePageChange(page + 1)}>
          次のページ
        </button>
      </div>
    </div>
  );
}

// ========================================
// ユーザー一覧（パラメータへのリンク）
// ========================================

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

function UserList() {
  return (
    <div>
      <h1>ユーザー一覧</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {/* 動的なパスへのリンク */}
            <Link to={`/users/${user.id}`}>
              {user.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ========================================
// オプショナルパラメータ
// ========================================

// /category/:categoryId?
// → /category または /category/1 どちらでもマッチ
function CategoryPage() {
  const { categoryId } = useParams();

  if (!categoryId) {
    return <h1>全カテゴリー</h1>;
  }

  return <h1>カテゴリー: {categoryId}</h1>;
}

// ========================================
// アプリケーション
// ========================================

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">ホーム</Link>
        {' | '}
        <Link to="/users">ユーザー一覧</Link>
        {' | '}
        <Link to="/search">検索</Link>
        {' | '}
        <Link to="/category">カテゴリー</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>ホーム</h1>} />

        {/* ユーザー一覧 */}
        <Route path="/users" element={<UserList />} />

        {/* ユーザー詳細（:id は動的パラメータ） */}
        <Route path="/users/:id" element={<UserDetail />} />

        {/* 複数パラメータ */}
        <Route path="/users/:userId/posts/:postId" element={<UserPost />} />

        {/* 検索（クエリパラメータ） */}
        <Route path="/search" element={<SearchPage />} />

        {/* オプショナルパラメータ */}
        <Route path="/category/:categoryId?" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// ========================================
// パラメータの種類まとめ
// ========================================

/*
 * URLパラメータ（:id）:
 *   - /users/123 → id = "123"
 *   - 必須のパラメータ
 *   - useParams() で取得
 *
 * クエリパラメータ（?key=value）:
 *   - /search?q=hello&page=2
 *   - オプショナル（なくてもOK）
 *   - useSearchParams() で取得・更新
 *
 * オプショナルパラメータ（:id?）:
 *   - /category または /category/123 どちらでもマッチ
 */

export default App;
