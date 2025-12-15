# 6-3. APIクライアントを作る サンプル

同じAPI呼び出しを3つの方法で実装し、比較します。

## ファイル構成

```
02-api-client-comparison/
├── 01-vanilla-fetch.js    # 素のfetch（自前実装）
├── 02-axios.js            # Axios
├── 03-tanstack-query.jsx  # TanStack Query
└── README.md
```

## 学習の流れ

1. `01-vanilla-fetch.js` - fetchの基本と問題点
2. `02-axios.js` - Axiosで共通処理をまとめる
3. `03-tanstack-query.jsx` - TanStack Queryでキャッシュも管理

## セットアップ

```bash
npm install axios @tanstack/react-query
```

## 対応カリキュラム

- [6-3. APIクライアントを作る](../../../docs/06-practice/03-api-client.md)
