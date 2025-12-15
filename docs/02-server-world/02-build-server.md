# 2-2. サーバーを建てる

## 例え話：レストランの開店準備

サーバーを建てるのは、レストランを開店するようなものです。

1. **物件を借りる** → コンピュータを用意する
2. **内装を整える** → ソフトウェアをインストール
3. **メニューを決める** → エンドポイントを設計
4. **オペレーションを決める** → リクエストの処理を実装
5. **開店する** → サーバーを起動

---

## 段階的に作る：素のNode.js → Express

### レベル1：素のNode.js

```javascript
// level1-raw.js
const http = require('http');

const server = http.createServer((req, res) => {
  // URLの解析
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // ルーティング（全部手動）
  if (method === 'GET' && path === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Welcome!' }));
  }
  else if (method === 'GET' && path === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: '田中' }]));
  }
  else if (method === 'POST' && path === '/users') {
    // POSTデータの受信（手動でやると面倒）
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 2, ...data }));
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
```

**辛いポイント：**
- URLのパース、ボディの受信、全部自分で書く
- ルーティングがif文の嵐
- `/users/123` のようなパスパラメータの処理が面倒

### レベル2：Express

```javascript
// level2-express.js
const express = require('express');
const app = express();

// JSONボディを自動でパース（ミドルウェア）
app.use(express.json());

// ルーティングがシンプル
app.get('/', (req, res) => {
  res.json({ message: 'Welcome!' });
});

app.get('/users', (req, res) => {
  res.json([{ id: 1, name: '田中' }]);
});

app.get('/users/:id', (req, res) => {
  // パスパラメータが自動で取れる
  const userId = req.params.id;
  res.json({ id: userId, name: '田中' });
});

app.post('/users', (req, res) => {
  // ボディが自動でパースされている
  const data = req.body;
  res.status(201).json({ id: 2, ...data });
});

// 404ハンドラ
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
```

実行方法：

```bash
npm init -y
npm install express

node level2-express.js
```

---

## 実用的なサーバーの構造

### ディレクトリ構成

```
my-server/
├── src/
│   ├── index.js        # エントリーポイント
│   ├── routes/         # ルーティング定義
│   │   ├── users.js
│   │   └── posts.js
│   ├── controllers/    # リクエスト処理
│   │   ├── userController.js
│   │   └── postController.js
│   ├── services/       # ビジネスロジック
│   │   └── userService.js
│   ├── models/         # データ構造
│   │   └── User.js
│   └── middleware/     # 共通処理
│       ├── auth.js
│       └── errorHandler.js
├── package.json
└── .env                # 環境変数
```

### 実装例

```javascript
// src/index.js
const express = require('express');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

// ルーターをマウント
app.use('/api/users', userRoutes);

// エラーハンドラ（最後に配置）
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
```

```javascript
// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
```

```javascript
// src/controllers/userController.js
const userService = require('../services/userService');

module.exports = {
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
  // ... update, delete
};
```

```javascript
// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

---

## ミドルウェアという概念

### リクエストの流れ

```
リクエスト
    ↓
[ミドルウェア1] ログを出力
    ↓
[ミドルウェア2] 認証チェック
    ↓
[ミドルウェア3] JSONパース
    ↓
[ルートハンドラ] 実際の処理
    ↓
レスポンス
```

### ミドルウェアの書き方

```javascript
// ログを出力するミドルウェア
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();  // 次のミドルウェアへ
};

// 認証チェックのミドルウェア
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // トークンを検証...
  next();
};

// 使用
app.use(logger);                    // 全リクエストに適用
app.use('/api', auth);              // /api 以下に適用
app.get('/public', (req, res) => {  // 認証なしでアクセス可
  res.json({ message: 'Public' });
});
```

---

## 環境変数で設定を外に出す

### なぜ必要か

```javascript
// ダメな例：コードに直接書く
const dbPassword = 'supersecret123';

// 良い例：環境変数から読む
const dbPassword = process.env.DB_PASSWORD;
```

- パスワードがGitHubに公開されない
- 開発/本番で設定を切り替えられる

### 使い方

```bash
# .env ファイル（Gitにコミットしない）
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
JWT_SECRET=your-secret-key
```

```javascript
// dotenv で読み込む
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
```

```bash
npm install dotenv
```

---

## コードで確認：完全な例

```javascript
// complete-server.js
require('dotenv').config();
const express = require('express');
const app = express();

// --- ミドルウェア ---
app.use(express.json());

// リクエストログ
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- 仮のデータベース ---
let users = [
  { id: 1, name: '田中', email: 'tanaka@example.com' },
  { id: 2, name: '山田', email: 'yamada@example.com' },
];
let nextId = 3;

// --- ルーティング ---
// 一覧取得
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 1件取得
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// 作成
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const newUser = { id: nextId++, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 更新
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

// 削除
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users.splice(index, 1);
  res.status(204).end();
});

// --- 404ハンドラ ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- エラーハンドラ ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- 起動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

テスト：

```bash
# 起動
node complete-server.js

# 別ターミナルで
curl http://localhost:3000/api/users
curl http://localhost:3000/api/users/1
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"佐藤","email":"sato@example.com"}'
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"田中太郎"}'
curl -X DELETE http://localhost:3000/api/users/1
```

---

## よくある誤解

### 「Expressを使わないと作れない」？

素のNode.jsでも作れます。ただし、Expressが提供する便利機能を自分で実装することになります。

学習目的なら素のNode.jsで作ってみると理解が深まります。

### 「このコードで本番運用できる」？

このままでは足りません。本番に必要なもの：

- データベース（今は変数に保存してるだけ）
- 認証・認可
- 入力バリデーション
- ログ出力
- ヘルスチェックエンドポイント
- CORS設定
- レート制限
- etc...

---

## まとめ

- **素のNode.js**: 全部自分で書く必要があるが、仕組みがわかる
- **Express**: ルーティング、ミドルウェアなど便利機能を提供
- **ミドルウェア**: リクエストを処理する途中に挟む共通処理
- **環境変数**: 設定をコードの外に出す仕組み
- **CRUD**: Create（POST）、Read（GET）、Update（PUT）、Delete（DELETE）

---

## サンプルコード

この章の内容を実際に動かして試せるサンプルコードを用意しています。

- [素のNode.jsサーバー](https://github.com/minaaaa3/study-memo/tree/main/samples/server/01-raw-node) - 依存なしで即実行可能
- [Express基本](https://github.com/minaaaa3/study-memo/tree/main/samples/server/02-express-basic) - シンプルなExpressサーバー
- [完全なCRUD API](https://github.com/minaaaa3/study-memo/tree/main/samples/server/03-crud-api) - バリデーション付きの実用的なAPI

