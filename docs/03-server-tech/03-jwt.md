# 3-3. JWT（トークン認証）

## 例え話：映画のチケット

JWTは「映画のチケット」のようなものです。

- チケットに情報が書いてある（座席、上映時間、タイトル）
- 改ざんすると無効になる（透かしやバーコード）
- チケットを見せるだけで入場できる（DBに問い合わせない）
- 有効期限がある

セッションが「ポイントカード」（IDだけ持ち、情報はサーバーにある）なのに対し、JWTは「チケット」（情報自体を持っている）です。

---

## 核心：JWTの構造

JWTは3つの部分からなります：

```mermaid
graph LR
    A[JWT トークン] --> B[ヘッダー]
    A --> C[ペイロード]
    A --> D[署名]

    B --> B1["alg: HS256<br/>typ: JWT"]
    C --> C1["userId: 1<br/>email: test@test.com<br/>exp: 有効期限"]
    D --> D1["HMAC-SHA256<br/>改ざん検知"]

    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#ffe1e1
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDg2NDAwfQ.5ub4T_D6R8Oo0c7X_V7K5HFpK0eC8Z3b-Y9VnKD8q5s
  │                              │                                                                │
  ヘッダー                         ペイロード（本文）                                                    署名
```

### ヘッダー

```json
{
  "alg": "HS256",  // 署名アルゴリズム
  "typ": "JWT"
}
// → Base64エンコード → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### ペイロード（本文）

```json
{
  "userId": 1,
  "email": "test@test.com",
  "role": "admin",
  "iat": 1600000000,  // 発行時刻
  "exp": 1600086400   // 有効期限
}
// → Base64エンコード
```

<Callout type="warning">
**重要**: ペイロードは**暗号化されていません**。Base64デコードすれば誰でも読めます。秘密情報（パスワードなど）を入れてはいけません。
</Callout>

### 署名

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
// → 改ざんされていないことを証明
```

<Callout type="info">
署名は「改ざんされていないこと」を保証するだけで、「読めないこと」は保証しません。
</Callout>

---

## コードで確認

### トークンの発行

```javascript
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;  // 秘密鍵（絶対に公開しない）

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 認証（省略）
  const user = await authenticate(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // JWTを発行
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    SECRET,
    { expiresIn: '24h' }  // 24時間後に期限切れ
  );

  res.json({ token });
});
```

### トークンの検証

```javascript
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 署名を検証し、ペイロードを取り出す
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 使用
app.get('/me', authenticate, (req, res) => {
  // req.user にはペイロードの内容が入っている
  res.json({
    userId: req.user.userId,
    email: req.user.email
  });
});
```

### クライアント側

```javascript
// ログイン時にトークンを受け取って保存
const response = await fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);  // 保存（注意：XSSリスクあり）

// APIリクエスト時に送信
const data = await fetch('/api/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json());
```

---

## セッションとの比較

```mermaid
sequenceDiagram
    participant B as ブラウザ
    participant S as サーバー

    Note over B,S: JWT認証の流れ
    B->>S: POST /login (email, password)
    S->>S: ユーザー情報を署名してトークン生成
    S-->>B: { token: "eyJhbG..." }
    B->>B: トークンを保存

    B->>S: GET /me (Authorization: Bearer eyJhbG...)
    S->>S: 署名を検証、ペイロードを読む
    S-->>B: { name: "田中" }

    Note over B,S: ※DBアクセスなしで認証完了
```

### メリット・デメリット

<SimpleComparison
  title="セッション vs JWT（詳細）"
  itemA="セッション"
  itemB="JWT"
  comparisons={[
    { aspect: 'サーバー負荷', a: 'DB/Redisアクセス必要', b: '署名検証のみ（軽い）' },
    { aspect: 'スケーラビリティ', a: 'ストア共有が必要', b: 'ステートレスで容易' },
    { aspect: 'ログアウト', a: '即座に無効化可能', b: '期限まで有効（対策必要）' },
    { aspect: '情報量', a: '小さい（IDのみ）', b: '大きい（情報含む）' },
    { aspect: '漏洩時のリスク', a: 'サーバーで無効化可能', b: '期限まで悪用される' }
  ]}
/>

<WhyButton title="なぜJWTを使うのか？">

**ステートレス**が最大の利点です。

- マイクロサービス構成で、各サービスが独立してトークン検証できる
- サーバーを増やしてもセッションストアの同期が不要
- API Gateway経由で複数サービスに認証情報を渡せる

ただし「明確な理由がなければセッションの方がシンプルで安全」という点も覚えておきましょう。

</WhyButton>

---

## JWTの課題と対策

<Callout type="warning">
JWTはステートレスであるがゆえに、即座の無効化が困難です。この特性を理解して使う必要があります。
</Callout>

### 課題1：ログアウトできない問題

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant S as サーバー

    U->>S: ログアウト
    S->>U: ログアウト完了
    Note over U,S: でもトークンは有効期限まで使える！

    U->>S: 古いトークンでリクエスト
    S->>S: 署名検証 → OK
    S->>U: 認証成功（本当は失敗させたい）
