# 1-4. Webアプリの歴史

## 例え話：本屋の進化

<Callout type="info">
Webの歴史は、本屋の進化に例えられます。
</Callout>

```mermaid
graph LR
    A[静的サイト<br/>本が並んでいるだけ] --> B[動的サイト<br/>注文を受けて取り寄せ]
    B --> C[SPA<br/>タブレットで閲覧<br/>超高速]
    C --> D[SSR/SSG<br/>タブレット＋実物の本<br/>いいとこ取り]

    style A fill:#f0f0f0
    style B fill:#e3f2fd
    style C fill:#fff9c4
    style D fill:#c8e6c9
```

---

## 1. 静的サイト時代（1990年代〜）

### 仕組み

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Server as サーバー

    User->>Server: index.htmlください
    Server-->>User: はい、どうぞ<br/>（ファイルをそのまま返す）
    User->>User: 表示
```

### 特徴

<Callout type="info">
- HTMLファイルがそのまま表示される
- 全ユーザーに同じ内容
- サーバーは「ファイルを返すだけ」の簡単な仕事
</Callout>

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

<Callout type="warning">
- 内容を変えたければHTMLファイルを手動で編集
- ユーザーごとに違う内容を見せられない
- 「ログイン」という概念がない
</Callout>

---

## 2. 動的サイト時代（2000年代〜）

### 仕組み

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Server as サーバー
    participant DB as データベース

    User->>Server: 田中さんのプロフィールください
    Server->>DB: 田中さんの情報を取得
    DB-->>Server: 田中さんのデータ
    Server->>Server: HTMLを動的に生成
    Server-->>User: 田中さん専用のページ
```

### 特徴

<Callout type="success">
- サーバーがHTMLを「作る」
- データベースと連携
- ユーザーごとに違う内容
- PHP、Ruby、Pythonなどの「サーバーサイド言語」
</Callout>

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

<Callout type="warning">
- ページ遷移のたびに**全体**を読み込み直す
- 「いいね」を押すだけでページ全体がリロード
- 「アプリっぽい」操作感が出せない
</Callout>

---

## 3. SPA時代（2010年代〜）

### 仕組み

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Server as サーバー
    participant JS as JavaScript

    Note over User,JS: 初回
    User->>Server: アプリください
    Server-->>User: JavaScript一式<br/>（HTMLはほぼ空）

    Note over User,JS: 2回目以降
    User->>Server: 田中さんのデータください
    Server-->>JS: JSON（データだけ）
    JS->>JS: 画面を更新
```

### 特徴

<Callout type="success">
- ページ遷移なしで画面が変わる
- ネイティブアプリのような操作感
- React、Vue、Angularなどのフレームワーク
</Callout>

<Callout type="warning">
- フロントエンドが複雑化
</Callout>

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

<Callout type="error">
- 初回読み込みが遅い（JavaScript全部読む）
- SEO（検索エンジン対策）が難しい
- JavaScriptが動かないと何も見えない
</Callout>

---

## 4. SSR/SSG時代（2020年代〜）

### SSR（Server Side Rendering）

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Server as サーバー

    User->>Server: ページください
    Server->>Server: JavaScriptを実行してHTMLを生成
    Server-->>User: 完成したHTMLを返す
    User->>User: HTMLを表示（すぐ見える）
    Note over User: その後JavaScriptが動いて<br/>インタラクティブに
```

### SSG（Static Site Generation）

```mermaid
sequenceDiagram
    participant Tool as ビルドツール
    participant Server as サーバー
    participant User as ユーザー

    Note over Tool: ビルド時
    Tool->>Tool: 全ページのHTMLを<br/>事前に生成

    Note over Server,User: リクエスト時
    User->>Server: ページください
    Server-->>User: 事前に作っておいたHTML<br/>（超高速）
```

### 特徴

<Callout type="success">
- SPAのいいところ + 初回表示の速さ
- SEOに強い
- Next.js、Nuxt.js、Remixなどのフレームワーク
</Callout>

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

