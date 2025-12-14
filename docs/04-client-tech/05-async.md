# 4-5. 非同期処理

## 例え話：レストランの注文

レストランで料理を注文する場面を考えてください。

- **同期**: 料理ができるまでレジの前で待ち続ける（他のことができない）
- **非同期**: 番号札をもらって席に戻る。できたら呼ばれる（待ってる間も別のことができる）

JavaScriptは「シングルスレッド」なので、重い処理で止まらないよう非同期処理が重要です。

---

## 核心：なぜ非同期が必要か

### 同期処理の問題

```javascript
// もし fetch が同期だったら...
const response = fetch('/api/users');  // 3秒かかる
const data = response.json();
console.log(data);

// この3秒間、画面が完全にフリーズする
// - スクロールできない
// - ボタンが押せない
// - 入力できない
```

### 非同期で解決

```javascript
// 非同期なら...
fetch('/api/users')  // リクエストを送信
  .then(response => response.json())
  .then(data => {
    console.log(data);  // データが来たら処理
  });

console.log('リクエスト送信済み');
// ↑ これは fetch を待たずに即座に実行される
// 画面はフリーズしない
```

---

## コールバック → Promise → async/await

### 1. コールバック（昔の書き方）

```javascript
function fetchUser(id, callback) {
  setTimeout(() => {
    callback({ id, name: '田中' });
  }, 1000);
}

fetchUser(1, (user) => {
  console.log(user);
});

// 問題: コールバック地獄
fetchUser(1, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      // 深くなりすぎて読めない...
    });
  });
});
```

### 2. Promise（ES6）

```javascript
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id, name: '田中' });
    }, 1000);
  });
}

fetchUser(1)
  .then(user => {
    console.log(user);
    return fetchPosts(user.id);
  })
  .then(posts => {
    console.log(posts);
    return fetchComments(posts[0].id);
  })
  .then(comments => {
    console.log(comments);
  })
  .catch(error => {
    console.error('エラー:', error);
  });

// チェーンできるので読みやすい
```

### 3. async/await（ES2017）

```javascript
async function loadData() {
  try {
    const user = await fetchUser(1);
    console.log(user);

    const posts = await fetchPosts(user.id);
    console.log(posts);

    const comments = await fetchComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    console.error('エラー:', error);
  }
}

loadData();

// 同期処理のように読める！
```

---

## fetch API

### 基本的な使い方

```javascript
// GET
async function getUsers() {
  const response = await fetch('/api/users');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// POST
async function createUser(user) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

### よくある落とし穴

```javascript
// fetchは404や500でもrejectしない！
fetch('/api/notfound')
  .then(response => {
    console.log(response.ok);     // false
    console.log(response.status); // 404
    // ここに来る（catchには行かない）
  })
  .catch(error => {
    // ネットワークエラーの場合だけここに来る
  });

// なので必ず ok をチェックする
const response = await fetch('/api/users');
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
```

---

## Reactでの非同期処理

### useEffectでデータ取得

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // useEffect内で直接asyncは使えないので、関数を定義して呼ぶ
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);  // 空の依存配列 = マウント時に1回だけ実行

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### TanStack Queryを使う（推奨）

```jsx
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// メリット:
// - キャッシュ管理
// - バックグラウンド更新
// - エラーリトライ
// - ローディング状態の自動管理
```

---

## 並列と直列

### 直列（順番に実行）

```javascript
// 1つずつ順番に実行（遅い）
const user = await fetchUser(1);      // 1秒
const posts = await fetchPosts(1);    // 1秒
const comments = await fetchComments(1); // 1秒
// 合計: 3秒
```

### 並列（同時に実行）

```javascript
// 同時に実行（速い）
const [user, posts, comments] = await Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchComments(1),
]);
// 合計: 1秒（最も遅いものの時間）
```

### 依存関係がある場合

```javascript
// userを取得してから、そのuser.idを使ってpostsを取得
const user = await fetchUser(1);
const posts = await fetchPosts(user.id);  // userに依存

// postsとcommentsは並列で取得可能
const [posts, comments] = await Promise.all([
  fetchPosts(user.id),
  fetchComments(user.id),
]);
```

---

## エラーハンドリング

### try/catch

```javascript
async function fetchData() {
  try {
    const data = await fetch('/api/data').then(r => r.json());
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;  // 再スローして呼び出し元に伝える
  }
}
```

### Promise.allSettled

```javascript
// 1つ失敗しても他は続行したい場合
const results = await Promise.allSettled([
  fetchUser(1),
  fetchPosts(1),
  fetchComments(1),
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('成功:', result.value);
  } else {
    console.log('失敗:', result.reason);
  }
});

// Promise.all だと1つ失敗で全部止まる
```

---

## AbortController

リクエストのキャンセル。

```javascript
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('リクエストがキャンセルされました');
    }
  });

// 途中でキャンセル
controller.abort();
```

### Reactでの使用例

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch('/api/users', {
        signal: controller.signal,
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message);
      }
    }
  }

  fetchData();

  // クリーンアップ: コンポーネントがアンマウントされたらキャンセル
  return () => controller.abort();
}, []);
```

---

## よくある誤解

### 「awaitを付ければ同期になる」？

そうではありません。awaitは「その行の完了を待つ」だけで、
他の処理（UIの更新など）はブロックしません。

```javascript
async function fetchData() {
  console.log('1. 開始');
  const data = await fetch('/api/data');  // ここで待つ
  console.log('2. 完了');
}

fetchData();
console.log('3. 関数呼び出し後');

// 出力順序:
// 1. 開始
// 3. 関数呼び出し後  ← awaitで止まらない
// 2. 完了
```

### 「useEffect内でasyncを直接使える」？

```jsx
// ダメな例
useEffect(async () => {
  const data = await fetchData();
}, []);

// 良い例
useEffect(() => {
  async function fetchData() {
    // ...
  }
  fetchData();
}, []);
```

useEffectのコールバックはクリーンアップ関数を返すことがあるため、Promiseを返すasync関数は使えません。

---

## まとめ

- **非同期処理** = 処理の完了を待たずに次へ進む
- **Promise** = 非同期処理を扱うオブジェクト
- **async/await** = Promiseを同期的に書ける構文
- **fetch** = HTTPリクエストを送るAPI
- **Promise.all** = 並列実行
- **TanStack Query** = データフェッチングの状態管理

