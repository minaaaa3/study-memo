/**
 * パスワードハッシュ（bcrypt）
 *
 * パスワードの保存には専用のハッシュ関数を使う。
 * bcryptは意図的に遅く設計されており、総当たり攻撃に強い。
 *
 * npm install bcrypt
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

// === bcrypt の基本 ===

// パスワードのハッシュ化
async function hashPassword(password) {
  // saltRounds: 計算コスト（10〜12が推奨）
  // 数値が大きいほど安全だが遅くなる
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

// パスワードの検証
async function verifyPassword(password, hash) {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}

// === 使用例 ===
console.log('=== bcrypt パスワードハッシュ ===\n');

const password = 'MySecurePassword123!';

// ハッシュ化
const hash = await hashPassword(password);
console.log('パスワード:', password);
console.log('ハッシュ:', hash);
console.log('ハッシュの長さ:', hash.length, '文字\n');

// 検証
const isCorrect = await verifyPassword(password, hash);
const isWrong = await verifyPassword('wrongpassword', hash);

console.log('正しいパスワードで検証:', isCorrect);
console.log('間違ったパスワードで検証:', isWrong);

// 同じパスワードでも毎回異なるハッシュ（ソルトが異なる）
console.log('\n同じパスワードでも異なるハッシュ:');
const hash1 = await hashPassword('test');
const hash2 = await hashPassword('test');
console.log('1回目:', hash1);
console.log('2回目:', hash2);
console.log('同じ?:', hash1 === hash2); // false

// === Argon2（より新しい推奨アルゴリズム）===
// npm install argon2
/*
import argon2 from 'argon2';

async function hashWithArgon2(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64MB
    timeCost: 3,
    parallelism: 4,
  });
}

async function verifyWithArgon2(password, hash) {
  return await argon2.verify(hash, password);
}
*/

// === 実践: Express での使用例 ===
import express from 'express';

const app = express();
app.use(express.json());

// 仮のユーザーストア（実際はDB）
const users = new Map();

// ユーザー登録
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  // バリデーション
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // パスワード強度チェック
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    });
  }

  // 重複チェック
  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  // パスワードをハッシュ化して保存
  const passwordHash = await hashPassword(password);
  users.set(email, { email, passwordHash });

  res.status(201).json({ message: 'User registered successfully' });
});

// ログイン
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.get(email);

  if (!user) {
    // ユーザーが存在しない場合も同じエラーメッセージ（タイミング攻撃対策）
    // ダミーのハッシュ比較を行う
    await bcrypt.compare(password, '$2b$10$invalidhashforcomparison');
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // 実際はJWTトークン等を返す
  res.json({ message: 'Login successful', user: { email: user.email } });
});

// パスワード変更
app.post('/api/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  const user = users.get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 現在のパスワード確認
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  // 新パスワードの強度チェック
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ error: 'New password is too weak' });
  }

  // 新パスワードをハッシュ化して更新
  user.passwordHash = await hashPassword(newPassword);

  res.json({ message: 'Password changed successfully' });
});

// === ヘルパー関数 ===

// パスワード強度チェック
function isStrongPassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial
  );
}

// セキュアなランダムパスワード生成
function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

// パスワードリセットトークン生成
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

console.log('\n=== ヘルパー関数 ===');
console.log('生成したパスワード:', generateSecurePassword());
console.log('リセットトークン:', generateResetToken());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
});

export {
  hashPassword,
  verifyPassword,
  isStrongPassword,
  generateSecurePassword,
  generateResetToken,
};

/*
 * bcrypt の仕組み:
 *
 * ハッシュ形式: $2b$10$salt22chars.hash31chars
 *
 * - $2b$: bcryptバージョン
 * - $10$: コスト係数（2^10 = 1024回の繰り返し）
 * - salt22chars: ランダムなソルト
 * - hash31chars: 実際のハッシュ値
 *
 * ソルト:
 * - bcryptは自動でソルトを生成・付加
 * - 同じパスワードでも毎回異なるハッシュ
 * - レインボーテーブル攻撃を防ぐ
 *
 * コスト係数の選び方:
 * - 10: 一般的（約100ms）
 * - 12: 高セキュリティ（約300ms）
 * - 将来的にハードウェアが向上したら上げる
 *
 * なぜ SHA-256 を使わないのか:
 * - SHA-256は高速（数マイクロ秒）
 * - 高速 = 総当たり攻撃が容易
 * - bcryptは意図的に遅い（数百ミリ秒）
 * - 攻撃者のコストが大幅に増加
 */
