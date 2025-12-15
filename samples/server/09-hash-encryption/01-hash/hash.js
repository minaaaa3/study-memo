/**
 * ハッシュ関数
 *
 * 任意のデータを固定長の値に変換する一方向関数。
 * 同じ入力は常に同じ出力になるが、出力から入力は推測できない。
 */

import crypto from 'crypto';

// === 基本的なハッシュ生成 ===

// SHA-256（最も一般的）
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// SHA-512（より長い出力）
function sha512(data) {
  return crypto.createHash('sha512').update(data).digest('hex');
}

// MD5（非推奨だが参考用）
function md5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

// === 使用例 ===
console.log('=== ハッシュ関数の基本 ===\n');

const message = 'Hello, World!';

console.log('入力:', message);
console.log('SHA-256:', sha256(message));
console.log('SHA-512:', sha512(message));
console.log('MD5:', md5(message), '(非推奨)\n');

// 同じ入力 → 同じ出力
console.log('同じ入力は同じ出力:');
console.log(sha256('test') === sha256('test')); // true

// 1文字違うだけで完全に異なる出力
console.log('\n1文字違うと完全に異なる:');
console.log('SHA-256("hello"):', sha256('hello'));
console.log('SHA-256("hallo"):', sha256('hallo'));

// === HMAC（メッセージ認証コード）===
// 秘密鍵を使ってハッシュを生成
function hmacSha256(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

console.log('\n=== HMAC ===');
const secret = 'my-secret-key';
const data = 'important message';

console.log('HMAC:', hmacSha256(data, secret));

// 署名検証
function verifyHmac(data, secret, signature) {
  const expected = hmacSha256(data, secret);
  // タイミング攻撃対策で timingSafeEqual を使用
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

const signature = hmacSha256(data, secret);
console.log('署名検証:', verifyHmac(data, secret, signature));

// === ファイルハッシュ ===
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

async function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = createReadStream(filePath);

  await pipeline(stream, hash);

  return hash.digest('hex');
}

// 使用例: const fileHash = await hashFile('./myfile.txt');

// === 実践的な使用例 ===

// 1. APIリクエストの署名
function signApiRequest(method, path, body, apiSecret) {
  const payload = `${method}${path}${JSON.stringify(body)}`;
  return hmacSha256(payload, apiSecret);
}

// 2. Webhook署名の検証
function verifyWebhookSignature(payload, signature, secret) {
  const expected = hmacSha256(payload, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

// 3. ETag生成
function generateETag(content) {
  return `"${sha256(content).slice(0, 16)}"`;
}

// 4. ユニークID生成（衝突しにくい）
function generateUniqueId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(8).toString('hex');
  return sha256(timestamp + random).slice(0, 32);
}

// 5. 重複検出
function isDuplicate(content, existingHashes) {
  const hash = sha256(content);
  return existingHashes.has(hash);
}

console.log('\n=== 実践的な使用例 ===');
console.log('ユニークID:', generateUniqueId());
console.log('ETag:', generateETag('{"data":"test"}'));

export {
  sha256,
  sha512,
  md5,
  hmacSha256,
  verifyHmac,
  hashFile,
  signApiRequest,
  verifyWebhookSignature,
  generateETag,
  generateUniqueId,
};

/*
 * ハッシュ関数の選び方:
 *
 * SHA-256:
 * - 一般的な用途に最適
 * - 256ビット（64文字の16進数）
 * - セキュリティと速度のバランスが良い
 *
 * SHA-512:
 * - より高いセキュリティが必要な場合
 * - 512ビット（128文字の16進数）
 * - 64ビットCPUでは実は速い
 *
 * MD5/SHA-1:
 * - ❌ セキュリティ用途には使用禁止
 * - 衝突が発見されている
 * - チェックサム等の非セキュリティ用途のみ
 *
 * HMAC:
 * - 秘密鍵を使った認証付きハッシュ
 * - APIの署名、Webhookの検証等
 *
 * 注意:
 * - パスワードのハッシュにはSHA-256を使わない
 * - パスワードには bcrypt/Argon2 を使用（02-password参照）
 */
