# サンプルコード

カリキュラムで学ぶ内容を実際に動かして試せるサンプルコード集です。

## 前提条件

- Node.js 18以上
- npm または pnpm

## ディレクトリ構成

```
samples/
├── server/                      # サーバーサイドのサンプル
│   ├── 01-raw-node/            # 素のNode.jsサーバー
│   ├── 02-express-basic/       # Express基本
│   ├── 03-crud-api/            # 完全なCRUD API
│   ├── 04-session-auth/        # セッション認証
│   └── 05-jwt-auth/            # JWT認証
│
├── client/                      # クライアントサイドのサンプル
│   ├── 01-async/               # 非同期処理
│   ├── 02-state-management/    # 状態管理（React）
│   └── 03-form-validation/     # フォームバリデーション（React）
│
└── README.md
```

---

## サーバーサイド

### 01-raw-node: 素のNode.jsサーバー

**カリキュラム**: 2-2. サーバーを建てる

素のNode.jsでHTTPサーバーを建てる。フレームワークを使わないので、仕組みがわかる。

```bash
cd samples/server/01-raw-node
node server.js
```

テスト:
```bash
curl http://localhost:3000/
curl http://localhost:3000/users
curl http://localhost:3000/users/1
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"佐藤","email":"sato@example.com"}'
```

### 02-express-basic: Express基本

**カリキュラム**: 2-2. サーバーを建てる

Expressを使ったシンプルなサーバー。ルーティング、ミドルウェアの基本。

```bash
cd samples/server/02-express-basic
npm install
npm start
```

### 03-crud-api: 完全なCRUD API

**カリキュラム**: 2-2. サーバーを建てる

Create, Read, Update, Delete を全て実装したAPIサーバー。

```bash
cd samples/server/03-crud-api
npm install
npm start
```

テスト:
```bash
# 一覧取得
curl http://localhost:3000/api/users

# 1件取得
curl http://localhost:3000/api/users/1

# 作成
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"佐藤","email":"sato@example.com"}'

# 更新
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"田中太郎"}'

# 削除
curl -X DELETE http://localhost:3000/api/users/1
```

### 04-session-auth: セッション認証

**カリキュラム**: 3-2. セッション管理, 6-1. 認証システムを作る

Cookie + セッションIDによる認証。HTTPがステートレスなことをセッションで補う。

```bash
cd samples/server/04-session-auth
npm install
npm start
```

テスト:
```bash
# 1. 登録
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 2. ログイン (Cookieをcookies.txtに保存)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' \
  -c cookies.txt

# 3. 認証が必要なエンドポイント
curl http://localhost:3000/me -b cookies.txt

# 4. ログアウト
curl -X POST http://localhost:3000/auth/logout -b cookies.txt

# デバッグ
curl http://localhost:3000/debug/sessions
curl http://localhost:3000/debug/users
```

### 05-jwt-auth: JWT認証

**カリキュラム**: 3-3. JWT（トークン認証）

JWTによるステートレスな認証。トークンの中身をデコードする機能付き。

```bash
cd samples/server/05-jwt-auth
npm install
npm start
```

テスト:
```bash
# 1. 登録
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 2. ログイン（トークンを取得）
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# → { "token": "eyJhbG..." } が返る

# 3. 認証が必要なエンドポイント（YOUR_TOKENを置き換える）
curl http://localhost:3000/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. トークンの中身をデコード（暗号化されていないことを確認！）
curl "http://localhost:3000/debug/decode?token=YOUR_TOKEN"

# 5. ログアウト（ブラックリストに追加）
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## クライアントサイド

### 01-async: 非同期処理

**カリキュラム**: 4-5. 非同期処理

コールバック → Promise → async/await の進化を体験。

```bash
cd samples/client/01-async

# 各ファイルを順番に実行
node 01-callback.js        # コールバック地獄
node 02-promise.js         # Promiseチェーン
node 03-async-await.js     # async/await
node 04-promise-all.js     # 並列実行
node 05-promise-allsettled.js  # エラーハンドリング
node 06-fetch-api.js       # fetch API（実際のAPI呼び出し）
```

### 02-state-management: 状態管理

**カリキュラム**: 4-2. 状態管理

useState → Context → Zustand → Redux の比較。ブラウザで動くReactアプリ。

```bash
cd samples/client/02-state-management
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

4つの状態管理手法を切り替えて比較できます:
1. **useState**: ローカル状態管理
2. **Context API**: グローバル状態管理（Props drilling回避）
3. **Zustand**: シンプルな状態管理ライブラリ
4. **Redux Toolkit**: 大規模アプリ向け

### 03-form-validation: フォームバリデーション

**カリキュラム**: 4-6. フォームとバリデーション

素のReact → Zod → React Hook Form → RHF + Zod の比較。

```bash
cd samples/client/03-form-validation
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

4つのアプローチを切り替えて比較できます:
1. **素のReact**: 全部手動で管理（大変）
2. **Zod**: スキーマバリデーション
3. **React Hook Form**: フォーム状態管理
4. **RHF + Zod**: 最強の組み合わせ（推奨）

---

## 学習のヒント

### サーバーサイド

1. **01-raw-node** を読んで、HTTPサーバーの仕組みを理解
2. **02-express-basic** で、フレームワークが何を便利にしているか確認
3. **03-crud-api** で、実用的なAPIの構造を学ぶ
4. **04-session-auth** と **05-jwt-auth** で、認証の仕組みを比較

### クライアントサイド

1. **01-async** の各ファイルを順番に実行して、非同期処理の進化を体験
2. **02-state-management** で、状態管理の選択肢を比較
3. **03-form-validation** で、フォーム実装のベストプラクティスを学ぶ

### 対応するカリキュラム

| サンプル | カリキュラム |
|---------|-------------|
| 01-raw-node, 02-express, 03-crud | 2-2. サーバーを建てる |
| 04-session-auth | 3-2. セッション管理 |
| 05-jwt-auth | 3-3. JWT（トークン認証）|
| 01-async | 4-5. 非同期処理 |
| 02-state-management | 4-2. 状態管理 |
| 03-form-validation | 4-6. フォームとバリデーション |
