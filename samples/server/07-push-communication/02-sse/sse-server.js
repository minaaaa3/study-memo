/**
 * Server-Sent Events (SSE)
 *
 * サーバーからクライアントへの一方向通信。
 * HTTP上で動作し、自動再接続機能付き。
 */

import express from 'express';

const app = express();
app.use(express.json());

// 接続中のクライアント管理
const clients = new Set();

// === SSEエンドポイント ===
app.get('/api/events', (req, res) => {
  // SSE用のヘッダー設定
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // CORSが必要な場合
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 接続確立メッセージ
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ message: 'Connected to SSE' })}\n\n`);

  // クライアントを登録
  const client = { res };
  clients.add(client);
  console.log(`Client connected. Total: ${clients.size}`);

  // 接続切断時のクリーンアップ
  req.on('close', () => {
    clients.delete(client);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });
});

// === イベント送信関数 ===
function sendEvent(eventType, data) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

  clients.forEach(client => {
    client.res.write(message);
  });
}

// === APIエンドポイント（イベントをトリガー）===

// 通知送信
app.post('/api/notify', (req, res) => {
  const { message, type = 'info' } = req.body;

  sendEvent('notification', {
    id: Date.now(),
    message,
    type,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, clients: clients.size });
});

// 進捗更新
app.post('/api/progress', (req, res) => {
  const { taskId, progress, status } = req.body;

  sendEvent('progress', {
    taskId,
    progress,
    status,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true });
});

// === 定期的なハートビート（接続維持）===
setInterval(() => {
  sendEvent('heartbeat', { timestamp: new Date().toISOString() });
}, 30000); // 30秒ごと

// === サンプルHTML ===
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>SSE Demo</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #events { border: 1px solid #ccc; padding: 10px; height: 300px; overflow-y: auto; }
    .event { padding: 5px; margin: 5px 0; border-radius: 4px; }
    .notification { background: #e3f2fd; }
    .progress { background: #fff3e0; }
    .heartbeat { background: #f5f5f5; color: #999; }
    .connected { background: #e8f5e9; }
  </style>
</head>
<body>
  <h1>Server-Sent Events Demo</h1>
  <div>Status: <span id="status">Connecting...</span></div>
  <div id="events"></div>

  <h3>Send Test Event</h3>
  <input type="text" id="message" placeholder="Message" value="Hello SSE!">
  <button onclick="sendNotification()">Send Notification</button>

  <script>
    const eventsDiv = document.getElementById('events');
    const statusSpan = document.getElementById('status');

    // SSE接続
    const eventSource = new EventSource('/api/events');

    // 接続成功
    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      statusSpan.textContent = 'Connected';
      statusSpan.style.color = 'green';
      addEvent('connected', data);
    });

    // 通知イベント
    eventSource.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data);
      addEvent('notification', data);
    });

    // 進捗イベント
    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      addEvent('progress', data);
    });

    // ハートビート
    eventSource.addEventListener('heartbeat', (e) => {
      const data = JSON.parse(e.data);
      addEvent('heartbeat', { message: 'heartbeat' });
    });

    // エラー処理
    eventSource.onerror = () => {
      statusSpan.textContent = 'Disconnected (reconnecting...)';
      statusSpan.style.color = 'red';
    };

    function addEvent(type, data) {
      const div = document.createElement('div');
      div.className = 'event ' + type;
      div.textContent = type + ': ' + JSON.stringify(data);
      eventsDiv.appendChild(div);
      eventsDiv.scrollTop = eventsDiv.scrollHeight;
    }

    async function sendNotification() {
      const message = document.getElementById('message').value;
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    }
  </script>
</body>
</html>
  `);
});

// === サーバー起動 ===
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`SSE Server running on http://localhost:${PORT}`);
  console.log('ブラウザで http://localhost:3000 を開いてください');
});

/*
 * SSEの特徴:
 *
 * ✅ 利点:
 * - HTTP上で動作（プロキシ、ファイアウォール通過しやすい）
 * - 自動再接続機能
 * - イベントID/リトライ間隔のサポート
 * - テキストベースでデバッグしやすい
 *
 * ⚠️ 制限:
 * - サーバー→クライアントの一方向のみ
 * - バイナリデータ非対応（Base64エンコード必要）
 * - HTTP/1.1では同時接続数制限（6接続/ドメイン）
 *
 * SSEメッセージフォーマット:
 * event: eventName\n
 * data: JSON string\n
 * id: optional-id\n
 * retry: 3000\n
 * \n
 */

export { app, sendEvent };
