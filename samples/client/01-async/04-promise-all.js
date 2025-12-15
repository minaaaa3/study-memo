/**
 * Promise.allによる並列実行
 * カリキュラム: 4-5. 非同期処理
 *
 * 実行方法:
 *   node 04-promise-all.js
 */

console.log("=== Promise.allによる並列実行 ===\n");

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

// --- 並列実行 ---
async function loadDataParallel() {
  console.log("=== 並列実行（Promise.all）===");
  const startTime = Date.now();

  // 依存関係がないので、同時に実行できる
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),
    fetchPosts(1), // 本来はuserIdに依存するが、デモのため1固定
    fetchComments(1),
  ]);

  const endTime = Date.now();
  console.log("\n結果:", { user, posts, comments });
  console.log(`\n所要時間: ${endTime - startTime}ms（約1秒で完了！）`);
}

// --- 直列実行との比較 ---
async function loadDataSequential() {
  console.log("\n=== 直列実行（比較用）===");
  const startTime = Date.now();

  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);

  const endTime = Date.now();
  console.log("\n結果:", { user, posts, comments });
  console.log(`\n所要時間: ${endTime - startTime}ms（約3秒かかる）`);
}

// 実行
(async () => {
  await loadDataParallel();
  await loadDataSequential();
})();
