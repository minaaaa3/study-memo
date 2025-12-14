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

**注意**: ペイロードは**暗号化されていません**。Base64デコードすれば誰でも読めます。
秘密情報（パスワードなど）を入れてはいけません。

### 署名

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
// → 改ざんされていないことを証明
```

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

```
セッション:
1. ログイン → サーバー「セッションID: abc123、田中さんと紐づけて保存」
2. リクエスト → サーバー「abc123を検索...田中さんだ」
3. ログアウト → サーバー「abc123を削除」

JWT:
1. ログイン → サーバー「田中さんの情報を署名してトークンを発行」
2. リクエスト → サーバー「署名を検証...OK、中身を読む」
3. ログアウト → トークンを消すだけ（サーバー側に記録がない）
```

### メリット・デメリット

| 観点 | セッション | JWT |
|------|-----------|-----|
| サーバー負荷 | DB/Redisへのアクセスが必要 | 検証だけ（DBアクセス不要） |
| スケール | セッションストアの共有が必要 | ステートレスで簡単 |
| ログアウト | 即座に無効化できる | トークンは期限まで有効 |
| 情報量 | 小さい（IDだけ） | 大きい（情報含む） |
| セキュリティ | サーバー管理で安全 | 漏洩リスクに注意 |

---

## JWTの課題と対策

### 課題1：ログアウトできない問題

```
JWTは「発行したら期限まで有効」

問題シナリオ:
1. ユーザーがログアウト
2. でもトークンはまだ有効
3. トークンが漏洩してたら、期限まで使われ続ける
```

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

でもこれだとセッションと同じでは...？

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

```
アクセストークン:
- 有効期限: 15分
- APIアクセスに使う
- 漏洩しても被害が限定的

リフレッシュトークン:
- 有効期限: 7日
- アクセストークンの更新に使う
- より厳重に保管（httpOnly Cookie）
```

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

**されていません**。Base64エンコードされているだけで、誰でも読めます。

```javascript
// ペイロードを読む
const [header, payload, signature] = token.split('.');
const decoded = JSON.parse(atob(payload));
console.log(decoded);  // { userId: 1, email: "...", ... }
```

署名は「改ざんされていないこと」を保証するだけで、「読めないこと」は保証しません。

### 「JWTの方が安全」？

状況によります。

- **漏洩した場合**: セッションなら即座に無効化できる。JWTは期限まで有効
- **サーバー攻撃**: セッションストアが攻撃されるリスク vs 秘密鍵が漏洩するリスク

「ステートレスにしたい」明確な理由がなければ、セッションの方がシンプルで安全です。

---

## まとめ

- **JWT** = 情報を含んだ署名付きトークン
- **構造** = ヘッダー + ペイロード + 署名
- **暗号化ではない** = 誰でも読める。秘密情報は入れない
- **ステートレス** = DBアクセス不要で検証できる
- **無効化が難しい** = ブラックリストやリフレッシュトークンで対策
- **使いどころ** = マイクロサービス、ステートレス必須の場合

## 次の章へ

パスワードを安全に保存するには？ハッシュと暗号化の違いは？
→ [3-4. ハッシュと暗号化](./04-hash-encryption.md)
