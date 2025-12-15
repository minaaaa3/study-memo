/**
 * コールバックによる非同期処理
 * カリキュラム: 4-5. 非同期処理
 *
 * 実行方法:
 *   node 01-callback.js
 */

console.log("=== コールバックによる非同期処理 ===\n");

// 疑似的な非同期処理（APIリクエストのシミュレーション）
function fetchUser(id, callback) {
  console.log(`fetchUser(${id}) を呼び出し中...`);
  setTimeout(() => {
    const user = { id, name: "田中", email: "tanaka@example.com" };
    callback(null, user);
  }, 1000);
}

function fetchPosts(userId, callback) {
  console.log(`fetchPosts(${userId}) を呼び出し中...`);
  setTimeout(() => {
    const posts = [
      { id: 1, title: "最初の投稿", userId },
      { id: 2, title: "2番目の投稿", userId },
    ];
    callback(null, posts);
  }, 1000);
}

function fetchComments(postId, callback) {
  console.log(`fetchComments(${postId}) を呼び出し中...`);
  setTimeout(() => {
    const comments = [
      { id: 1, text: "いいね！", postId },
      { id: 2, text: "素晴らしい", postId },
    ];
    callback(null, comments);
  }, 1000);
}

// --- コールバック地獄の例 ---
console.log("1. 開始");

fetchUser(1, (err, user) => {
  if (err) {
    console.error("エラー:", err);
    return;
  }
  console.log("ユーザー取得:", user.name);

  fetchPosts(user.id, (err, posts) => {
    if (err) {
      console.error("エラー:", err);
      return;
    }
    console.log("投稿取得:", posts.length, "件");

    fetchComments(posts[0].id, (err, comments) => {
      if (err) {
        console.error("エラー:", err);
        return;
      }
      console.log("コメント取得:", comments.length, "件");
      console.log("\n結果:", { user, posts, comments });
      console.log("\n合計約3秒（直列実行）");
    });
  });
});

console.log("2. fetchUserを呼び出した直後（非同期なのでここがすぐ実行される）");
