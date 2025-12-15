# 4-3. ルーティング サンプル

React Router v6 を使った SPA ルーティングの実装例です。

## ファイル構成

```
05-routing/
├── 01-basic-routing.jsx    # 基本的なルーティング
├── 02-nested-routes.jsx    # ネストされたルート
├── 03-dynamic-routes.jsx   # 動的ルーティング（パラメータ）
├── 04-protected-routes.jsx # 認証が必要なルート
├── 05-navigation.jsx       # ナビゲーション（Link, useNavigate）
└── README.md
```

## 学習の流れ

1. `01-basic-routing.jsx` - ページ遷移の基本
2. `02-nested-routes.jsx` - レイアウトの共有
3. `03-dynamic-routes.jsx` - `/users/:id` のようなパラメータ
4. `04-protected-routes.jsx` - ログインが必要なページ
5. `05-navigation.jsx` - プログラム的な遷移

## セットアップ

```bash
npm install react-router-dom
```

## 対応カリキュラム

- [4-3. ルーティング](../../../docs/04-client-tech/03-routing.md)
