/**
 * HTTPキャッシュヘッダー
 *
 * ブラウザやCDNにキャッシュを制御させる。
 * サーバーへのリクエスト自体を削減できる。
 */

import express from 'express';
import crypto from 'crypto';

const app = express();

// === Cache-Control ヘッダー ===

// 静的ファイル（長期キャッシュ）
app.get('/static/*', (req, res, next) => {
  // 1年間キャッシュ、変更不可
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

// APIレスポンス（短期キャッシュ）
app.get('/api/public-data', (req, res) => {
  // 60秒間キャッシュ、CDNにも保存
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

  res.json({
    data: 'Public data',
    timestamp: new Date().toISOString(),
  });
});

// プライベートデータ（キャッシュ不可）
app.get('/api/user', (req, res) => {
  // ブラウザのみキャッシュ可、CDNは不可
  res.setHeader('Cache-Control', 'private, max-age=0');

  res.json({
    user: { id: 1, name: 'User' },
  });
});

// キャッシュ完全禁止
app.get('/api/sensitive', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  res.json({
    token: 'sensitive-data',
  });
});

// Stale-While-Revalidate
app.get('/api/news', (req, res) => {
  // 60秒間は新鮮、その後3600秒間は古いデータを返しつつ裏で再検証
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');

  res.json({
    news: [{ title: 'Latest news' }],
  });
});

// === ETag（条件付きリクエスト）===

// ETag生成ヘルパー
function generateETag(content) {
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
}

// ETagを使ったキャッシュ
app.get('/api/data/:id', (req, res) => {
  // データ取得（実際はDBから）
  const data = {
    id: req.params.id,
    content: 'Some content',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const etag = generateETag(data);

  // クライアントのETagと比較
  if (req.headers['if-none-match'] === etag) {
    // 変更なし
    return res.status(304).end();
  }

  // ETagをレスポンスに含める
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

  res.json(data);
});

// === Last-Modified ===
app.get('/api/articles/:id', (req, res) => {
  // 記事取得（実際はDBから）
  const article = {
    id: req.params.id,
    title: 'Article Title',
    content: 'Content...',
    updatedAt: new Date('2024-06-01T10:00:00Z'),
  };

  const lastModified = article.updatedAt.toUTCString();

  // クライアントの日時と比較
  if (req.headers['if-modified-since'] === lastModified) {
    return res.status(304).end();
  }

  res.setHeader('Last-Modified', lastModified);
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

  res.json(article);
});

// === Vary（キャッシュキーの指定）===
app.get('/api/content', (req, res) => {
  const acceptLanguage = req.headers['accept-language'] || 'en';
  const lang = acceptLanguage.includes('ja') ? 'ja' : 'en';

  // Accept-Languageによってキャッシュを分ける
  res.setHeader('Vary', 'Accept-Language');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const content = {
    en: { greeting: 'Hello' },
    ja: { greeting: 'こんにちは' },
  };

  res.json(content[lang]);
});

// === キャッシュ制御ミドルウェア ===
function cacheControl(options = {}) {
  const {
    maxAge = 0,
    sMaxAge,
    isPublic = false,
    isPrivate = false,
    noStore = false,
    noCache = false,
    mustRevalidate = false,
    immutable = false,
    staleWhileRevalidate,
  } = options;

  return (req, res, next) => {
    if (noStore) {
      res.setHeader('Cache-Control', 'no-store');
      return next();
    }

    const directives = [];

    if (isPublic) directives.push('public');
    if (isPrivate) directives.push('private');
    if (noCache) directives.push('no-cache');
    if (maxAge >= 0) directives.push(`max-age=${maxAge}`);
    if (sMaxAge !== undefined) directives.push(`s-maxage=${sMaxAge}`);
    if (mustRevalidate) directives.push('must-revalidate');
    if (immutable) directives.push('immutable');
    if (staleWhileRevalidate) {
      directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
    }

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
}

// ミドルウェア使用例
app.get(
  '/api/products',
  cacheControl({
    isPublic: true,
    maxAge: 300,
    sMaxAge: 600,
    staleWhileRevalidate: 3600,
  }),
  (req, res) => {
    res.json({ products: [] });
  }
);

// === CDN向け設定 ===
app.get('/api/cdn-optimized', (req, res) => {
  // CDN用のヘッダー
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=86400');

  // Cloudflare用
  res.setHeader('CDN-Cache-Control', 'max-age=86400');

  // Surrogate-Control（Varnish等）
  res.setHeader('Surrogate-Control', 'max-age=86400');

  res.json({ data: 'CDN optimized' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app, cacheControl, generateETag };

/*
 * Cache-Control ディレクティブ:
 *
 * === 基本 ===
 * - public: CDN等でキャッシュ可
 * - private: ブラウザのみキャッシュ可
 * - no-cache: 毎回サーバーに確認（キャッシュは保持）
 * - no-store: キャッシュ禁止
 *
 * === 時間 ===
 * - max-age: ブラウザでの有効期間（秒）
 * - s-maxage: CDNでの有効期間（秒）
 *
 * === 再検証 ===
 * - must-revalidate: 期限切れ後は必ず再検証
 * - stale-while-revalidate: 古いデータを返しつつ裏で更新
 * - stale-if-error: エラー時は古いデータを返す
 *
 * === その他 ===
 * - immutable: 変更されない（ハッシュ付きファイル用）
 *
 *
 * 条件付きリクエスト:
 *
 * - ETag: コンテンツのハッシュ
 *   → If-None-Match で比較 → 304 Not Modified
 *
 * - Last-Modified: 最終更新日時
 *   → If-Modified-Since で比較 → 304 Not Modified
 */
