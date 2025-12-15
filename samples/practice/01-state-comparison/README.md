# 6-2. 状態管理を実装する サンプル

同じカウンターアプリを4つの方法で実装し、比較します。

## ファイル構成

```
01-state-comparison/
├── 01-useState.jsx        # useStateのみ（ローカル状態）
├── 02-useReducer.jsx      # useReducer（複雑な状態遷移）
├── 03-context.jsx         # React Context（グローバル状態）
├── 04-zustand.jsx         # Zustand（シンプルなグローバル状態）
├── 05-comparison.md       # 比較まとめ
└── README.md
```

## 学習の流れ

1. `01-useState.jsx` - 最もシンプル。ローカル状態の基本
2. `02-useReducer.jsx` - 複雑な状態遷移をアクションで管理
3. `03-context.jsx` - Props drilling を解決
4. `04-zustand.jsx` - ボイラープレートが少ない現代的な方法

## セットアップ

```bash
# Zustand のみ追加インストール
npm install zustand
```

## 対応カリキュラム

- [6-2. 状態管理を実装する](../../../docs/06-practice/02-state-management.md)
- [4-2. 状態管理](../../../docs/04-client-tech/02-state-management.md)
