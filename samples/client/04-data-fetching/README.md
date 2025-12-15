# 4-7. データフェッチング サンプル

TanStack Query（React Query）を使ったデータ取得の実装例です。

## ファイル構成

```
04-data-fetching/
├── 01-basic-fetch.jsx      # 素のfetchでの実装（問題点を理解）
├── 02-tanstack-query.jsx   # TanStack Queryの基本
├── 03-mutation.jsx         # データ更新（useMutation）
├── 04-cache-control.jsx    # キャッシュの制御
├── 05-custom-hooks.jsx     # カスタムフック化
└── README.md
```

## 学習の流れ

1. `01-basic-fetch.jsx` - useEffect + fetchの問題点を体験
2. `02-tanstack-query.jsx` - useQueryで同じことをシンプルに
3. `03-mutation.jsx` - データの作成・更新・削除
4. `04-cache-control.jsx` - staleTime、キャッシュの無効化
5. `05-custom-hooks.jsx` - 実際のプロジェクトでの使い方

## セットアップ

```bash
npm install @tanstack/react-query
```

## 対応カリキュラム

- [4-7. データフェッチング](../../../docs/04-client-tech/07-data-fetching.md)
