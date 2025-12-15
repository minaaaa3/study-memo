/**
 * 生SQL（better-sqlite3）でデータベース操作
 *
 * SQLの基本を理解するためのサンプル。
 * 実務ではORMを使うが、仕組みを知っておくと役立つ。
 *
 * npm install better-sqlite3
 */

import Database from 'better-sqlite3';

// データベース接続（ファイルがなければ作成）
const db = new Database('app.db');

// === テーブル作成 ===
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// === INSERT（作成）===
function createUser(email, name) {
  const stmt = db.prepare(`
    INSERT INTO users (email, name) VALUES (?, ?)
  `);

  const result = stmt.run(email, name);
  return result.lastInsertRowid;
}

// === SELECT（読み取り）===
function getUserById(id) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `);

  return stmt.get(id); // 1件取得
}

function getAllUsers() {
  const stmt = db.prepare(`
    SELECT * FROM users ORDER BY created_at DESC
  `);

  return stmt.all(); // 全件取得
}

// === UPDATE（更新）===
function updateUser(id, name) {
  const stmt = db.prepare(`
    UPDATE users SET name = ? WHERE id = ?
  `);

  const result = stmt.run(name, id);
  return result.changes; // 更新された行数
}

// === DELETE（削除）===
function deleteUser(id) {
  const stmt = db.prepare(`
    DELETE FROM users WHERE id = ?
  `);

  const result = stmt.run(id);
  return result.changes;
}

// === JOIN（テーブル結合）===
function getPostsWithUser() {
  const stmt = db.prepare(`
    SELECT
      posts.id,
      posts.title,
      posts.content,
      users.name as author_name,
      posts.created_at
    FROM posts
    INNER JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `);

  return stmt.all();
}

// === トランザクション ===
function createUserWithPost(email, name, postTitle, postContent) {
  const transaction = db.transaction(() => {
    // ユーザー作成
    const userStmt = db.prepare(`
      INSERT INTO users (email, name) VALUES (?, ?)
    `);
    const userId = userStmt.run(email, name).lastInsertRowid;

    // 投稿作成
    const postStmt = db.prepare(`
      INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)
    `);
    postStmt.run(postTitle, postContent, userId);

    return userId;
  });

  // トランザクション実行（失敗したら自動でロールバック）
  return transaction();
}

// === 使用例 ===
console.log('=== データベース操作サンプル ===\n');

// ユーザー作成
const userId = createUser('taro@example.com', '田中太郎');
console.log('作成したユーザーID:', userId);

// ユーザー取得
const user = getUserById(userId);
console.log('取得したユーザー:', user);

// ユーザー更新
updateUser(userId, '田中次郎');
console.log('更新後:', getUserById(userId));

// 全ユーザー
console.log('全ユーザー:', getAllUsers());

// クリーンアップ
// db.close();

/*
 * SQLインジェクション対策:
 *
 * ❌ 危険（文字列結合）
 * db.prepare(`SELECT * FROM users WHERE email = '${email}'`)
 *
 * ✅ 安全（プレースホルダー）
 * db.prepare('SELECT * FROM users WHERE email = ?')
 * stmt.get(email)
 *
 * プレースホルダーを使えば、入力値は自動でエスケープされる
 */

export {
  db,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getPostsWithUser,
  createUserWithPost,
};
