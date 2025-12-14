# 5-5. デバッグ

## 例え話：医者の診断

デバッグは「医者の診断」に似ています。

1. **症状を聞く**: 「どこが痛いですか？」= エラーメッセージを読む
2. **検査する**: 血液検査、レントゲン = ログ、デバッガー
3. **原因を特定**: 「骨が折れています」= バグの箇所を発見
4. **治療する**: 手術、投薬 = コードを修正

いきなり手術（コード修正）せず、まず診断（原因特定）が大事です。

---

## 核心：デバッグの基本ステップ

```
1. 再現する: 問題が起きる手順を確認
2. 絞り込む: どこで問題が起きているか
3. 原因を特定: なぜ問題が起きているか
4. 修正する: 正しい動作に直す
5. 検証する: 本当に直ったか確認
```

---

## エラーメッセージを読む

### エラーの構造

```javascript
TypeError: Cannot read properties of undefined (reading 'name')
    at getUserName (/app/src/utils.js:15:20)
    at handleRequest (/app/src/handler.js:42:10)
    at /app/src/server.js:28:5
```

```
1行目: エラーの種類と内容
  → undefinedの'name'プロパティを読もうとした

2行目以降: スタックトレース（どこで起きたか）
  → utils.js の 15行目、getUserName関数
  → handler.js の 42行目から呼ばれた
  → server.js の 28行目から呼ばれた
```

### よくあるエラー

```javascript
// TypeError: xxx is not a function
// → 関数じゃないものを関数として呼んだ
const obj = {};
obj.foo();  // objにfooメソッドはない

// ReferenceError: xxx is not defined
// → 定義されていない変数を使った
console.log(undefinedVariable);

// SyntaxError
// → 文法エラー（括弧の閉じ忘れなど）
const obj = { name: 'test'  // } を忘れた
```

---

## console を使う

### 基本

```javascript
console.log('値:', value);
console.log('オブジェクト:', { user, posts, settings });

// 条件付き
console.assert(value > 0, 'valueは正の数であるべき');

// グループ化
console.group('ユーザー処理');
console.log('開始');
console.log('完了');
console.groupEnd();

// テーブル表示
console.table([
  { name: '田中', age: 30 },
  { name: '山田', age: 25 }
]);

// 時間計測
console.time('処理時間');
// ... 何か処理
console.timeEnd('処理時間');  // 処理時間: 123ms
```

### どこに入れるか

```javascript
async function handleLogin(req, res) {
  console.log('1. handleLogin開始', { body: req.body });

  const user = await findUser(req.body.email);
  console.log('2. findUser結果', { user });

  if (!user) {
    console.log('3. ユーザーが見つからない');
    return res.status(401).json({ error: 'Not found' });
  }

  const isValid = await verifyPassword(req.body.password, user.password);
  console.log('4. パスワード検証', { isValid });

  // ... 以下略
}

// 出力を見て「どこまで進んで、どこで止まったか」がわかる
```

---

## デバッガーを使う

### ブラウザの開発者ツール

```javascript
function calculateTotal(items) {
  debugger;  // ここで止まる

  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}
```

開発者ツール（F12）を開いた状態で実行すると、debuggerの行で停止。

```
操作:
- F10: 次の行へ（ステップオーバー）
- F11: 関数の中へ（ステップイン）
- Shift+F11: 関数から出る（ステップアウト）
- F8: 続行
```

### VS Codeのデバッガー

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/src/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

コードの行番号をクリックしてブレークポイントを設定、F5で実行。

---

## ネットワークのデバッグ

### ブラウザのNetworkタブ

```
1. 開発者ツールを開く（F12）
2. Networkタブを選択
3. リクエストを実行
4. 一覧から確認したいリクエストをクリック

確認できること:
- リクエストURL、メソッド
- リクエストヘッダー、ボディ
- レスポンスステータス
- レスポンスヘッダー、ボディ
- タイミング（どれくらい時間がかかったか）
```

### curlでAPIを叩く

```bash
# GET
curl http://localhost:3000/api/users

# POST
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"田中"}'

# 詳細表示
curl -v http://localhost:3000/api/users
```

---

## 問題の切り分け

### どこで問題が起きているか

```
フロントエンド？ バックエンド？ DB？

確認方法:
1. ブラウザのNetworkタブでAPIレスポンスを確認
   - レスポンスが正しい → フロントエンドの問題
   - レスポンスがおかしい → バックエンドの問題

2. バックエンドのログを確認
   - SQLが正しい結果を返している → バックエンドの問題
   - SQLがおかしい → DBクエリの問題
```

### 最小限のコードで再現

```javascript
// 複雑なコード全体でデバッグするのではなく
// 問題の箇所だけ抜き出してテスト

// test.js
const { problematicFunction } = require('./utils');

const result = problematicFunction({ id: 1, name: null });
console.log(result);

// node test.js で単独実行
```

---

## よくあるバグパターン

### 非同期処理の罠

```javascript
// バグ: awaitを忘れた
async function getUser() {
  const user = fetchUser(1);  // Promise が返る
  console.log(user.name);     // undefined
}

// 修正
async function getUser() {
  const user = await fetchUser(1);
  console.log(user.name);
}
```

### オフバイワンエラー

```javascript
// バグ: 配列の範囲外アクセス
const arr = [1, 2, 3];
for (let i = 0; i <= arr.length; i++) {  // <= は間違い
  console.log(arr[i]);  // 最後にundefined
}

// 修正
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```

### 参照と値

```javascript
// バグ: オブジェクトは参照渡し
const original = { count: 0 };
const copy = original;
copy.count = 1;
console.log(original.count);  // 1（元も変わってる！）

// 修正: 新しいオブジェクトを作る
const copy = { ...original };
copy.count = 1;
console.log(original.count);  // 0
```

---

## デバッグのコツ

### 二分探索

```
問題が起きているコードが長いとき:
1. 真ん中にconsole.logを入れる
2. 問題が前半か後半かわかる
3. その半分のさらに真ん中に入れる
4. 繰り返す

100行のコードでも7回で特定できる（2^7 = 128）
```

### ラバーダック・デバッグ

```
問題を誰か（またはゴム製のアヒル）に説明してみる

「えーと、ここでユーザーを取得して...
 あ、ここでnullチェックしてないじゃん」

説明する過程で気づくことが多い
```

### git bisect

```bash
# 「前は動いていた」コードがいつ壊れたか探す
git bisect start
git bisect bad                 # 今のコミットは壊れている
git bisect good abc1234        # このコミットは動いていた

# Gitが二分探索で「これは動く？」と聞いてくる
# good/bad を答えていくと、壊れたコミットが特定できる

git bisect reset  # 終了
```

---

## まとめ

- **エラーメッセージを読む** = 最初の手がかり
- **console.log** = シンプルだが強力
- **debugger** = 変数の中身を見ながらステップ実行
- **Networkタブ** = API通信の確認
- **切り分け** = フロント/バック/DBのどこか
- **二分探索** = 効率的に原因箇所を特定

## 次の部へ

これまで学んだことを実践してみましょう。
→ [第6部: 実装演習](../06-practice/01-auth-system.md)
