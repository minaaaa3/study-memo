/**
 * WebSocket クライアント（ブラウザ用）
 *
 * 再接続機能付きのWebSocketクライアント実装
 */

// === 基本的な使い方 ===
function basicUsage() {
  // WebSocket接続
  const ws = new WebSocket('ws://localhost:3000');

  // 接続成功
  ws.onopen = () => {
    console.log('Connected');

    // メッセージ送信
    ws.send(JSON.stringify({
      type: 'join',
      username: 'Taro',
      room: 'general',
    }));
  };

  // メッセージ受信
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
  };

  // エラー
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // 切断
  ws.onclose = (event) => {
    console.log('Disconnected:', event.code, event.reason);
  };
}

// === 再接続機能付きクライアント ===
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
    this.ws = null;
    this.isConnecting = false;
    this.shouldReconnect = true;

    // イベントハンドラー
    this.onopen = () => {};
    this.onclose = () => {};
    this.onerror = () => {};
    this.onmessage = () => {};

    this.connect();
  }

  connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    console.log(`Connecting to ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = (event) => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.onopen(event);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
      this.isConnecting = false;
      this.onclose(event);

      // 自動再接続
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error');
      this.onerror(event);
    };

    this.ws.onmessage = (event) => {
      this.onmessage(event);
    };
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  close() {
    this.shouldReconnect = false;
    this.ws?.close();
  }

  get readyState() {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// === チャットクライアント ===
class ChatClient {
  constructor(serverUrl) {
    this.ws = new ReconnectingWebSocket(serverUrl);
    this.username = null;
    this.room = null;
    this.messageHandlers = new Map();

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onopen = () => {
      // 再接続時に自動で再参加
      if (this.username && this.room) {
        this.join(this.username, this.room);
      }
    };
  }

  // メッセージタイプごとのハンドラー登録
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  // メッセージ処理
  handleMessage(message) {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message));

    // 全メッセージ用ハンドラー
    const allHandlers = this.messageHandlers.get('*') || [];
    allHandlers.forEach(handler => handler(message));
  }

  // ルームに参加
  join(username, room = 'general') {
    this.username = username;
    this.room = room;
    this.ws.send({
      type: 'join',
      username,
      room,
    });
  }

  // チャットメッセージ送信
  sendMessage(message) {
    this.ws.send({
      type: 'chat',
      message,
    });
  }

  // プライベートメッセージ
  sendPrivateMessage(to, message) {
    this.ws.send({
      type: 'private',
      to,
      message,
    });
  }

  // タイピング中通知
  sendTyping() {
    this.ws.send({
      type: 'typing',
    });
  }

  // ルーム変更
  changeRoom(room) {
    this.room = room;
    this.ws.send({
      type: 'change_room',
      room,
    });
  }

  // 切断
  disconnect() {
    this.ws.close();
  }
}

// === 使用例 ===
function chatExample() {
  const chat = new ChatClient('ws://localhost:3000');

  // イベントハンドラー設定
  chat.on('connected', (msg) => {
    console.log('サーバーに接続しました');
    chat.join('Taro', 'general');
  });

  chat.on('joined', (msg) => {
    console.log(`${msg.room}に参加しました`);
    console.log('参加者:', msg.users);
  });

  chat.on('user_joined', (msg) => {
    console.log(`${msg.username}が参加しました`);
  });

  chat.on('user_left', (msg) => {
    console.log(`${msg.username}が退出しました`);
  });

  chat.on('chat', (msg) => {
    console.log(`${msg.username}: ${msg.message}`);
  });

  chat.on('typing', (msg) => {
    console.log(`${msg.username}が入力中...`);
  });

  chat.on('private', (msg) => {
    console.log(`[DM from ${msg.from}]: ${msg.message}`);
  });

  // デバッグ用：全メッセージをログ
  chat.on('*', (msg) => {
    console.debug('Raw message:', msg);
  });

  // チャット送信
  // chat.sendMessage('Hello everyone!');

  return chat;
}

export { ReconnectingWebSocket, ChatClient, chatExample };

/*
 * WebSocketのベストプラクティス:
 *
 * 1. 再接続ロジック
 *    - 指数バックオフで再接続
 *    - 最大試行回数を設定
 *
 * 2. ハートビート
 *    - 定期的にping/pongで接続確認
 *    - タイムアウトで切断検知
 *
 * 3. メッセージキュー
 *    - 切断中のメッセージを保持
 *    - 再接続後に送信
 *
 * 4. 認証
 *    - 接続時にトークンを送信
 *    - またはURLパラメータで渡す
 */
