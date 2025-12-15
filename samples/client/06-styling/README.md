# 4-4. スタイリング サンプル

同じボタンコンポーネントを4つの方法で実装し、比較します。

## ファイル構成

```
06-styling/
├── 01-vanilla-css/         # 素のCSS
│   ├── Button.jsx
│   └── button.css
├── 02-css-modules/         # CSSモジュール
│   ├── Button.jsx
│   └── Button.module.css
├── 03-styled-components/   # CSS-in-JS
│   └── Button.jsx
├── 04-tailwind/            # Tailwind CSS
│   └── Button.jsx
└── README.md
```

## 学習の流れ

1. `01-vanilla-css` - グローバルCSSの問題点
2. `02-css-modules` - スコープ付きCSSで衝突回避
3. `03-styled-components` - JS内でスタイル定義
4. `04-tailwind` - ユーティリティクラスで高速開発

## セットアップ

```bash
# styled-components
npm install styled-components

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 対応カリキュラム

- [4-4. スタイリング](../../../docs/04-client-tech/04-styling.md)
