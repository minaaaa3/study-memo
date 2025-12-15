/**
 * 01-vanilla-fetch.js
 *
 * 素のfetchでAPI呼び出し
 * → 問題点を理解する
 */

// ========================================
// 基本的なfetch（問題あり）
// ========================================

// GET
async function getUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  return data;
  // 問題: エラーハンドリングがない
}

// POST
async function createUser(user) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
  // 問題: エラーハンドリングがない、毎回headersを書く
}

// ========================================
// エラーハンドリングを追加（まだ問題あり）
// ========================================

async function getUsersWithError() {
  try {
    const response = await fetch('/api/users');

    // fetchはネットワークエラー以外で例外を投げない
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
  // 問題: 毎回同じエラーハンドリングを書く
}

// ========================================
// APIクライアントラッパーを作成
// ========================================

const API_BASE = 'http://localhost:3001/api';

async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // 認証トークンがあれば付与
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // bodyがオブジェクトならJSON.stringifyする
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // 204 No Content の場合
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      // APIからのエラーレスポンス
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // ネットワークエラーなど
    throw new ApiError('Network error', 0, null);
  }
}

// カスタムエラークラス
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ========================================
// 使用例
// ========================================

// GET
async function fetchUsers() {
  return apiClient('/users');
}

// GET with params
async function fetchUser(id) {
  return apiClient(`/users/${id}`);
}

// POST
async function createUserWithClient(userData) {
  return apiClient('/users', {
    method: 'POST',
    body: userData,
  });
}

// PUT
async function updateUser(id, userData) {
  return apiClient(`/users/${id}`, {
    method: 'PUT',
    body: userData,
  });
}

// DELETE
async function deleteUser(id) {
  return apiClient(`/users/${id}`, {
    method: 'DELETE',
  });
}

// ========================================
// 残る問題点
// ========================================

/*
 * 自前実装の限界:
 *   - キャッシュがない
 *   - リトライ機能がない
 *   - リクエストのキャンセルが大変
 *   - インターセプターがない
 *   - タイムアウト設定が面倒
 *
 * → Axios や TanStack Query を使う理由
 */

export {
  apiClient,
  ApiError,
  fetchUsers,
  fetchUser,
  createUserWithClient,
  updateUser,
  deleteUser,
};
