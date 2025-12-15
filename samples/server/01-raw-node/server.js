/**
 * 素のNode.jsでサーバーを建てる
 * カリキュラム: 2-2. サーバーを建てる
 *
 * 実行方法:
 *   node server.js
 *
 * テスト:
 *   curl http://localhost:3000/
 *   curl http://localhost:3000/users
 *   curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"佐藤","email":"sato@example.com"}'
 */

const http = require("http");

// 仮のデータベース
let users = [
  { id: 1, name: "田中", email: "tanaka@example.com" },
  { id: 2, name: "山田", email: "yamada@example.com" },
];
let nextId = 3;

const server = http.createServer((req, res) => {
  // URLの解析
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // ログを出力
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  // CORSヘッダー（開発用）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // プリフライトリクエスト
  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ルーティング（全部手動）
  if (method === "GET" && path === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Welcome to Raw Node.js Server!" }));
  } else if (method === "GET" && path === "/users") {
    // ユーザー一覧取得
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (method === "GET" && path.match(/^\/users\/\d+$/)) {
    // ユーザー1件取得
    const id = parseInt(path.split("/")[2]);
    const user = users.find((u) => u.id === id);

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    }
  } else if (method === "POST" && path === "/users") {
    // ユーザー作成（POSTデータの受信は手動でやると面倒）
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        // バリデーション
        if (!data.name || !data.email) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "name and email are required" }));
          return;
        }

        const newUser = { id: nextId++, ...data };
        users.push(newUser);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newUser));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (method === "PUT" && path.match(/^\/users\/\d+$/)) {
    // ユーザー更新
    const id = parseInt(path.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const index = users.findIndex((u) => u.id === id);

        if (index === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User not found" }));
          return;
        }

        users[index] = { ...users[index], ...data };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users[index]));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else if (method === "DELETE" && path.match(/^\/users\/\d+$/)) {
    // ユーザー削除
    const id = parseInt(path.split("/")[2]);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    } else {
      users.splice(index, 1);
      res.writeHead(204);
      res.end();
    }
  } else {
    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Raw Node.js Server running at http://localhost:${PORT}`);
  console.log("\nTry these commands:");
  console.log(`  curl http://localhost:${PORT}/`);
  console.log(`  curl http://localhost:${PORT}/users`);
  console.log(`  curl http://localhost:${PORT}/users/1`);
  console.log(
    `  curl -X POST http://localhost:${PORT}/users -H "Content-Type: application/json" -d '{"name":"佐藤","email":"sato@example.com"}'`
  );
});
