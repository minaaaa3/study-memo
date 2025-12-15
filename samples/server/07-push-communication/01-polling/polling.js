/**
 * ポーリング（Polling）
 *
 * クライアントが定期的にサーバーに問い合わせる従来の方式。
 * シンプルだが、リアルタイム性が低く、サーバー負荷が高い。
 */

import express from 'express';

const app = express();
app.use(express.json());

// データストア（実際はDBを使用）
const notifications = [];
let notificationId = 0;

// === サーバー側 ===

// 通知一覧取得（ポーリング対象）
app.get('/api/notifications', (req, res) => {
  const { since } = req.query; // 最後に取得した時刻

  let result = notifications;

  if (since) {
    const sinceDate = new Date(since);
    result = notifications.filter(n => new Date(n.createdAt) > sinceDate);
  }

  res.json({
    notifications: result,
    timestamp: new Date().toISOString(),
  });
});

// 通知作成（テスト用）
app.post('/api/notifications', (req, res) => {
  const notification = {
    id: ++notificationId,
    message: req.body.message || 'New notification',
    createdAt: new Date().toISOString(),
  };

  notifications.push(notification);

  // 古い通知を削除（メモリ節約）
  if (notifications.length > 100) {
    notifications.shift();
  }

  res.status(201).json(notification);
});

// === クライアント側（Node.jsでの例）===

async function pollNotifications() {
  let lastTimestamp = null;
  const POLL_INTERVAL = 3000; // 3秒間隔

  console.log('ポーリング開始...');

  while (true) {
    try {
      const url = lastTimestamp
        ? `http://localhost:3000/api/notifications?since=${encodeURIComponent(lastTimestamp)}`
        : 'http://localhost:3000/api/notifications';

      const response = await fetch(url);
      const data = await response.json();

      if (data.notifications.length > 0) {
        console.log('新しい通知:', data.notifications);
      }

      lastTimestamp = data.timestamp;
    } catch (error) {
      console.error('ポーリングエラー:', error.message);
    }

    // 次のポーリングまで待機
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

// === ブラウザ用クライアントコード ===
const browserClientCode = `
// ブラウザでのポーリング実装

class NotificationPoller {
  constructor(url, interval = 3000) {
    this.url = url;
    this.interval = interval;
    this.lastTimestamp = null;
    this.isRunning = false;
    this.callbacks = [];
  }

  onNotification(callback) {
    this.callbacks.push(callback);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.poll();
  }

  stop() {
    this.isRunning = false;
  }

  async poll() {
    if (!this.isRunning) return;

    try {
      const url = this.lastTimestamp
        ? \`\${this.url}?since=\${encodeURIComponent(this.lastTimestamp)}\`
        : this.url;

      const response = await fetch(url);
      const data = await response.json();

      if (data.notifications.length > 0) {
        this.callbacks.forEach(cb => cb(data.notifications));
      }

      this.lastTimestamp = data.timestamp;
    } catch (error) {
      console.error('Polling error:', error);
    }

    // 次のポーリング
    setTimeout(() => this.poll(), this.interval);
  }
}

// 使用例
const poller = new NotificationPoller('/api/notifications', 3000);

poller.onNotification((notifications) => {
  notifications.forEach(n => {
    console.log('新着:', n.message);
    // UIを更新
  });
});

poller.start();
`;

// === サーバー起動 ===
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('\nポーリングテスト:');
  console.log('1. 別ターミナルで: curl -X POST http://localhost:3000/api/notifications -H "Content-Type: application/json" -d \'{"message":"Hello"}\'');
  console.log('2. ブラウザで: http://localhost:3000/api/notifications');
});

/*
 * ポーリングの問題点:
 *
 * 1. 無駄なリクエスト
 *    - 変更がなくても定期的にリクエスト
 *    - サーバーリソースの浪費
 *
 * 2. 遅延
 *    - 最悪ケースでポーリング間隔分の遅延
 *    - 間隔を短くすると負荷増大
 *
 * 3. スケーラビリティ
 *    - クライアント数 × リクエスト頻度 = 負荷
 *    - 同時接続数に比例して負荷増大
 *
 * → SSEやWebSocketで解決
 */

export { app };
