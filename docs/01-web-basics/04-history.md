# 1-4. Webアプリの歴史

## 例え話：本屋の進化

Webの歴史は、本屋の進化に例えられます。

1. **静的サイト** = 本が並んでいるだけの本屋。在庫は変わらない
2. **動的サイト** = 注文を受けて本を取り寄せる本屋。リクエストに応じて変わる
3. **SPA** = タブレットで本を閲覧できる本屋。ページめくりが超高速
4. **SSR/SSG** = タブレット＋実物の本を組み合わせた本屋。いいとこ取り

---

## 1. 静的サイト時代（1990年代〜）

### 仕組み

```
ユーザー: 「index.htmlください」
    ↓
サーバー: 「はい、どうぞ」（ファイルをそのまま返す）
    ↓
ユーザー: 表示
```

### 特徴

- HTMLファイルがそのまま表示される
- 全ユーザーに同じ内容
- サーバーは「ファイルを返すだけ」の簡単な仕事

### コード例

```html
<!-- index.html（これがそのまま表示される）-->
<!DOCTYPE html>
<html>
<head>
  <title>私のホームページ</title>
</head>
<body>
  <h1>ようこそ！</h1>
  <p>最終更新: 2024年1月1日</p>
  <a href="profile.html">プロフィール</a>
  <a href="diary.html">日記</a>
</body>
</html>
```

### 限界

- 内容を変えたければHTMLファイルを手動で編集
- ユーザーごとに違う内容を見せられない
- 「ログイン」という概念がない

---

## 2. 動的サイト時代（2000年代〜）

### 仕組み

```
ユーザー: 「田中さんのプロフィールください」
    ↓
サーバー: DBから田中さんの情報を取得
         HTMLを動的に生成
    ↓
ユーザー: 田中さん専用のページを表示
```

### 特徴

- サーバーがHTMLを「作る」
- データベースと連携
- ユーザーごとに違う内容
- PHP、Ruby、Pythonなどの「サーバーサイド言語」

### コード例（PHP）

```php
<?php
// profile.php
// サーバー側でHTMLを生成

$userId = $_GET['id'];

// DBから取得（実際はもっと複雑）
$user = getUser($userId);
?>

<!DOCTYPE html>
<html>
<head>
  <title><?php echo $user['name']; ?>のプロフィール</title>
</head>
<body>
  <h1><?php echo $user['name']; ?>さんのページ</h1>
  <p>メール: <?php echo $user['email']; ?></p>
  <p>自己紹介: <?php echo $user['bio']; ?></p>
</body>
</html>
```

### 限界

- ページ遷移のたびに**全体**を読み込み直す
- 「いいね」を押すだけでページ全体がリロード
- 「アプリっぽい」操作感が出せない

---

## 3. SPA時代（2010年代〜）

### 仕組み

```
初回:
ユーザー: 「アプリください」
サーバー: 「はい、JavaScript一式です」（HTMLはほぼ空）

2回目以降:
ユーザー: 「田中さんのデータください」
サーバー: 「はい、JSONです」（データだけ）
JavaScript: 受け取ったデータで画面を更新
```

### 特徴

- ページ遷移なしで画面が変わる
- ネイティブアプリのような操作感
- React、Vue、Angularなどのフレームワーク
- フロントエンドが複雑化

### コード例（React）

```jsx
// App.jsx
// ブラウザ側でUIを構築

function App() {
  const [user, setUser] = useState(null);

  const loadUser = async (id) => {
    // ページ遷移なしでデータ取得
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    setUser(data);
  };

  return (
    <div>
      <button onClick={() => loadUser(1)}>田中さん</button>
      <button onClick={() => loadUser(2)}>山田さん</button>

      {user && (
        <div>
          <h1>{user.name}さんのページ</h1>
          <p>メール: {user.email}</p>
        </div>
      )}
    </div>
  );
}
```

```html
<!-- index.html（ほぼ空のHTML）-->
<!DOCTYPE html>
<html>
<head>
  <title>アプリ</title>
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script> <!-- ここにアプリ全部入ってる -->
</body>
</html>
```

### 限界

- 初回読み込みが遅い（JavaScript全部読む）
- SEO（検索エンジン対策）が難しい
- JavaScriptが動かないと何も見えない

