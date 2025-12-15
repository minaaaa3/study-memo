/**
 * 暗号化と復号（AES-256-GCM）
 *
 * データを暗号化して安全に保存・送信する。
 * AES-256-GCMは認証付き暗号化で、改ざん検知も可能。
 */

import crypto from 'crypto';

// === AES-256-GCM 暗号化 ===

// 暗号化
function encrypt(plaintext, secretKey) {
  // キーは32バイト（256ビット）必要
  const key = crypto.scryptSync(secretKey, 'salt', 32);

  // IV（初期化ベクトル）は毎回ランダム生成
  const iv = crypto.randomBytes(16);

  // 暗号化
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 認証タグ（改ざん検知用）
  const authTag = cipher.getAuthTag();

  // IV + authTag + 暗号文 を結合して返す
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted,
  };
}

// 復号
function decrypt(encryptedData, secretKey) {
  const key = crypto.scryptSync(secretKey, 'salt', 32);

  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  const encrypted = encryptedData.encrypted;

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// === シンプルなバージョン（文字列で返す）===

function encryptString(plaintext, secretKey) {
  const result = encrypt(plaintext, secretKey);
  // IV:authTag:encrypted の形式で結合
  return `${result.iv}:${result.authTag}:${result.encrypted}`;
}

function decryptString(encryptedString, secretKey) {
  const [iv, authTag, encrypted] = encryptedString.split(':');
  return decrypt({ iv, authTag, encrypted }, secretKey);
}

// === 使用例 ===
console.log('=== AES-256-GCM 暗号化 ===\n');

const secretKey = 'my-super-secret-key-keep-it-safe!';
const plaintext = '機密情報: クレジットカード番号 1234-5678-9012-3456';

console.log('平文:', plaintext);

// 暗号化
const encrypted = encryptString(plaintext, secretKey);
console.log('暗号文:', encrypted);

// 復号
const decrypted = decryptString(encrypted, secretKey);
console.log('復号:', decrypted);

// 同じ平文でも毎回異なる暗号文（IVが異なる）
console.log('\n同じ平文でも異なる暗号文:');
console.log('1回目:', encryptString('test', secretKey));
console.log('2回目:', encryptString('test', secretKey));

// === JSON データの暗号化 ===

function encryptJSON(data, secretKey) {
  const jsonString = JSON.stringify(data);
  return encryptString(jsonString, secretKey);
}

function decryptJSON(encryptedString, secretKey) {
  const jsonString = decryptString(encryptedString, secretKey);
  return JSON.parse(jsonString);
}

console.log('\n=== JSONデータの暗号化 ===');

const sensitiveData = {
  apiKey: 'sk_live_abc123',
  credentials: {
    username: 'admin',
    password: 'secret',
  },
};

const encryptedJSON = encryptJSON(sensitiveData, secretKey);
console.log('暗号化されたJSON:', encryptedJSON.slice(0, 50) + '...');

const decryptedJSON = decryptJSON(encryptedJSON, secretKey);
console.log('復号されたJSON:', decryptedJSON);

// === 実践: 環境変数の暗号化 ===

// 暗号化された環境変数ファイルの形式
const encryptedEnv = {
  DATABASE_URL: encryptString('postgresql://user:pass@localhost/db', secretKey),
  API_KEY: encryptString('sk_live_abc123xyz', secretKey),
  JWT_SECRET: encryptString('super-secret-jwt-key', secretKey),
};

console.log('\n=== 暗号化された環境変数 ===');
console.log(encryptedEnv);

// 復号して使用
function loadEncryptedEnv(encryptedEnv, masterKey) {
  const env = {};
  for (const [key, value] of Object.entries(encryptedEnv)) {
    env[key] = decryptString(value, masterKey);
  }
  return env;
}

const decryptedEnv = loadEncryptedEnv(encryptedEnv, secretKey);
console.log('\n復号された環境変数:', decryptedEnv);

// === Express での使用例 ===
import express from 'express';

const app = express();
app.use(express.json());

// 暗号化キー（実際は環境変数から）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || secretKey;

// センシティブデータの暗号化保存
app.post('/api/store-sensitive', (req, res) => {
  const { data } = req.body;

  // 暗号化して保存（実際はDBへ）
  const encrypted = encryptString(JSON.stringify(data), ENCRYPTION_KEY);

  res.json({
    message: 'Data stored securely',
    encrypted: encrypted.slice(0, 30) + '...', // 一部だけ表示
  });
});

// センシティブデータの復号取得
app.get('/api/get-sensitive', (req, res) => {
  // DBから暗号化データを取得（仮）
  const encryptedFromDb = encryptString('{"secret":"value"}', ENCRYPTION_KEY);

  try {
    const decrypted = decryptString(encryptedFromDb, ENCRYPTION_KEY);
    res.json({ data: JSON.parse(decrypted) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to decrypt data' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
});

export {
  encrypt,
  decrypt,
  encryptString,
  decryptString,
  encryptJSON,
  decryptJSON,
  loadEncryptedEnv,
};

/*
 * AES-256-GCM の特徴:
 *
 * AES (Advanced Encryption Standard):
 * - 米国標準の暗号化アルゴリズム
 * - 256ビットキー = 最高レベルのセキュリティ
 *
 * GCM (Galois/Counter Mode):
 * - 認証付き暗号化モード
 * - 暗号化 + 改ざん検知
 * - authTag で完全性を検証
 *
 * IV (Initialization Vector):
 * - 毎回ランダムに生成
 * - 同じ平文でも異なる暗号文
 * - 暗号文と一緒に保存（秘密にする必要なし）
 *
 * ベストプラクティス:
 *
 * 1. キー管理
 *    - キーは環境変数やシークレットマネージャーで管理
 *    - コードにハードコードしない
 *    - 定期的にローテーション
 *
 * 2. IV
 *    - 毎回新しいIVを生成
 *    - 同じIVを再利用しない
 *
 * 3. エラーハンドリング
 *    - 復号失敗時は具体的な理由を漏らさない
 *    - タイミング攻撃に注意
 *
 * 4. 用途に応じた選択
 *    - データ保存: AES-256-GCM
 *    - パスワード: bcrypt（復号不要）
 *    - 通信: TLS/HTTPS
 */
