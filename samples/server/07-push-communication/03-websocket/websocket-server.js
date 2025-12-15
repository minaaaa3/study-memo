/**
 * WebSocket サーバー
 *
 * 双方向のリアルタイム通信。チャットやゲームに最適。
 *
 * npm install ws
 */

import { WebSocketServer } from 'ws';
import http from 'http';

// HTTPサーバー作成（Express等と統合する場合）
const server = http.createServer();

// WebSocketサーバー作成
const wss = new WebSocketServer({ server });

// 接続中のクライアント管理
const clients = new Map(); // ws -> { userId, username, room }

// === 接続処理 ===
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  // クライアント情報を初期化
  clients.set(ws, { userId: null, username: 'Anonymous', room: 'general' });

  // 接続確認メッセージ
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to WebSocket server',
    timestamp: new Date().toISOString(),
  }));

  // === メッセージ受信 ===
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
    }
  });

  // === 切断処理 ===
  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    if (clientInfo?.username) {
      // 退室通知
      broadcastToRoom(clientInfo.room, {
        type: 'user_left',
        username: clientInfo.username,
        timestamp: new Date().toISOString(),
      }, ws);
    }
    clients.delete(ws);
    console.log('WebSocket disconnected');
  });

  // === エラー処理 ===
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// === メッセージハンドラー ===
function handleMessage(ws, message) {
  const clientInfo = clients.get(ws);

  switch (message.type) {
    // ユーザー認証/登録
    case 'join':
      clientInfo.username = message.username;
      clientInfo.room = message.room || 'general';
      clients.set(ws, clientInfo);

      // 入室通知
      broadcastToRoom(clientInfo.room, {
        type: 'user_joined',
        username: clientInfo.username,
        timestamp: new Date().toISOString(),
      }, ws);

      // 参加確認
      ws.send(JSON.stringify({
        type: 'joined',
        room: clientInfo.room,
        users: getRoomUsers(clientInfo.room),
      }));
      break;

    // チャットメッセージ
    case 'chat':
      broadcastToRoom(clientInfo.room, {
        type: 'chat',
        username: clientInfo.username,
        message: message.message,
        timestamp: new Date().toISOString(),
      });
      break;

    // プライベートメッセージ
    case 'private':
      sendToUser(message.to, {
        type: 'private',
        from: clientInfo.username,
        message: message.message,
        timestamp: new Date().toISOString(),
      });
      break;

    // タイピング中表示
    case 'typing':
      broadcastToRoom(clientInfo.room, {
        type: 'typing',
        username: clientInfo.username,
      }, ws);
      break;

    // ルーム変更
    case 'change_room':
      const oldRoom = clientInfo.room;
      clientInfo.room = message.room;
      clients.set(ws, clientInfo);

      // 旧ルームに退室通知
      broadcastToRoom(oldRoom, {
        type: 'user_left',
        username: clientInfo.username,
      }, ws);

      // 新ルームに入室通知
      broadcastToRoom(message.room, {
        type: 'user_joined',
        username: clientInfo.username,
      }, ws);

      ws.send(JSON.stringify({
        type: 'room_changed',
        room: message.room,
        users: getRoomUsers(message.room),
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${message.type}`,
      }));
  }
}

// === ヘルパー関数 ===

// 特定ルームにブロードキャスト
function broadcastToRoom(room, message, excludeWs = null) {
  const messageStr = JSON.stringify(message);

  clients.forEach((info, ws) => {
    if (info.room === room && ws !== excludeWs && ws.readyState === 1) {
      ws.send(messageStr);
    }
  });
}

// 全員にブロードキャスト
function broadcastAll(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);

  clients.forEach((info, ws) => {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(messageStr);
    }
  });
}

// 特定ユーザーに送信
function sendToUser(username, message) {
  clients.forEach((info, ws) => {
    if (info.username === username && ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  });
}

// ルームのユーザー一覧取得
function getRoomUsers(room) {
  const users = [];
  clients.forEach((info) => {
    if (info.room === room) {
      users.push(info.username);
    }
  });
  return users;
}

// === サーバー起動 ===
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log('\nテスト用クライアント:');
  console.log('wscat -c ws://localhost:3000');
  console.log('{"type":"join","username":"Taro","room":"general"}');
  console.log('{"type":"chat","message":"Hello!"}');
});

/*
 * WebSocketプロトコル:
 *
 * 1. ハンドシェイク（HTTP Upgrade）
 *    GET /chat HTTP/1.1
 *    Upgrade: websocket
 *    Connection: Upgrade
 *
 * 2. 双方向通信
 *    - クライアント→サーバー: ws.send()
 *    - サーバー→クライアント: ws.send()
 *
 * 3. フレームタイプ
 *    - テキスト: 文字列データ
 *    - バイナリ: ArrayBuffer/Blob
 *    - Ping/Pong: 接続確認
 *    - Close: 切断
 *
 * 接続状態（ws.readyState）:
 * - 0: CONNECTING
 * - 1: OPEN
 * - 2: CLOSING
 * - 3: CLOSED
 */

export { wss, broadcastToRoom, broadcastAll };
