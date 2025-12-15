/**
 * JWT認証サーバー
 * カリキュラム: 3-3. JWT（トークン認証）
 *
 * セットアップ:
 *   npm install
 *
 * 実行方法:
 *   npm start
 *
 * テスト:
 *   # 登録
 *   curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'
 *
 *   # ログイン（トークンを取得）
 *   curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'
 *
 *   # 認証が必要なエンドポイント（トークンを送信）
 *   curl http://localhost:3000/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
 *
 *   # トークンをデコード（中身を確認）
 *   curl http://localhost:3000/debug/decode?token=YOUR_TOKEN_HERE
 */

require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// --- 設定 ---
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

// --- 仮のデータベース ---
const users = [];
const blacklist = new Set(); // ログアウト済みトークンのブラックリスト

// --- ヘルパー関数 ---

// パスワードのハッシュ化（簡易版。本番ではbcryptを使う）
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ユーザー作成
function createUser(email, password) {
  const hashedPassword = hashPassword(password);
  const user = {
    id: users.length + 1,
    email,
    password: hashedPassword,
    role: "user",
  };
  users.push(user);
  return { id: user.id, email: user.email, role: user.role };
}

// メールでユーザー検索
function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

// パスワード検証
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// --- ミドルウェア ---

// JWT認証ミドルウェア
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "トークンが必要です" });
  }

  const token = authHeader.split(" ")[1];

  // ブラックリストチェック
  if (blacklist.has(token)) {
    return res.status(401).json({ error: "トークンは無効化されています" });
  }

  try {
    // 署名を検証し、ペイロードを取り出す
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "トークンの有効期限切れです" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "無効なトークンです" });
    }
    return res.status(401).json({ error: "認証エラー" });
  }
}

// --- ルーティング ---

// ヘルスチェック
app.get("/", (req, res) => {
  res.json({ message: "JWT Auth Server" });
});

// 登録
app.post("/auth/register", (req, res) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({ error: "メールとパスワードは必須です" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "パスワードは8文字以上必要です" });
    }

    if (findUserByEmail(email)) {
      return res.status(400).json({ error: "このメールは既に登録されています" });
    }

    const user = createUser(email, password);
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ログイン
app.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "メールまたはパスワードが違います" });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "メールまたはパスワードが違います" });
    }

    // JWTを発行
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`User ${user.id} logged in`);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ログアウト（トークンをブラックリストに追加）
app.post("/auth/logout", authenticate, (req, res) => {
  blacklist.add(req.token);
  console.log(`Token blacklisted: ${req.token.slice(0, 20)}...`);
  res.json({ success: true });
});

// 認証が必要なエンドポイント
app.get("/me", authenticate, (req, res) => {
  // req.user にはJWTのペイロードが入っている
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role,
  });
});

// 管理者のみアクセス可能なエンドポイント
app.get("/admin", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "管理者権限が必要です" });
  }
  res.json({ message: "Welcome, admin!" });
});

// --- デバッグ用エンドポイント ---

// トークンの中身をデコード（署名検証なし）
app.get("/debug/decode", (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "token query parameter is required" });
  }

  try {
    // 署名検証なしでデコード
    const decoded = jwt.decode(token, { complete: true });
    res.json({
      header: decoded.header,
      payload: decoded.payload,
      note: "ペイロードは暗号化されていないので誰でも読める！秘密情報は入れない！",
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid token format" });
  }
});

// ブラックリスト一覧
app.get("/debug/blacklist", (req, res) => {
  const tokens = [];
  blacklist.forEach((token) => {
    tokens.push(token.slice(0, 20) + "...");
  });
  res.json({ blacklist: tokens, count: blacklist.size });
});

// ユーザー一覧
app.get("/debug/users", (req, res) => {
  res.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
    })),
    count: users.length,
  });
});

// --- 起動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JWT Auth Server running at http://localhost:${PORT}`);
  console.log(`JWT Secret: ${JWT_SECRET.slice(0, 10)}...`);
  console.log(`JWT Expires In: ${JWT_EXPIRES_IN}`);
  console.log("\n=== Test Commands ===");
  console.log(
    `# 1. 登録\ncurl -X POST http://localhost:${PORT}/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'`
  );
  console.log(
    `\n# 2. ログイン（トークンを取得）\ncurl -X POST http://localhost:${PORT}/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'`
  );
  console.log(
    `\n# 3. 認証が必要なエンドポイント（YOUR_TOKENを置き換える）\ncurl http://localhost:${PORT}/me -H "Authorization: Bearer YOUR_TOKEN"`
  );
  console.log(
    `\n# 4. トークンの中身をデコード\ncurl "http://localhost:${PORT}/debug/decode?token=YOUR_TOKEN"`
  );
  console.log(
    `\n# 5. ログアウト\ncurl -X POST http://localhost:${PORT}/auth/logout -H "Authorization: Bearer YOUR_TOKEN"`
  );
});