```

問題シナリオ:
1. ユーザーがログアウト
2. でもトークンはまだ有効
3. トークンが漏洩してたら、期限まで使われ続ける

**対策：ブラックリスト**

```javascript
const blacklist = new Set();  // 本番ではRedisなど

// ログアウト時
app.post('/logout', authenticate, (req, res) => {
  blacklist.add(req.token);  // このトークンを無効にする
  res.json({ success: true });
});

// 検証時
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (blacklist.has(token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }

  // 通常の検証...
};
```

<Callout type="info">
ブラックリストを使うとステートフルになり、セッション管理と同じような複雑さになります。JWTのステートレスというメリットが失われる点に注意してください。
</Callout>

### 課題2：トークンが大きい

ペイロードに情報を詰め込むと、毎回のリクエストで送るデータが増えます。

**対策：必要最小限の情報だけ入れる**

```javascript
// 入れすぎ
{
  userId: 1,
  email: "...",
  name: "...",
  role: "...",
  permissions: [...],
  profile: {...}
}

// 必要最小限
{
  userId: 1,
  role: "admin"
}
// 詳細はAPIで取得
```

---

## リフレッシュトークン

短い有効期限のアクセストークンと、長い有効期限のリフレッシュトークンを組み合わせる。

```mermaid
sequenceDiagram
    participant C as クライアント
    participant S as サーバー

    Note over C,S: ログイン時
    C->>S: ログイン情報
    S->>C: アクセストークン (15分)<br/>リフレッシュトークン (7日)

    Note over C,S: 通常のAPIリクエスト
    C->>S: アクセストークンでリクエスト
    S->>C: レスポンス

    Note over C,S: アクセストークン期限切れ
    C->>S: アクセストークンでリクエスト
    S->>C: 401 Token Expired

    Note over C,S: トークン更新
    C->>S: リフレッシュトークンで更新
    S->>C: 新しいアクセストークン (15分)

    C->>S: 新しいトークンでリクエスト
    S->>C: レスポンス
```

<Tabs items={[
  {
    label: "アクセストークン",
    content: `**短い有効期限のトークン**

- 有効期限: 15分
- APIアクセスに使う
- 漏洩しても被害が限定的（15分で無効化）
- LocalStorageに保存可能`
  },
  {
    label: "リフレッシュトークン",
    content: `**長い有効期限のトークン**

- 有効期限: 7日
- アクセストークンの更新に使う
- より厳重に保管（httpOnly Cookie推奨）
- DBに保存して無効化可能にする`
  }
]} />

### 実装例

```javascript
// ログイン時に両方発行
app.post('/login', (req, res) => {
  // 認証...

  const accessToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  // リフレッシュトークンはDBに保存（無効化できるように）
  await saveRefreshToken(user.id, refreshToken);

  // リフレッシュトークンはhttpOnly Cookieに
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // アクセストークンはレスポンスボディに
  res.json({ accessToken });
});

// アクセストークンの更新
app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    // DBでリフレッシュトークンが有効か確認
    const isValid = await validateRefreshToken(payload.userId, refreshToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // 新しいアクセストークンを発行
    const accessToken = jwt.sign({ userId: payload.userId }, SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## よくある誤解

### 「JWTは暗号化されている」？

<Callout type="warning">
**JWTは暗号化されていません**。Base64エンコードされているだけで、誰でも読めます。
</Callout>

```javascript
// ペイロードを読む
const [header, payload, signature] = token.split('.');
const decoded = JSON.parse(atob(payload));
console.log(decoded);  // { userId: 1, email: "...", ... }
```

<Callout type="info">
署名は「改ざんされていないこと」を保証するだけで、「読めないこと」は保証しません。パスワードやクレジットカード番号など、秘密情報は絶対にペイロードに入れないでください。
</Callout>

### 「JWTの方が安全」？

<Callout type="warning">
状況によります。一概に「JWTの方が安全」とは言えません。
</Callout>

<Tabs items={[
  {
    label: "漏洩した場合",
    content: `**セッション**: サーバー側で即座に無効化できる

**JWT**: 有効期限まで使われ続ける（ブラックリストを使えば無効化できるが、ステートレスのメリットが失われる）`
  },
  {
    label: "サーバー攻撃",
    content: `**セッション**: セッションストアが攻撃されるリスク

**JWT**: 秘密鍵が漏洩するリスク（秘密鍵が漏れると全トークンを偽造可能）`
  }
]} />

<Callout type="tip">
「ステートレスにしたい」明確な理由がなければ、セッションの方がシンプルで安全です。
</Callout>

---

## まとめ

- **JWT** = 情報を含んだ署名付きトークン
- **構造** = ヘッダー + ペイロード + 署名
- **暗号化ではない** = 誰でも読める。秘密情報は入れない
- **ステートレス** = DBアクセス不要で検証できる
- **無効化が難しい** = ブラックリストやリフレッシュトークンで対策
- **使いどころ** = マイクロサービス、ステートレス必須の場合

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [JWT認証サーバー](https://github.com/minaaaa3/study-memo/tree/main/samples/server/05-jwt-auth) - トークン発行・検証・ブラックリスト・デコード機能付き

