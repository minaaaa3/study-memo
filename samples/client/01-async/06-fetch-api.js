/**
 * fetch APIの使い方
 * カリキュラム: 4-5. 非同期処理
 *
 * 実行方法:
 *   node 06-fetch-api.js
 *
 * 注意: このスクリプトは実際のAPIを呼び出します（JSONPlaceholder）
 */

console.log("=== fetch API ===\n");

// --- GETリクエスト ---
async function getUsers() {
  console.log("=== GET /users ===");
  const response = await fetch("https://jsonplaceholder.typicode.com/users");

  // fetchは404や500でもrejectしない！
  console.log("response.ok:", response.ok);
  console.log("response.status:", response.status);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`取得したユーザー数: ${data.length}`);
  console.log("最初のユーザー:", {
    id: data[0].id,
    name: data[0].name,
    email: data[0].email,
  });
  return data;
}

// --- POSTリクエスト ---
async function createPost() {
  console.log("\n=== POST /posts ===");
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "テスト投稿",
      body: "これはテストです",
      userId: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("作成された投稿:", data);
  return data;
}

// --- エラーハンドリング ---
async function fetchWithErrorHandling() {
  console.log("\n=== エラーハンドリング ===");

  // 存在しないエンドポイント
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/notfound"
    );
    console.log("404でもcatchには来ない:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.log("エラーをキャッチ:", error.message);
  }
}

// --- タイムアウト（AbortController）---
async function fetchWithTimeout() {
  console.log("\n=== AbortController（タイムアウト）===");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト

  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1",
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    const data = await response.json();
    console.log("取得成功:", { id: data.id, title: data.title });
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("リクエストがタイムアウトしました");
    } else {
      console.log("エラー:", error.message);
    }
  }
}

// 実行
(async () => {
  try {
    await getUsers();
    await createPost();
    await fetchWithErrorHandling();
    await fetchWithTimeout();
  } catch (error) {
    console.error("予期しないエラー:", error);
  }
})();
