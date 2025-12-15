/**
 * Prisma CRUD操作の基本
 *
 * Prismaは型安全なORM。スキーマからTypeScript型を自動生成。
 *
 * セットアップ:
 * npm install prisma @prisma/client
 * npx prisma init --datasource-provider sqlite
 * npx prisma migrate dev --name init
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// === CREATE（作成）===
async function createUser(email, name) {
  const user = await prisma.user.create({
    data: {
      email,
      name,
    },
  });

  return user;
}

// 複数同時作成
async function createManyUsers(users) {
  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true, // 重複はスキップ
  });

  return result.count; // 作成された件数
}

// === READ（読み取り）===

// 1件取得（見つからなければnull）
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
}

// 1件取得（見つからなければエラー）
async function getUserByIdOrThrow(id) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  return user;
}

// 条件で検索（最初の1件）
async function getUserByEmail(email) {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  return user;
}

// 全件取得
async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

// 条件付き検索
async function searchUsers(query) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ],
    },
    orderBy: { name: 'asc' },
  });

  return users;
}

// ページネーション
async function getUsersWithPagination(page = 1, perPage = 10) {
  const skip = (page - 1) * perPage;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

// === UPDATE（更新）===
async function updateUser(id, data) {
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return user;
}

// 存在しなければ作成（upsert）
async function upsertUser(email, name) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },      // 存在する場合
    create: { email, name }, // 存在しない場合
  });

  return user;
}

// === DELETE（削除）===
async function deleteUser(id) {
  const user = await prisma.user.delete({
    where: { id },
  });

  return user;
}

// 条件で複数削除
async function deleteOldUsers(beforeDate) {
  const result = await prisma.user.deleteMany({
    where: {
      createdAt: { lt: beforeDate },
    },
  });

  return result.count;
}

// === フィルタリング条件 ===
async function advancedFiltering() {
  // 様々な条件
  const users = await prisma.user.findMany({
    where: {
      // 完全一致
      email: 'exact@example.com',

      // 部分一致
      name: { contains: '田中' },

      // 前方一致
      // name: { startsWith: '田' },

      // 後方一致
      // name: { endsWith: '郎' },

      // NOT
      // email: { not: 'exclude@example.com' },

      // IN
      // id: { in: [1, 2, 3] },

      // 範囲
      // createdAt: {
      //   gte: new Date('2024-01-01'),  // 以上
      //   lt: new Date('2024-12-31'),   // 未満
      // },

      // AND（暗黙的に適用）
      // OR
      // OR: [
      //   { name: { contains: '田中' } },
      //   { name: { contains: '山田' } },
      // ],
    },
  });

  return users;
}

// === 使用例 ===
async function main() {
  console.log('=== Prisma CRUD サンプル ===\n');

  // ユーザー作成
  const user = await createUser('prisma@example.com', 'Prismaユーザー');
  console.log('作成:', user);

  // 取得
  const found = await getUserById(user.id);
  console.log('取得:', found);

  // 更新
  const updated = await updateUser(user.id, { name: '更新されたユーザー' });
  console.log('更新後:', updated);

  // 検索
  const searched = await searchUsers('Prisma');
  console.log('検索結果:', searched);

  // ページネーション
  const paginated = await getUsersWithPagination(1, 5);
  console.log('ページネーション:', paginated);

  // 削除
  await deleteUser(user.id);
  console.log('削除完了');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

export {
  prisma,
  createUser,
  createManyUsers,
  getUserById,
  getUserByIdOrThrow,
  getUserByEmail,
  getAllUsers,
  searchUsers,
  getUsersWithPagination,
  updateUser,
  upsertUser,
  deleteUser,
  deleteOldUsers,
};
