/**
 * セッション認証サーバー
 * カリキュラム: 3-2. セッション管理, 6-1. 認証システムを作る
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
 *   # ログイン
 *   curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}' -c cookies.txt
 *
 *   # 認証が必要なエンドポイント
 *   curl http://localhost:3000/me -b cookies.txt
 *
 *   # ログアウト
 *   curl -X POST http://localhost:3000/auth/logout -b cookies.txt
 */

require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- 仮のデータベース ---
const users = [];
const sessions = new Map();

// --- ヘルパー関数 ---

// パスワードのハッシュ化（簡易版。本番ではbcryptを使う）
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// セッションIDの生成
function generateSessionId() {
  return crypto.randomBytes(32).toString("hex");
}

// ユーザー作成
function createUser(email, password) {
  const hashedPassword = hashPassword(password);
  const user = { id: users.length + 1, email, password: hashedPassword };
  users.push(user);
  return { id: user.id, email: user.email };
}

// メールでユーザー検索
function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

// パスワード検証
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// セッション作成
function createSession(userId) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    userId,
    createdAt: Date.now(),
  });
  return sessionId;
}

// セッション取得
function getSession(sessionId) {
  return sessions.get(sessionId);
}

// セッション削除
function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

// --- ミドルウェア ---

// 認証ミドルウェア
function authenticate(req, res, next) {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    return res.status(401).json({ error: "ログインが必要です" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: "セッションが無効です" });
  }

  // セッションの有効期限チェック（24時間）
  const sessionAge = Date.now() - session.createdAt;
  if (sessionAge > 24 * 60 * 60 * 1000) {
    deleteSession(sessionId);
    return res.status(401).json({ error: "セッションの有効期限切れです" });
  }

  req.userId = session.userId;
  req.sessionId = sessionId;
  next();
}

// --- ルーティング ---

// ヘルスチェック
app.get("/", (req, res) => {
  res.json({ message: "Session Auth Server" });
});

// 登録
app.post("/auth/register", (req, res) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "メールとパスワードは必須です" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "パスワードは8文字以上必要です" });
    }

    if (findUserByEmail(email)) {
      return res
        .status(400)
        .json({ error: "このメールは既に登録されています" });
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
      return res
        .status(401)
        .json({ error: "メールまたはパスワードが違います" });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ error: "メールまたはパスワードが違います" });
    }

    const sessionId = createSession(user.id);

    // CookieにセッションIDを保存
    res.cookie("sessionId", sessionId, {
      httpOnly: true, // JavaScriptからアクセス不可（XSS対策）
      secure: process.env.NODE_ENV === "production", // HTTPSのみ
      sameSite: "strict", // CSRF対策
      maxAge: 24 * 60 * 60 * 1000, // 24時間
    });

    console.log(`User ${user.id} logged in. Session: ${sessionId.slice(0, 8)}...`);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ログアウト
app.post("/auth/logout", (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    deleteSession(sessionId);
    console.log(`Session destroyed: ${sessionId.slice(0, 8)}...`);
  }
  res.clearCookie("sessionId");
  res.json({ success: true });
});

// 認証が必要なエンドポイント
app.get("/me", authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  res.json({
    id: user.id,
    email: user.email,
  });
});

// セッション一覧（デバッグ用）
app.get("/debug/sessions", (req, res) => {
  const sessionList = [];
  sessions.forEach((value, key) => {
    sessionList.push({
      sessionId: key.slice(0, 8) + "...",
      userId: value.userId,
      age: Math.round((Date.now() - value.createdAt) / 1000) + "秒",
    });
  });
  res.json({ sessions: sessionList, count: sessions.size });
});

// ユーザー一覧（デバッグ用）
app.get("/debug/users", (req, res) => {
  res.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
    })),
    count: users.length,
  });
});

// --- 起動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Session Auth Server running at http://localhost:${PORT}`);
  console.log("\n=== Test Commands ===");
  console.log(
    `# 1. 登録\ncurl -X POST http://localhost:${PORT}/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}'`
  );
  console.log(
    `\n# 2. ログイン (Cookieを保存)\ncurl -X POST http://localhost:${PORT}/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123"}' -c cookies.txt`
  );
  console.log(
    `\n# 3. 認証が必要なエンドポイント\ncurl http://localhost:${PORT}/me -b cookies.txt`
  );
  console.log(
    `\n# 4. ログアウト\ncurl -X POST http://localhost:${PORT}/auth/logout -b cookies.txt`
  );
  console.log(
    `\n# デバッグ\ncurl http://localhost:${PORT}/debug/sessions\ncurl http://localhost:${PORT}/debug/users`
  );
});
