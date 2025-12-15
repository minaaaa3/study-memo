# データベース連携サンプル

Node.jsからデータベースを操作する方法を学ぶサンプルです。

## ファイル構成

```
06-database/
├── 01-raw-sql/           # 直接SQL（better-sqlite3）
├── 02-prisma-basic/      # Prisma基本
├── 03-prisma-relations/  # リレーション
└── 04-prisma-crud-api/   # CRUD API完成版
```

## データベースの選択

### 開発・学習用
- **SQLite** - ファイルベース、セットアップ不要
- **PostgreSQL（Docker）** - 本番に近い環境

### 本番用
- **PostgreSQL** - 最も人気、機能豊富
- **MySQL** - 広く使われている
- **PlanetScale/Neon** - サーバーレス対応

## ORM/クエリビルダーの選択

| ツール | 特徴 | おすすめ度 |
|--------|------|-----------|
| **Prisma** | 型安全、マイグレーション、直感的 | ⭐⭐⭐ |
| Drizzle | 軽量、SQLに近い、型安全 | ⭐⭐ |
| Knex | クエリビルダー、柔軟 | ⭐ |
| 生SQL | 完全制御、学習向け | - |

## 学習の流れ

1. `01-raw-sql/` - SQLの基本を理解
2. `02-prisma-basic/` - Prismaの基本操作
3. `03-prisma-relations/` - テーブル間のリレーション
4. `04-prisma-crud-api/` - Express + Prismaで実際のAPI

## セットアップ

```bash
# Prismaを使う場合
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite

# スキーマを書いてマイグレーション
npx prisma migrate dev --name init

# Prisma Studioでデータ確認
npx prisma studio
```
