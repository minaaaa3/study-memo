/**
 * Prismaリレーション操作
 *
 * テーブル間の関連データを取得・作成する方法
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// === リレーションを含めた取得（include）===
async function getUserWithPosts(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,           // 投稿を含める
      profile: true,         // プロフィールを含める
    },
  });

  return user;
}

// ネストしたinclude
async function getPostWithAuthorAndComments(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,          // 投稿者
      comments: {
        include: {
          author: true,      // コメント投稿者
        },
        orderBy: { createdAt: 'desc' },
      },
      tags: {
        include: {
          tag: true,         // タグ情報
        },
      },
    },
  });

  return post;
}

// === 特定フィールドのみ取得（select）===
async function getUserPostTitles(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      posts: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return user;
}

// === リレーションでフィルタリング ===
async function getPublishedPostsByUser(userId) {
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
      published: true,
    },
    include: {
      author: true,
    },
  });

  return posts;
}

// リレーション先の条件でフィルタ
async function getUsersWithPublishedPosts() {
  const users = await prisma.user.findMany({
    where: {
      posts: {
        some: {               // 1つ以上の投稿が条件を満たす
          published: true,
        },
      },
    },
    include: {
      posts: {
        where: { published: true },
      },
    },
  });

  return users;
}

// === ネストした作成 ===
async function createUserWithProfile(userData, profileData) {
  const user = await prisma.user.create({
    data: {
      ...userData,
      profile: {
        create: profileData,  // プロフィールも同時に作成
      },
    },
    include: {
      profile: true,
    },
  });

  return user;
}

async function createPostWithTags(authorId, postData, tagNames) {
  const post = await prisma.post.create({
    data: {
      ...postData,
      author: {
        connect: { id: authorId },  // 既存ユーザーに接続
      },
      tags: {
        create: tagNames.map(name => ({
          tag: {
            connectOrCreate: {       // タグがなければ作成
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: {
      author: true,
      tags: { include: { tag: true } },
    },
  });

  return post;
}

// === リレーションの更新 ===
async function addTagToPost(postId, tagName) {
  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      tags: {
        create: {
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        },
      },
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return post;
}

async function removeTagFromPost(postId, tagId) {
  await prisma.tagsOnPosts.delete({
    where: {
      postId_tagId: {       // 複合キーの指定
        postId,
        tagId,
      },
    },
  });
}

// === 集計 ===
async function getPostCountByUser() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return users;
}

async function getTagsWithPostCount() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      posts: {
        _count: 'desc',
      },
    },
  });

  return tags;
}

// === 使用例 ===
async function main() {
  console.log('=== リレーション操作サンプル ===\n');

  // ユーザーとプロフィールを同時作成
  const user = await createUserWithProfile(
    { email: 'relation@example.com', name: 'リレーションユーザー' },
    { bio: '自己紹介文です', avatar: '/avatars/1.png' }
  );
  console.log('作成したユーザー:', JSON.stringify(user, null, 2));

  // 投稿とタグを同時作成
  const post = await createPostWithTags(
    user.id,
    { title: 'Prismaの使い方', content: 'リレーションは便利です', published: true },
    ['prisma', 'database', 'nodejs']
  );
  console.log('作成した投稿:', JSON.stringify(post, null, 2));

  // ネストした取得
  const fullUser = await getUserWithPosts(user.id);
  console.log('ユーザー（投稿含む）:', JSON.stringify(fullUser, null, 2));

  // 投稿数の集計
  const counts = await getPostCountByUser();
  console.log('ユーザーごとの投稿数:', counts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

export {
  getUserWithPosts,
  getPostWithAuthorAndComments,
  getUserPostTitles,
  getPublishedPostsByUser,
  getUsersWithPublishedPosts,
  createUserWithProfile,
  createPostWithTags,
  addTagToPost,
  removeTagFromPost,
  getPostCountByUser,
  getTagsWithPostCount,
};
