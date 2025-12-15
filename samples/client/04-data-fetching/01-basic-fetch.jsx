/**
 * 01-basic-fetch.jsx
 *
 * useEffect + fetch でデータを取得する「よくある」実装
 * → 問題点を理解するためのサンプル
 */

import { useState, useEffect } from 'react';

// ========================================
// 問題のある実装（よくある書き方）
// ========================================

function UserListBad() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  // 問題点:
  // 1. キャッシュがない → 毎回APIを叩く
  // 2. 他のコンポーネントとデータを共有できない
  // 3. 再取得のタイミングは？
  // 4. エラー時のリトライは？
  // 5. コンポーネントがアンマウントされたら？

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ========================================
// 少し改善した実装（まだ問題あり）
// ========================================

function UserListBetter() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // クリーンアップ用のフラグ
    let cancelled = false;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/users');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        // アンマウント後のsetStateを防ぐ
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    // クリーンアップ関数
    return () => {
      cancelled = true;
    };
  }, []);

  // まだ残る問題:
  // - キャッシュがない
  // - コンポーネント間でデータ共有できない
  // - 自動リフェッチがない
  // - エラーリトライを自分で実装する必要がある

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ========================================
// キャッシュを自分で実装しようとすると...
// ========================================

// グローバルなキャッシュ（問題のある実装）
const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000; // 5分

function useCachedFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      // キャッシュを確認
      const cached = cache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
        setData(cached.data);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(url);
        const json = await res.json();

        if (!cancelled) {
          // キャッシュに保存
          cache.set(url, { data: json, timestamp: Date.now() });
          setData(json);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [url]);

  return { data, isLoading, error };
}

// 問題点:
// - キャッシュの無効化が難しい
// - メモリリークの可能性
// - 複雑になるほどバグが増える
// - テストが難しい
// → だから TanStack Query を使う！

export { UserListBad, UserListBetter, useCachedFetch };
