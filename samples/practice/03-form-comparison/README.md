# 6-4. フォームを作る サンプル

同じ登録フォームを3つの方法で実装し、比較します。

## ファイル構成

```
03-form-comparison/
├── 01-vanilla-state.jsx   # useStateのみ（自前実装）
├── 02-react-hook-form.jsx # React Hook Form
├── 03-with-zod.jsx        # React Hook Form + Zod
└── README.md
```

## 学習の流れ

1. `01-vanilla-state.jsx` - useStateで全部自前実装（大変さを体験）
2. `02-react-hook-form.jsx` - React Hook Formで楽に
3. `03-with-zod.jsx` - Zodでバリデーションスキーマを定義

## セットアップ

```bash
npm install react-hook-form zod @hookform/resolvers
```

## 対応カリキュラム

- [6-4. フォームを作る](../../../docs/06-practice/04-form.md)
- [4-6. フォームとバリデーション](../../../docs/04-client-tech/06-form.md)
