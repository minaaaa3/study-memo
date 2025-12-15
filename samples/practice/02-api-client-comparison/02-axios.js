/**
 * 02-axios.js
 *
 * Axios でAPI呼び出し
 * → 共通処理をまとめやすい
 */

import axios from 'axios';

// ========================================
// Axios インスタンスを作成
// ========================================

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000, // 10秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================================
// インターセプター（リクエスト）
// ========================================

api.interceptors.request.use(
  (config) => {
    // リクエスト前に毎回実行される
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);

    // 認証トークンを自動付与
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// インターセプター（レスポンス）
// ========================================

api.interceptors.response.use(
  (response) => {
    // 成功時
    return response;
  },
  async (error) => {
    // エラー時
    const originalRequest = error.config;

    // 401エラー（認証切れ）の場合、トークンをリフレッシュ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);

        // 元のリクエストを再実行
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // リフレッシュも失敗したらログアウト
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // エラーログ
    console.error('[API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    return Promise.reject(error);
  }
);

// ========================================
// API関数
// ========================================

// Users API
export const usersApi = {
  getAll: () => api.get('/users').then(res => res.data),

  getById: (id) => api.get(`/users/${id}`).then(res => res.data),

  create: (data) => api.post('/users', data).then(res => res.data),

  update: (id, data) => api.put(`/users/${id}`, data).then(res => res.data),

  delete: (id) => api.delete(`/users/${id}`).then(res => res.data),

  search: (query) => api.get('/users', { params: { q: query } }).then(res => res.data),
};

// Posts API
export const postsApi = {
  getAll: (params) => api.get('/posts', { params }).then(res => res.data),

  getById: (id) => api.get(`/posts/${id}`).then(res => res.data),

  getByUser: (userId) => api.get(`/users/${userId}/posts`).then(res => res.data),

  create: (data) => api.post('/posts', data).then(res => res.data),

  update: (id, data) => api.put(`/posts/${id}`, data).then(res => res.data),

  delete: (id) => api.delete(`/posts/${id}`).then(res => res.data),
};

// Auth API
export const authApi = {
  login: (credentials) =>
    api.post('/auth/login', credentials).then(res => res.data),

  register: (userData) =>
    api.post('/auth/register', userData).then(res => res.data),

  logout: () =>
    api.post('/auth/logout').then(res => res.data),

  me: () =>
    api.get('/auth/me').then(res => res.data),
};

// ========================================
// 使用例
// ========================================

async function example() {
  try {
    // ユーザー一覧取得
    const users = await usersApi.getAll();
    console.log('Users:', users);

    // ユーザー作成
    const newUser = await usersApi.create({
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log('Created:', newUser);

    // ユーザー更新
    const updated = await usersApi.update(newUser.id, {
      name: 'John Updated',
    });
    console.log('Updated:', updated);

    // ユーザー削除
    await usersApi.delete(newUser.id);
    console.log('Deleted');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
    } else {
      console.error('Error:', error);
    }
  }
}

// ========================================
// Axiosの利点
// ========================================

/*
 * ✅ Axiosの利点:
 *    - 自動でJSONをパース
 *    - インターセプターで共通処理
 *    - タイムアウト設定が簡単
 *    - リクエストキャンセルのサポート
 *    - ブラウザ・Node.js両対応
 *
 * ⚠️ 注意点:
 *    - キャッシュ機能はない
 *    - React との統合は別途必要
 *    - バンドルサイズが増える
 *
 * → キャッシュや状態管理が必要なら TanStack Query
 */

export default api;
