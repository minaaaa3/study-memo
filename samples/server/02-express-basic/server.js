/**
 * Express基本サーバー
 * カリキュラム: 2-2. サーバーを建てる
 *
 * セットアップ:
 *   npm init -y
 *   npm install express
 *
 * 実行方法:
 *   node server.js
 */

const express = require("express");
const app = express();

// JSONボディを自動でパース（ミドルウェア）
app.use(express.json());

// リクエストログを出力するミドルウェア
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- ルーティング ---

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Express Server!" });
});

app.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "田中" },
    { id: 2, name: "山田" },
  ]);
});

// パスパラメータが自動で取れる
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.json({ id: userId, name: "田中" });
});

app.post("/users", (req, res) => {
  // ボディが自動でパースされている
  const data = req.body;
  console.log("Received data:", data);
  res.status(201).json({ id: 3, ...data });
});

// クエリパラメータの例
app.get("/search", (req, res) => {
  const { q, limit } = req.query;
  res.json({
    query: q,
    limit: limit || 10,
    results: [],
  });
});

// --- 404ハンドラ ---
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// --- エラーハンドラ ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- 起動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
  console.log("\nTry these commands:");
  console.log(`  curl http://localhost:${PORT}/`);
  console.log(`  curl http://localhost:${PORT}/users`);
  console.log(`  curl http://localhost:${PORT}/users/1`);
  console.log(`  curl http://localhost:${PORT}/search?q=test&limit=5`);
  console.log(
    `  curl -X POST http://localhost:${PORT}/users -H "Content-Type: application/json" -d '{"name":"佐藤"}'`
  );
});
