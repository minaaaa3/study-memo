/**
 * 完全なCRUD APIサーバー
 * カリキュラム: 2-2. サーバーを建てる
 *
 * セットアップ:
 *   npm install
 *
 * 実行方法:
 *   npm start
 *
 * API:
 *   GET    /api/users      - ユーザー一覧取得
 *   GET    /api/users/:id  - ユーザー1件取得
 *   POST   /api/users      - ユーザー作成
 *   PUT    /api/users/:id  - ユーザー更新
 *   DELETE /api/users/:id  - ユーザー削除
 */

require("dotenv").config();
const express = require("express");
const app = express();

// --- ミドルウェア ---
app.use(express.json());

// リクエストログ
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS（開発用）
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// --- 仮のデータベース ---
let users = [
  { id: 1, name: "田中", email: "tanaka@example.com", createdAt: new Date() },
  { id: 2, name: "山田", email: "yamada@example.com", createdAt: new Date() },
];
let nextId = 3;

// --- ルーティング ---

// 一覧取得
app.get("/api/users", (req, res) => {
  // クエリパラメータでフィルタリング
  const { name, email } = req.query;
  let result = users;

  if (name) {
    result = result.filter((u) => u.name.includes(name));
  }
  if (email) {
    result = result.filter((u) => u.email.includes(email));
  }

  res.json({
    total: result.length,
    data: result,
  });
});

// 1件取得
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

// 作成
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;

  // バリデーション
  const errors = [];
  if (!name) errors.push("name is required");
  if (!email) errors.push("email is required");
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.push("email format is invalid");
  }
  if (email && users.find((u) => u.email === email)) {
    errors.push("email already exists");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    createdAt: new Date(),
  };
  users.push(newUser);

  res.status(201).json(newUser);
});

// 更新
app.put("/api/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, email } = req.body;

  // バリデーション
  const errors = [];
  if (email && !/\S+@\S+\.\S+/.test(email)) {
    errors.push("email format is invalid");
  }
  if (
    email &&
    users.find((u) => u.email === email && u.id !== parseInt(req.params.id))
  ) {
    errors.push("email already exists");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  users[index] = {
    ...users[index],
    ...(name && { name }),
    ...(email && { email }),
    updatedAt: new Date(),
  };

  res.json(users[index]);
});

// 削除
app.delete("/api/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  users.splice(index, 1);
  res.status(204).end();
});

// --- 404ハンドラ ---
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// --- エラーハンドラ ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- 起動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CRUD API Server running at http://localhost:${PORT}`);
  console.log("\n=== API Endpoints ===");
  console.log(`GET    http://localhost:${PORT}/api/users`);
  console.log(`GET    http://localhost:${PORT}/api/users/1`);
  console.log(`POST   http://localhost:${PORT}/api/users`);
  console.log(`PUT    http://localhost:${PORT}/api/users/1`);
  console.log(`DELETE http://localhost:${PORT}/api/users/1`);
  console.log("\n=== Test Commands ===");
  console.log(`curl http://localhost:${PORT}/api/users`);
  console.log(`curl http://localhost:${PORT}/api/users/1`);
  console.log(
    `curl -X POST http://localhost:${PORT}/api/users -H "Content-Type: application/json" -d '{"name":"佐藤","email":"sato@example.com"}'`
  );
  console.log(
    `curl -X PUT http://localhost:${PORT}/api/users/1 -H "Content-Type: application/json" -d '{"name":"田中太郎"}'`
  );
  console.log(`curl -X DELETE http://localhost:${PORT}/api/users/1`);
});