<ComparisonTable
  title="Webアプリ方式の比較"
  items={['静的サイト', '動的サイト', 'SPA', 'SSR', 'SSG']}
  criteria={['初回表示', 'ページ遷移', 'SEO', '実装の複雑さ']}
  data={{
    '初回表示': { '静的サイト': 'good', '動的サイト': 'fair', 'SPA': 'poor', 'SSR': 'good', 'SSG': 'excellent' },
    'ページ遷移': { '静的サイト': 'poor', '動的サイト': 'poor', 'SPA': 'excellent', 'SSR': 'excellent', 'SSG': 'excellent' },
    'SEO': { '静的サイト': 'excellent', '動的サイト': 'excellent', 'SPA': 'poor', 'SSR': 'excellent', 'SSG': 'excellent' },
    '実装の複雑さ': { '静的サイト': 'excellent', '動的サイト': 'good', 'SPA': 'poor', 'SSR': 'poor', 'SSG': 'fair' }
  }}
/>

### 何を選ぶべきか？

```mermaid
graph TD
    Start[何を作る？]
    Start --> Q1{内容は変わる？}
    Q1 -->|ほぼ変わらない| Q2{SEO重要？}
    Q1 -->|頻繁に変わる| Q3{SEO重要？}

    Q2 -->|重要| SSG[SSG<br/>ブログ、ドキュメント]
    Q2 -->|不要| Static[静的サイト]

    Q3 -->|重要| SSR[SSR<br/>ECサイト、ニュース]
    Q3 -->|不要| SPA[SPA<br/>管理画面、ツール]

    style SSG fill:#c8e6c9
    style SSR fill:#e3f2fd
    style SPA fill:#fff9c4
    style Static fill:#f0f0f0
```

<WhyButton title="どう選べばいい？">
- **内容がほぼ変わらない + SEO重要** → SSG（ブログ、ドキュメントサイト）
- **リアルタイムでデータが変わる + SEO重要** → SSR（ECサイト、ニュースサイト）
- **ログイン後のダッシュボード + SEO不要** → SPA（管理画面、ツール系）
- **複雑なことはしない + 情報を載せるだけ** → 静的サイト or SSG
</WhyButton>

---

## 現在のトレンド

### ハイブリッドアプローチ

現代のフレームワーク（Next.js、Nuxtなど）は、ページごとに方式を選べます：

```mermaid
graph TD
    App[Next.jsアプリ]
    App --> Root["/ トップページ<br>SSG"]
    App --> Blog["/blog/id ブログ記事<br>SSG"]
    App --> Products["/products 商品一覧<br>SSR"]
    App --> Dashboard["/dashboard ダッシュボード<br>SPA"]

    style Root fill:#c8e6c9
    style Blog fill:#c8e6c9
    style Products fill:#e3f2fd
    style Dashboard fill:#fff9c4
```

<Callout type="tip">
ページごとに最適な方式を選べるのが現代のフレームワークの強みです。
</Callout>

### エッジコンピューティング

サーバーを「世界中の拠点」に分散させて、ユーザーに近い場所で処理する。

```mermaid
graph TD
    subgraph "従来: 東京にサーバー"
    Tokyo1[東京サーバー]
    JP1[日本ユーザー] -->|速い| Tokyo1
    US1[アメリカユーザー] -.->|遅い| Tokyo1
    end

    subgraph "エッジ: 世界中にサーバー"
    TokyoEdge[東京サーバー]
    USEdge[アメリカサーバー]
    JP2[日本ユーザー] -->|速い| TokyoEdge
    US2[アメリカユーザー] -->|速い| USEdge
    end

    style Tokyo1 fill:#ffcdd2
    style US1 fill:#ffcdd2
    style TokyoEdge fill:#c8e6c9
    style USEdge fill:#c8e6c9
    style JP2 fill:#c8e6c9
    style US2 fill:#c8e6c9
```

<Callout type="success">
エッジコンピューティングにより、世界中のユーザーに高速なレスポンスを提供できます。
</Callout>

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

