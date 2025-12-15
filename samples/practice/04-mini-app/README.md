# 6-5. ミニアプリを作る サンプル

学んだことを統合したTodoアプリの実装例です。

## ファイル構成

```
04-mini-app/
├── backend/
│   └── server.js          # Express APIサーバー
├── frontend/
│   ├── App.jsx            # メインアプリ
│   ├── hooks/
│   │   └── useTodos.js    # TanStack Query カスタムフック
│   ├── components/
│   │   ├── TodoList.jsx   # Todo一覧
│   │   ├── TodoForm.jsx   # 追加フォーム（React Hook Form + Zod）
│   │   └── TodoItem.jsx   # 個別のTodo
│   └── store/
│       └── authStore.js   # 認証状態（Zustand）
└── README.md
```

## 使用技術

| 機能 | 技術 |
|------|------|
| 状態管理 | Zustand |
| フォーム | React Hook Form + Zod |
| データ取得 | TanStack Query |
| ルーティング | React Router |
| スタイリング | Tailwind CSS |
| バックエンド | Express |

## 学習のポイント

1. 複数の技術を組み合わせる
2. 責務の分離（hooks, components, store）
3. 実際のCRUD操作

## 対応カリキュラム

- [6-5. ミニアプリを作る](../../../docs/06-practice/05-mini-app.md)
