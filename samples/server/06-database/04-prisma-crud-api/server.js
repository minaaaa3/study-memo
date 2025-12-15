/**
 * Express + Prisma CRUD API
 *
 * 実際のAPIサーバーでPrismaを使う完成版
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// === エラーハンドリングヘルパー ===
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// === ユーザー API ===

// GET /api/users - 全ユーザー取得
app.get('/api/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const where = search ? {
    OR: [
      { name: { contains: search } },
      { email: { contains: search } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { posts: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// GET /api/users/:id - ユーザー詳細
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      profile: true,
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
}));

// POST /api/users - ユーザー作成
app.post('/api/users', asyncHandler(async (req, res) => {
  const { email, name, profile } = req.body;

  // バリデーション
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  // 重複チェック
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      profile: profile ? { create: profile } : undefined,
    },
    include: { profile: true },
  });

  res.status(201).json(user);
}));

// PATCH /api/users/:id - ユーザー更新
app.patch('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, profile } = req.body;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      name,
      profile: profile ? {
        upsert: {
          create: profile,
          update: profile,
        },
      } : undefined,
    },
    include: { profile: true },
  });

  res.json(user);
}));

// DELETE /api/users/:id - ユーザー削除
app.delete('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id: Number(id) },
  });

  res.status(204).end();
}));

// === 投稿 API ===

// GET /api/posts - 投稿一覧
app.get('/api/posts', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, published, authorId } = req.query;

  const where = {};
  if (published !== undefined) {
    where.published = published === 'true';
  }
  if (authorId) {
    where.authorId = Number(authorId);
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  res.json({
    posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

// GET /api/posts/:id - 投稿詳細
app.get('/api/posts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json(post);
}));

// POST /api/posts - 投稿作成
app.post('/api/posts', asyncHandler(async (req, res) => {
  const { title, content, authorId, tags = [] } = req.body;

  if (!title || !authorId) {
    return res.status(400).json({ error: 'Title and authorId are required' });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { id: authorId } },
      tags: {
        create: tags.map(name => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });

  res.status(201).json(post);
}));

// PATCH /api/posts/:id - 投稿更新
app.patch('/api/posts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { title, content, published },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  res.json(post);
}));

// DELETE /api/posts/:id - 投稿削除
app.delete('/api/posts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.post.delete({
    where: { id: Number(id) },
  });

  res.status(204).end();
}));

// === コメント API ===

// POST /api/posts/:postId/comments
app.post('/api/posts/:postId/comments', asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, authorId } = req.body;

  if (!content || !authorId) {
    return res.status(400).json({ error: 'Content and authorId are required' });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      post: { connect: { id: Number(postId) } },
      author: { connect: { id: authorId } },
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(comment);
}));

// === エラーハンドリング ===
app.use((err, req, res, next) => {
  console.error(err);

  // Prismaのエラー
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// === サーバー起動 ===
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 終了時にPrisma接続を閉じる
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };
