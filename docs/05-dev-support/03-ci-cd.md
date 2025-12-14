# 5-3. CI/CD

## 例え話：工場の自動化ライン

- **CI（継続的インテグレーション）** = 部品のチェックを自動化。組み立てるたびに品質検査
- **CD（継続的デリバリー/デプロイ）** = 完成品の出荷を自動化。検査通ったら自動で店頭へ

手作業だと「忘れた」「間違えた」が起きますが、自動化すれば毎回同じ品質を保てます。

---

## 核心：何が自動化されるか

### CI（Continuous Integration）

コードがプッシュされたら自動で実行：

```yaml
1. コードを取得
2. 依存関係をインストール
3. リンター実行（コード規約チェック）
4. テスト実行
5. ビルド
```

### CD（Continuous Delivery/Deployment）

CIが通ったら自動で実行：

```yaml
6. 本番環境にデプロイ
   または
6. ステージング環境にデプロイ → 手動で本番へ
```

---

## GitHub Actions

GitHubに組み込まれたCI/CDサービス。

### 基本的な設定

```yaml
# .github/workflows/ci.yml

name: CI

# いつ実行するか
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 何を実行するか
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # コードを取得
      - uses: actions/checkout@v4

      # Node.jsをセットアップ
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 依存関係をインストール
      - run: npm ci

      # リンター
      - run: npm run lint

      # テスト
      - run: npm test

      # ビルド
      - run: npm run build
```

### より実践的な例

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # テスト
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test

  # ビルド
  build:
    needs: test  # testが成功したら実行
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  # デプロイ（mainブランチのみ）
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## よく使うパターン

### プルリクエストでのチェック

```yaml
on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test

# PRがマージされる前にチェックを通す
# GitHubの設定で「必須チェック」に指定できる
```

### マトリックスビルド

複数環境でテスト。

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

### キャッシュ

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

---

## Secrets（機密情報）

環境変数に秘密情報を安全に保存。

```yaml
# 使用
env:
  API_KEY: ${{ secrets.API_KEY }}

# または
run: |
  echo "Deploying..."
  curl -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" ...
```

設定場所: リポジトリ → Settings → Secrets and variables → Actions

---

## デプロイ先のサービス

### Vercel（フロントエンド）

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

### AWS（汎用）

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-northeast-1

- name: Deploy to S3
  run: aws s3 sync ./dist s3://my-bucket --delete
```

---

## よくある誤解

### 「CI/CDは大規模プロジェクト用」？

個人プロジェクトでも有用です。

```
メリット:
- 「あれ、テスト通ったっけ？」がなくなる
- デプロイが楽になる
- 一度設定すれば自動で動く
```

### 「CI/CDがあればテスト不要」？

テストがなければCIは意味がありません。

```yaml
# これは意味がない
- run: npm run build  # ビルドできることしか確認してない

# テストがあって初めて価値がある
- run: npm test
- run: npm run build
```

---

## まとめ

- **CI** = コードをプッシュするたびに自動でテスト・ビルド
- **CD** = CIが通ったら自動でデプロイ
- **GitHub Actions** = GitHubに組み込まれたCI/CD
- **Secrets** = 機密情報を安全に管理
- **自動化の価値** = 人的ミスの防止、時間の節約

## 次の章へ

開発環境をどう構築する？
→ [5-4. 環境構築](./04-environment.md)
