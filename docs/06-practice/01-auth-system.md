# 6-1. 認証システムを作る

## 目標

「自前で実装」と「ライブラリ使用」の両方を体験し、ライブラリが何を解決しているか理解する。

---

## 自前実装：セッションベース認証

### ディレクトリ構成

```
auth-demo/
├── src/
│   ├── index.js          # エントリーポイント
│   ├── routes/
│   │   └── auth.js       # 認証ルート
│   ├── middleware/
│   │   └── auth.js       # 認証ミドルウェア
│   └── db.js             # 簡易DB（実際はDBを使う）
├── package.json
└── .env
```

### 実装

```javascript
// src/db.js
// 簡易的なインメモリDB（実際はPostgreSQLなどを使う）
const bcrypt = require('bcrypt');

const users = [];
const sessions = new Map();

module.exports = {
  async createUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, email, password: hashedPassword };
    users.push(user);
    return { id: user.id, email: user.email };
  },

  findUserByEmail(email) {
    return users.find(u => u.email === email);
  },

  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  createSession(userId) {
    const sessionId = require('crypto').randomBytes(32).toString('hex');
    sessions.set(sessionId, { userId, createdAt: Date.now() });
    return sessionId;
  },

  getSession(sessionId) {
    return sessions.get(sessionId);
  },

  deleteSession(sessionId) {
    sessions.delete(sessionId);
  }
};
```

```javascript
// src/middleware/auth.js
const db = require('../db');

module.exports = function authenticate(req, res, next) {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    return res.status(401).json({ error: 'ログインが必要です' });
  }

  const session = db.getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'セッションが無効です' });
  }

  req.userId = session.userId;
  next();
};
```

```javascript
// src/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 登録
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({ error: 'メールとパスワードは必須です' });
    }

    if (db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'このメールは既に登録されています' });
    }

    const user = await db.createUser(email, password);
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'メールまたはパスワードが違います' });
    }

    const isValid = await db.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'メールまたはパスワードが違います' });
    }

    const sessionId = db.createSession(user.id);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24時間
    });

    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// ログアウト
router.post('/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    db.deleteSession(sessionId);
  }
  res.clearCookie('sessionId');
  res.json({ success: true });
});

module.exports = router;
```

```javascript
// src/index.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

// 認証ルート
app.use('/auth', authRoutes);

// 保護されたルート
app.get('/me', authenticate, (req, res) => {
  res.json({ userId: req.userId });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### 自前実装で考慮すべきこと

```
実装したこと:
✓ パスワードのハッシュ化
✓ セッション管理
✓ Cookie設定（httpOnly, secure, sameSite）

まだ足りないこと:
□ セッションの有効期限切れ処理
□ CSRFトークン
□ レート制限（ブルートフォース対策）
□ パスワードリセット
□ メール確認
□ OAuth（Google, GitHubログイン）
□ 2要素認証
```

---

## NextAuth.js を使う場合

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // メール/パスワード認証
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      }
    }),

    // Googleログイン
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

```jsx
// コンポーネントでの使用
'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>ようこそ、{session.user.name}さん</p>
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => signIn('google')}>Googleでログイン</button>
      <button onClick={() => signIn('credentials')}>メールでログイン</button>
    </div>
  );
}
```

---

## 比較

| 観点 | 自前実装 | NextAuth.js |
|------|---------|-------------|
| 学習 | 仕組みを深く理解 | ブラックボックス |
| 開発速度 | 遅い | 速い |
| セキュリティ | 自己責任 | ベストプラクティス |
| カスタマイズ | 自由 | 制約あり |
| OAuth | 自前で実装 | 設定だけ |
| メンテナンス | 自分で対応 | ライブラリ更新で対応 |

### 選び方

```
「仕組みを理解したい」「独自の要件がある」
  → 自前実装（学習目的なら特に）

「早く作りたい」「標準的な認証でいい」
  → NextAuth.js

「本番プロダクト」
  → NextAuth.jsなどの実績あるライブラリ推奨
```

---

## 演習

1. 自前実装を動かしてみる
2. NextAuth.jsでGoogleログインを実装してみる
3. 両方のCookieの中身を比較してみる

