/**
 * ミニアプリ用 バックエンドAPI
 *
 * シンプルなTodo APIサーバー
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ========================================
// データ（実際はDBを使う）
// ========================================

let todos = [
  { id: 1, title: '買い物に行く', completed: false, createdAt: new Date() },
  { id: 2, title: 'レポートを書く', completed: true, createdAt: new Date() },
  { id: 3, title: '運動する', completed: false, createdAt: new Date() },
];

let nextId = 4;

// ========================================
// APIエンドポイント
// ========================================

// Todo一覧
app.get('/api/todos', (req, res) => {
  // フィルタリング
  const { completed } = req.query;
  let result = todos;

  if (completed === 'true') {
    result = todos.filter(t => t.completed);
  } else if (completed === 'false') {
    result = todos.filter(t => !t.completed);
  }

  // 少し遅延を入れてローディング状態を確認しやすくする
  setTimeout(() => {
    res.json(result);
  }, 300);
});

// Todo取得
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// Todo作成
app.post('/api/todos', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
  };

  todos.push(newTodo);

  setTimeout(() => {
    res.status(201).json(newTodo);
  }, 300);
});

// Todo更新
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, completed } = req.body;

  todos[todoIndex] = {
    ...todos[todoIndex],
    ...(title !== undefined && { title }),
    ...(completed !== undefined && { completed }),
  };

  setTimeout(() => {
    res.json(todos[todoIndex]);
  }, 300);
});

// Todo削除
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);

  setTimeout(() => {
    res.status(204).send();
  }, 300);
});

// ========================================
// サーバー起動
// ========================================

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
