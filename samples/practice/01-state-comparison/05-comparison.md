# 状態管理方法の比較

## 比較表

| 項目 | useState | useReducer | Context | Zustand |
|------|----------|------------|---------|---------|
| 学習コスト | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| ボイラープレート | 少ない | 多い | 多い | 少ない |
| スコープ | ローカル | ローカル | グローバル | グローバル |
| 追加ライブラリ | 不要 | 不要 | 不要 | 必要 |
| DevTools | なし | なし | なし | あり |
| パフォーマンス | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 選び方ガイド

### useState を使う場合

- コンポーネント内のローカルな状態
- シンプルな状態（boolean, number, string）
- 他のコンポーネントと共有しない

```jsx
const [isOpen, setIsOpen] = useState(false);
const [name, setName] = useState('');
```

### useReducer を使う場合

- 複雑な状態遷移がある
- 状態の更新ロジックをまとめたい
- テストしやすくしたい

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'ADD_TODO', payload: 'New Todo' });
```

### Context を使う場合

- 複数のコンポーネントで状態を共有
- Props drilling を避けたい
- 追加ライブラリを使いたくない

```jsx
const value = useContext(ThemeContext);
```

### Zustand を使う場合

- グローバル状態を簡単に管理したい
- ボイラープレートを減らしたい
- DevTools でデバッグしたい
- コンポーネント外からアクセスしたい

```jsx
const count = useStore(state => state.count);
```

## コード量の比較（同じカウンター機能）

### useState: 約10行

```jsx
const [count, setCount] = useState(0);
```

### useReducer: 約25行

```jsx
const reducer = (state, action) => { ... };
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

### Context: 約40行

```jsx
const CountContext = createContext();
function CountProvider({ children }) { ... }
function useCount() { ... }
```

### Zustand: 約10行

```jsx
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

## 結論

1. **まずは useState** から始める
2. **状態が複雑になったら useReducer** を検討
3. **共有が必要になったら Context または Zustand** を検討
4. **大規模なアプリでは Zustand** が便利
