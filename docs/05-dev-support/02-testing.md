# 5-2. テスト

## 例え話：車の検査

テストは「車の検査」のようなものです。

- **単体テスト** = 各部品の検査（エンジン、ブレーキ、ライト）
- **結合テスト** = 部品を組み合わせた検査（エンジンとトランスミッション）
- **E2Eテスト** = 実際に走らせる検査（公道で運転してみる）

部品単体で問題なくても、組み合わせると動かないことがあります。

---

## 核心：なぜテストを書くのか

<WhyButton title="なぜテストを書くのか？">

**「壊れていないこと」を保証する**ためです。

機能追加や修正のたびに：
- 手動で全機能を確認？ → 時間かかりすぎ
- 確認を省略？ → いつか壊れる

テストがあれば：
- `npm test`で数秒〜数分で全確認
- 変更したコードが既存機能を壊していないか即座にわかる
- 新メンバーも安心してコードを変更できる

「動いているからOK」ではなく「テストが通っているからOK」を目指しましょう。

</WhyButton>

### テストがない場合

```javascript
// 変更するたびに手動で確認
// 「ログインできるかな...」ポチポチ
// 「登録も動くかな...」ポチポチ
// 「あれ、前は動いてたのに壊れてる」

// 問題点:
// - 時間がかかる
// - 忘れる
// - 人によって確認項目が違う
```

### テストがあれば

```javascript
// コマンド1つで全部確認
npm test

// 結果
✓ ログインできる
✓ パスワードが間違っているとエラー
✓ 登録後に確認メールが送られる
✗ 退会処理 ← 壊れてる！すぐわかる
```

---

## テストの種類

### テストピラミッド

```
        /\
       /  \
      / E2E \     少ない（遅い、壊れやすい）
     /------\
    /  結合   \    中程度
   /----------\
  /   単体     \   多い（速い、安定）
 /--------------\
```

### 単体テスト（Unit Test）

関数やコンポーネント単体をテスト。

```javascript
// sum.js
export function sum(a, b) {
  return a + b;
}

// sum.test.js
import { sum } from './sum';

test('1 + 2 = 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('負の数も扱える', () => {
  expect(sum(-1, 1)).toBe(0);
});
```

### 結合テスト（Integration Test）

複数のモジュールを組み合わせてテスト。

```javascript
// APIエンドポイントのテスト
import request from 'supertest';
import app from './app';

test('POST /users でユーザーが作成される', async () => {
  const response = await request(app)
    .post('/users')
    .send({ name: '田中', email: 'tanaka@test.com' });

  expect(response.status).toBe(201);
  expect(response.body.name).toBe('田中');
});
```

### E2Eテスト（End to End）

実際のブラウザで操作をシミュレート。

```javascript
// Playwrightの例
import { test, expect } from '@playwright/test';

test('ログインフロー', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toHaveText('ダッシュボード');
});
```

---

## Jest（テストフレームワーク）

### セットアップ

```bash
npm install --save-dev jest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### 基本的な書き方

```javascript
// describe: テストをグループ化
describe('Calculator', () => {
  // test (または it): 個別のテスト
  test('足し算ができる', () => {
    expect(1 + 1).toBe(2);
  });

  test('引き算ができる', () => {
    expect(5 - 3).toBe(2);
  });
});
```

### マッチャー

```javascript
// 等価
expect(value).toBe(3);           // === で比較
expect(obj).toEqual({ a: 1 });   // 深い比較

// 真偽
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();

// 数値
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(5);
expect(0.1 + 0.2).toBeCloseTo(0.3);  // 浮動小数点

// 文字列
expect(string).toMatch(/regex/);
expect(string).toContain('substring');

// 配列
expect(array).toContain(item);
expect(array).toHaveLength(3);

// 例外
expect(() => {
  throw new Error('oops');
}).toThrow('oops');
```

### モック

```javascript
// 関数をモック
const mockFn = jest.fn();
mockFn('hello');
expect(mockFn).toHaveBeenCalledWith('hello');

// 戻り値を設定
mockFn.mockReturnValue(42);
expect(mockFn()).toBe(42);

// モジュールをモック
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: '田中' })
}));
```

---

## React Testing Library

コンポーネントのテスト。

```jsx
// Button.jsx
export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

test('クリックでonClickが呼ばれる', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  // ボタンを取得
  const button = screen.getByText('Click me');

  // クリック
  fireEvent.click(button);

  // 確認
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### クエリの種類

```javascript
// getBy: 要素がなければエラー
screen.getByText('Hello');
screen.getByRole('button');
screen.getByLabelText('Email');

// queryBy: 要素がなければnull（存在しないことを確認）
expect(screen.queryByText('Error')).toBeNull();

// findBy: 非同期（要素が現れるまで待つ）
await screen.findByText('Loaded');
```

---

## テストの書き方のコツ

### AAA パターン

```javascript
test('ユーザーを作成できる', async () => {
  // Arrange（準備）
  const userData = { name: '田中', email: 'tanaka@test.com' };

  // Act（実行）
  const user = await createUser(userData);

  // Assert（確認）
  expect(user.id).toBeDefined();
  expect(user.name).toBe('田中');
});
```

### 何をテストするか

```javascript
// 良い: 振る舞いをテスト
test('正しいパスワードでログインできる', () => { ... });
test('間違ったパスワードでエラーになる', () => { ... });

// 悪い: 実装の詳細をテスト
test('passwordHashが正しく計算される', () => { ... });
// → 実装を変えるとテストも壊れる
```

### テストは独立させる

```javascript
// 悪い: テスト間で状態を共有
let user;
test('ユーザーを作成', () => {
  user = createUser();
});
test('ユーザーを削除', () => {
  deleteUser(user.id);  // 上のテストに依存
});

// 良い: 各テストが独立
test('ユーザーを作成', () => {
  const user = createUser();
  expect(user).toBeDefined();
});
test('ユーザーを削除', () => {
  const user = createUser();
  deleteUser(user.id);
  expect(getUser(user.id)).toBeNull();
});
```

---

## よくある誤解

### 「カバレッジ100%を目指すべき」？

カバレッジは参考程度に。

```javascript
// カバレッジ100%でも...
if (condition) {
  doSomething();
}
// conditionがtrueのケースしかテストしてないかも

// 重要なのは:
// - 重要なロジックがテストされているか
// - エッジケースがテストされているか
```

### 「テストは後から書く」？

できれば開発と並行して書く方がいいです。

```
後から書くデメリット:
- テストしにくいコードになりがち
- 「動いてるからいいや」でスキップしがち
- 何をテストすべきか忘れる
```

---

## まとめ

- **単体テスト** = 関数/コンポーネント単体を検証
- **結合テスト** = モジュールの連携を検証
- **E2Eテスト** = 実際の操作フローを検証
- **Jest** = JavaScriptのテストフレームワーク
- **React Testing Library** = Reactコンポーネントのテスト
- **振る舞いをテスト** = 実装の詳細ではなく

