/**
 * Redis キャッシュ
 *
 * 高速な外部キャッシュストア。複数サーバー間で共有可能。
 *
 * npm install redis
 * docker run -d -p 6379:6379 redis
 */

import { createClient } from 'redis';

// Redis接続
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));

await redis.connect();

// === 基本操作 ===

// 文字列の設定・取得
async function basicStringOperations() {
  // 設定
  await redis.set('key', 'value');

  // TTL付き設定（秒）
  await redis.setEx('temp-key', 60, 'expires in 60 seconds');

  // 取得
  const value = await redis.get('key');
  console.log('value:', value);

  // 削除
  await redis.del('key');

  // 存在チェック
  const exists = await redis.exists('key');
  console.log('exists:', exists);
}

// === JSONデータのキャッシュ ===
async function cacheJSON(key, data, ttlSeconds = 3600) {
  await redis.setEx(key, ttlSeconds, JSON.stringify(data));
}

async function getJSON(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

// === キャッシュパターン: Cache-Aside ===
async function getOrSetCache(key, fetchFn, ttlSeconds = 3600) {
  // キャッシュから取得
  const cached = await redis.get(key);
  if (cached) {
    console.log(`Cache HIT: ${key}`);
    return JSON.parse(cached);
  }

  console.log(`Cache MISS: ${key}`);

  // キャッシュミス: データ取得
  const data = await fetchFn();

  // キャッシュに保存
  await redis.setEx(key, ttlSeconds, JSON.stringify(data));

  return data;
}

// === ハッシュ（オブジェクト）===
async function hashOperations() {
  // ユーザー情報をハッシュで保存
  await redis.hSet('user:1', {
    name: '田中太郎',
    email: 'taro@example.com',
    age: '30',
  });

  // 単一フィールド取得
  const name = await redis.hGet('user:1', 'name');
  console.log('name:', name);

  // 全フィールド取得
  const user = await redis.hGetAll('user:1');
  console.log('user:', user);

  // フィールド更新
  await redis.hSet('user:1', 'age', '31');

  // フィールド削除
  await redis.hDel('user:1', 'age');
}

// === リスト（キュー）===
async function listOperations() {
  // 右から追加
  await redis.rPush('queue', 'job1', 'job2', 'job3');

  // 左から取得（FIFO）
  const job = await redis.lPop('queue');
  console.log('job:', job);

  // 範囲取得
  const items = await redis.lRange('queue', 0, -1);
  console.log('items:', items);

  // リスト長
  const length = await redis.lLen('queue');
  console.log('length:', length);
}

// === セット（ユニーク値）===
async function setOperations() {
  // 追加
  await redis.sAdd('tags', 'javascript', 'nodejs', 'redis');

  // メンバーチェック
  const isMember = await redis.sIsMember('tags', 'nodejs');
  console.log('isMember:', isMember);

  // 全メンバー取得
  const tags = await redis.sMembers('tags');
  console.log('tags:', tags);

  // 集合演算
  await redis.sAdd('tags2', 'nodejs', 'python', 'go');
  const intersection = await redis.sInter('tags', 'tags2');
  console.log('intersection:', intersection);
}

// === ソート済みセット（ランキング）===
async function sortedSetOperations() {
  // スコア付きで追加
  await redis.zAdd('leaderboard', [
    { score: 100, value: 'player1' },
    { score: 200, value: 'player2' },
    { score: 150, value: 'player3' },
  ]);

  // スコア順で取得（上位3件）
  const top3 = await redis.zRangeWithScores('leaderboard', 0, 2, { REV: true });
  console.log('top3:', top3);

  // ランキング取得
  const rank = await redis.zRevRank('leaderboard', 'player3');
  console.log('player3 rank:', rank + 1); // 0-indexed

  // スコア更新
  await redis.zIncrBy('leaderboard', 50, 'player3');
}

// === セッションストア ===
const SESSION_TTL = 60 * 60 * 24; // 24時間

async function saveSession(sessionId, data) {
  const key = `session:${sessionId}`;
  await redis.setEx(key, SESSION_TTL, JSON.stringify(data));
}

async function getSession(sessionId) {
  const key = `session:${sessionId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function deleteSession(sessionId) {
  const key = `session:${sessionId}`;
  await redis.del(key);
}

async function refreshSession(sessionId) {
  const key = `session:${sessionId}`;
  await redis.expire(key, SESSION_TTL);
}

// === レート制限 ===
async function rateLimit(userId, limit = 100, windowSeconds = 60) {
  const key = `ratelimit:${userId}`;

  // カウント増加
  const count = await redis.incr(key);

  // 初回なら期限設定
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  // TTL取得
  const ttl = await redis.ttl(key);

  return {
    allowed: count <= limit,
    current: count,
    limit,
    remaining: Math.max(0, limit - count),
    resetIn: ttl,
  };
}

// === Express統合 ===
import express from 'express';

const app = express();
app.use(express.json());

// キャッシュミドルウェア
function redisCacheMiddleware(ttlSeconds = 60) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);

    if (cached) {
      console.log(`Redis Cache HIT: ${key}`);
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      await redis.setEx(key, ttlSeconds, JSON.stringify(data));
      return originalJson(data);
    };

    next();
  };
}

// レート制限ミドルウェア
function rateLimitMiddleware(limit = 100, windowSeconds = 60) {
  return async (req, res, next) => {
    const userId = req.ip; // または req.user.id
    const result = await rateLimit(userId, limit, windowSeconds);

    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetIn);

    if (!result.allowed) {
      return res.status(429).json({ error: 'Too Many Requests' });
    }

    next();
  };
}

// APIエンドポイント
app.get('/api/data', redisCacheMiddleware(30), async (req, res) => {
  // 重い処理のシミュレーション
  await new Promise(r => setTimeout(r, 1000));
  res.json({
    data: 'Heavy computation result',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/limited', rateLimitMiddleware(10, 60), (req, res) => {
  res.json({ message: 'OK' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// クリーンアップ
process.on('SIGINT', async () => {
  await redis.quit();
  process.exit(0);
});

export {
  redis,
  cacheJSON,
  getJSON,
  getOrSetCache,
  saveSession,
  getSession,
  deleteSession,
  rateLimit,
};

/*
 * Redisベストプラクティス:
 *
 * 1. キー命名規則
 *    - コロンで区切る: user:1:profile
 *    - プレフィックスで分類: cache:, session:, rate:
 *
 * 2. TTL設定
 *    - 必ずTTLを設定（メモリリーク防止）
 *    - データの鮮度に合わせて調整
 *
 * 3. シリアライゼーション
 *    - JSON.stringify/parseが一般的
 *    - 大きいデータは圧縮も検討
 *
 * 4. 接続プール
 *    - 本番ではコネクションプールを使用
 *    - エラー時の再接続ロジック
 */
