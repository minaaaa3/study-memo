'use client'; // エラーコンポーネントは Client Component 必須

/**
 * エラーUI
 *
 * ページでエラーが発生した時に自動で表示される。
 */

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログをサービスに送信
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="text-red-500 text-xl">⚠️ エラーが発生しました</div>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        再試行
      </button>
    </div>
  );
}

/*
 * error.tsx の特徴:
 *
 * 1. 'use client' 必須
 *    reset() を使うためにClient Componentである必要
 *
 * 2. Error Boundary として機能
 *    ページ内のエラーをキャッチ
 *    レイアウトは維持される
 *
 * 3. ネスト対応
 *    各ルートセグメントで独自のエラーUIを定義可能
 *
 * 4. reset() 関数
 *    エラーが発生したセグメントを再レンダリング
 */
