/**
 * Promise.allSettledによるエラーハンドリング
 * カリキュラム: 4-5. 非同期処理
 *
 * 実行方法:
 *   node 05-promise-allsettled.js
 */

console.log("=== Promise.allSettled ===\n");

// 成功する関数
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "田中" });
    }, 500);
  });
}

// 失敗する関数
function fetchPosts(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("投稿の取得に失敗しました"));
    }, 500);
  });
}

// 成功する関数
function fetchComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([{ id: 1, text: "コメント" }]);
    }, 500);
  });
}

// --- Promise.all（1つ失敗すると全部止まる）---
async function withPromiseAll() {
  console.log("=== Promise.all ===");
  try {
    const results = await Promise.all([
      fetchUser(1),
      fetchPosts(1), // ← これが失敗する
      fetchComments(1),
    ]);
    console.log("結果:", results);
  } catch (error) {
    console.log("エラー:", error.message);
    console.log("→ 1つ失敗すると、他の成功した結果も取得できない\n");
  }
}

// --- Promise.allSettled（全部の結果を取得）---
async function withPromiseAllSettled() {
  console.log("=== Promise.allSettled ===");
  const results = await Promise.allSettled([
    fetchUser(1),
    fetchPosts(1), // ← これが失敗する
    fetchComments(1),
  ]);

  console.log("結果:");
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`  [${index}] 成功:`, result.value);
    } else {
      console.log(`  [${index}] 失敗:`, result.reason.message);
    }
  });
  console.log("→ 失敗しても他の結果は取得できる\n");
}

// 実行
(async () => {
  await withPromiseAll();
  await withPromiseAllSettled();
})();
