/**
 * インメモリキャッシュ
 *
 * Node.jsプロセス内にデータを保持する最もシンプルな方法。
 * 高速だが、サーバー再起動で消える。
 */

// === シンプルなキャッシュ実装 ===
class SimpleCache {
  constructor(defaultTtl = 60000) { // デフォルト60秒
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  // 値を設定
  set(key, value, ttl = this.defaultTtl) {
    const expireAt = Date.now() + ttl;
    this.cache.set(key, { value, expireAt });
  }

  // 値を取得
  get(key) {
    const item = this.cache.get(key);

    if (!item) return undefined;

    // 期限切れチェック
    if (Date.now() > item.expireAt) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  // 削除
  delete(key) {
    return this.cache.delete(key);
  }

  // 存在チェック
  has(key) {
    return this.get(key) !== undefined;
  }

  // 全クリア
  clear() {
    this.cache.clear();
  }

  // 期限切れエントリのクリーンアップ
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expireAt) {
        this.cache.delete(key);
      }
    }
  }
}

// === LRUキャッシュ（最大サイズ制限付き）===
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  set(key, value) {
    // 既存なら削除（順序更新のため）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 最大サイズ超過なら古いものを削除
    else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    // アクセスしたら最新に移動
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// === キャッシュデコレータ（memoization）===
function memoize(fn, options = {}) {
  const cache = new SimpleCache(options.ttl || 60000);
  const keyGenerator = options.keyGenerator || ((...args) => JSON.stringify(args));

  return async function (...args) {
    const key = keyGenerator(...args);

    // キャッシュにあれば返す
    const cached = cache.get(key);
    if (cached !== undefined) {
      console.log(`Cache HIT: ${key}`);
      return cached;
    }

    console.log(`Cache MISS: ${key}`);

    // なければ実行してキャッシュ
    const result = await fn.apply(this, args);
    cache.set(key, result);

    return result;
  };
}

// === Express ミドルウェア ===
function cacheMiddleware(options = {}) {
  const cache = new SimpleCache(options.ttl || 60000);

  return (req, res, next) => {
    // GETリクエストのみキャッシュ
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached) {
      console.log(`Cache HIT: ${key}`);
      return res.json(cached);
    }

    // res.jsonをラップしてキャッシュに保存
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, data);
      console.log(`Cache SET: ${key}`);
      return originalJson(data);
    };

    next();
  };
}

// === 使用例 ===
import express from 'express';

const app = express();
const cache = new SimpleCache();

// 重い計算のシミュレーション
async function heavyComputation(id) {
  console.log(`Computing for ${id}...`);
  await new Promise(r => setTimeout(r, 2000)); // 2秒かかる処理
  return { id, result: Math.random(), computedAt: new Date().toISOString() };
}

// memoizeでキャッシュ
const cachedComputation = memoize(heavyComputation, { ttl: 30000 });

// 手動キャッシュ
app.get('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `data:${id}`;

  // キャッシュチェック
  let data = cache.get(cacheKey);

  if (!data) {
    // キャッシュミス：データ取得
    data = await heavyComputation(id);
    cache.set(cacheKey, data, 30000); // 30秒キャッシュ
  }

  res.json(data);
});

// ミドルウェアでキャッシュ
app.get('/api/cached/*', cacheMiddleware({ ttl: 60000 }), (req, res) => {
  res.json({
    path: req.path,
    data: 'This response is cached',
    timestamp: new Date().toISOString(),
  });
});

// memoizeでキャッシュ
app.get('/api/compute/:id', async (req, res) => {
  const result = await cachedComputation(req.params.id);
  res.json(result);
});

// キャッシュ無効化
app.delete('/api/cache/:key', (req, res) => {
  const { key } = req.params;
  cache.delete(key);
  res.json({ message: `Cache cleared for ${key}` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 定期的にクリーンアップ
setInterval(() => cache.cleanup(), 60000);

export { SimpleCache, LRUCache, memoize, cacheMiddleware };

/*
 * インメモリキャッシュの注意点:
 *
 * 1. メモリ制限
 *    - Node.jsのヒープサイズに注意
 *    - LRUで最大サイズを制限
 *
 * 2. サーバー再起動で消える
 *    - 永続化が必要ならRedis等を使用
 *
 * 3. 複数プロセス/サーバーで共有できない
 *    - PM2クラスターモードでは要注意
 *    - 分散環境ではRedis推奨
 *
 * 4. キャッシュ無効化
 *    - データ更新時に適切に無効化
 *    - Stale-While-Revalidateパターンも検討
 */
