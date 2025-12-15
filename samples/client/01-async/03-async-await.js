/**
 * async/awaitによる非同期処理
 * カリキュラム: 4-5. 非同期処理
 *
 * 実行方法:
 *   node 03-async-await.js
 */

console.log("=== async/awaitによる非同期処理 ===\n");

// Promiseを返す関数
function fetchUser(id) {
  console.log(`fetchUser(${id}) を呼び出し中...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "田中", email: "tanaka@example.com" });
    }, 1000);
  });
}

function fetchPosts(userId) {
  console.log(`fetchPosts(${userId}) を呼び出し中...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "最初の投稿", userId },
        { id: 2, title: "2番目の投稿", userId },
      ]);
    }, 1000);
  });
}

function fetchComments(postId) {
  console.log(`fetchComments(${postId}) を呼び出し中...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, text: "いいね！", postId },
        { id: 2, text: "素晴らしい", postId },
      ]);
    }, 1000);
  });
}

// --- async/await ---
async function loadData() {
  try {
    console.log("1. 開始");

    // 同期処理のように読める！
    const user = await fetchUser(1);
    console.log("ユーザー取得:", user.name);

    const posts = await fetchPosts(user.id);
    console.log("投稿取得:", posts.length, "件");

    const comments = await fetchComments(posts[0].id);
    console.log("コメント取得:", comments.length, "件");

    console.log("\n結果:", { user, posts, comments });
    console.log("\n合計約3秒（直列実行）");
  } catch (error) {
    console.error("エラー:", error);
  }
}

loadData();
console.log("2. loadData()を呼び出した直後（async関数は非同期なのでここがすぐ実行される）");
