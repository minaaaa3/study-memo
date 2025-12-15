# 5-4. 環境構築

## 例え話：キッチンの準備

料理を始める前に「キッチンの準備」が必要です。

- **環境構築** = 調理器具を揃える、調味料を準備する
- **環境変数** = 塩加減のメモ（人によって違う）
- **Docker** = 誰がどこで作っても同じ味になるレシピセット

「私のPCでは動くのに...」という問題を防ぐのが環境構築です。

---

## 環境変数

### なぜ必要か

<Callout type="warning">
**環境変数を使う理由**

コードに直接秘密情報を書くと：
- GitHubに公開されたらパスワード漏洩
- 開発環境と本番環境で設定を変えられない
- セキュリティリスクが高い
</Callout>

```javascript
// ダメな例: コードに直接書く
const DATABASE_URL = 'postgres://user:password@localhost:5432/mydb';
// → GitHubに公開されたらパスワード漏洩
// → 開発/本番で違うDBを使いたい

// 良い例: 環境変数から読む
const DATABASE_URL = process.env.DATABASE_URL;
// → 環境ごとに設定を変えられる
// → 秘密情報がコードに含まれない
```

### .env ファイル

```bash
# .env（ローカル開発用、Gitにコミットしない）
DATABASE_URL=postgres://localhost:5432/mydb_dev
API_KEY=dev_key_12345
NODE_ENV=development
```

```bash
# .env.example（テンプレート、Gitにコミットする）
DATABASE_URL=
API_KEY=
NODE_ENV=development
```

### 使用方法（Node.js）

```javascript
// dotenv で読み込む
require('dotenv').config();

// または
import 'dotenv/config';

// 使用
console.log(process.env.DATABASE_URL);
```

### .gitignore

```gitignore
# 環境変数ファイルはコミットしない
.env
.env.local
.env.*.local

# ただしテンプレートはコミット
!.env.example
```

<Callout type="warning">
**.envファイルは絶対にコミットしない**

`.env`ファイルには秘密情報が含まれています。必ず`.gitignore`に追加してください。

代わりに`.env.example`というテンプレートファイルを作成し、チームで共有しましょう。
</Callout>

---

## Docker

### なぜ必要か

<WhyButton title="なぜDockerが必要？">

**「私のPCでは動くのに...」問題を解決**

よくある問題：
- Node.jsのバージョンが違う
- 依存ライブラリのバージョンが違う
- OSが違う（macOS vs Linux vs Windows）

Dockerなら：
- 全員同じ環境で動かせる
- 「この設定で動く」がファイルに残る
- 本番環境と同じ環境で開発できる
- 環境を簡単に再現できる

</WhyButton>

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 依存関係をインストール（キャッシュ効率のため先に）
COPY package*.json ./
RUN npm ci

# アプリケーションをコピー
COPY . .

# ビルド
RUN npm run build

# 起動
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml

複数のコンテナを管理。

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### よく使うコマンド

```bash
# ビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d

# 停止
docker-compose down

# ログを見る
docker-compose logs -f

# コンテナ内でコマンド実行
docker-compose exec app sh
```

---

## パッケージマネージャー

### npm vs yarn vs pnpm

```bash
# npm（Node.js標準）
npm install
npm install express
npm run dev

# yarn（高速、一貫性）
yarn
yarn add express
yarn dev

# pnpm（ディスク効率）
pnpm install
pnpm add express
pnpm dev
```

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "jest"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}
```

### ロックファイル

```
package-lock.json (npm)
yarn.lock (yarn)
pnpm-lock.yaml (pnpm)

役割:
- 依存関係の正確なバージョンを記録
- チーム全員が同じバージョンを使える
- 必ずGitにコミットする
```

---

## 開発ツールの設定

### ESLint（コード品質）

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

### Prettier（フォーマット）

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## よくある問題と解決

### ポート競合

```bash
# Error: listen EADDRINUSE: address already in use :::3000

# 使用中のプロセスを探す
lsof -i :3000

# 強制終了
kill -9 <PID>

# または別のポートを使う
PORT=3001 npm run dev
```

### 権限エラー（Mac/Linux）

```bash
# Permission denied

# ディレクトリの権限を確認
ls -la

# 権限を付与
chmod +x script.sh
```

### node_modules の問題

```bash
# 何かおかしいとき
rm -rf node_modules
rm package-lock.json
npm install
```

---

## よくある誤解

### 「Dockerは本番用」？

開発環境でも有用です。

```
開発でのメリット:
- データベースを簡単に起動できる
- チーム全員で同じ環境
- 「私のPCでは動く」問題を防止
```

### 「.env.localを共有すればいい」？

<Callout type="warning">
**.envファイルを共有してはいけない**

ダメな理由：
- 秘密情報がSlackやメールに残る
- 更新があったとき追従が大変
- 環境によって値が違う
- セキュリティリスクが高い

正しい方法：
- `.env.example` をGitで共有（値は空にする）
- 実際の値は各自で設定
- 本番の秘密情報はCI/CDのSecretsに保存
</Callout>

---

## まとめ

- **環境変数** = 設定を外出し。秘密情報はコードに書かない
- **.env** = ローカル用の環境変数ファイル
- **Docker** = 環境の差異をなくす
- **docker-compose** = 複数コンテナの管理
- **ロックファイル** = 依存関係のバージョン固定
- **ESLint/Prettier** = コードの品質・スタイル統一