---

## 4. SSR/SSG時代（2020年代〜）

### SSR（Server Side Rendering）

```
ユーザー: 「ページください」
    ↓
サーバー: JavaScriptを実行してHTMLを生成
         完成したHTMLを返す
    ↓
ユーザー: HTMLを表示（すぐ見える）
         その後JavaScriptが動いてインタラクティブに
```

### SSG（Static Site Generation）

```
ビルド時:
ツール: 全ページのHTMLを事前に生成しておく

リクエスト時:
ユーザー: 「ページください」
サーバー: 「事前に作っておいたHTMLです」（超高速）
```

### 特徴

- SPAのいいところ + 初回表示の速さ
- SEOに強い
- Next.js、Nuxt.js、Remixなどのフレームワーク

### コード例（Next.js）

```jsx
// pages/users/[id].jsx
// サーバーでデータ取得 → HTMLを生成 → クライアントに返す

// この関数はサーバーで実行される
export async function getServerSideProps({ params }) {
  const res = await fetch(`https://api.example.com/users/${params.id}`);
  const user = await res.json();

  return {
    props: { user }
  };
}

// このコンポーネントは最初サーバーでHTML化される
// その後クライアントでも動く
export default function UserPage({ user }) {
  return (
    <div>
      <h1>{user.name}さんのページ</h1>
      <p>メール: {user.email}</p>
    </div>
  );
}
```

---

## 比較まとめ

| 方式 | 初回表示 | ページ遷移 | SEO | 複雑さ |
|------|---------|-----------|-----|-------|
| 静的サイト | 速い | 遅い | 良い | 低い |
| 動的サイト | 普通 | 遅い | 良い | 中程度 |
| SPA | 遅い | 速い | 難しい | 高い |
| SSR | 速い | 速い | 良い | 高い |
| SSG | 最速 | 速い | 良い | 中〜高 |

### 何を選ぶべきか？

```
「内容がほぼ変わらない」「SEO重要」
  → SSG（ブログ、ドキュメントサイト）

「リアルタイムでデータが変わる」「SEO重要」
  → SSR（ECサイト、ニュースサイト）

「ログイン後のダッシュボード」「SEO不要」
  → SPA（管理画面、ツール系）

「複雑なことはしない」「情報を載せるだけ」
  → 静的サイト or SSG
```

---

## 現在のトレンド

### ハイブリッドアプローチ

現代のフレームワーク（Next.js、Nuxtなど）は、ページごとに方式を選べます：

```
/           → SSG（トップページ、変わらないから）
/blog/[id]  → SSG（ブログ記事、事前に生成）
/products   → SSR（商品一覧、在庫がリアルタイムで変わる）
/dashboard  → SPA（ログイン後、SEO不要）
```

### エッジコンピューティング

サーバーを「世界中の拠点」に分散させて、ユーザーに近い場所で処理する。

```
従来: 東京にサーバー → 世界中からアクセス
    アメリカからのアクセスは遅い

エッジ: 世界中にサーバー → 近い場所から返す
    アメリカのユーザーにはアメリカから返す
```

---

## よくある誤解

### 「SPAは古い」？

違います。用途によって最適解が違うだけです。

- 管理画面やダッシュボードはSPAで十分
- 全部SSRにする必要はない
- 「何を作るか」で選ぶ

### 「Next.jsを使えば全部解決」？

Next.jsは強力ですが、銀の弾丸ではありません。

- シンプルなサイトには過剰
- 学習コストがある
- ホスティングに制約がある場合も

---

## まとめ

- **静的サイト**: ファイルをそのまま返す。シンプルで高速
- **動的サイト**: サーバーでHTMLを生成。DBと連携
- **SPA**: ブラウザでUIを構築。アプリのような体験
- **SSR**: サーバーでReactなどを実行。初回が速い
- **SSG**: ビルド時にHTML生成。最速

歴史を知ることで「なぜ今の技術があるのか」がわかります。

## 次の部へ

Webの全体像がわかったところで、サーバーの世界を詳しく見ていきましょう。
→ [第2部: サーバーの世界](../02-server-world/01-what-is-server.md)
