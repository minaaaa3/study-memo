/**
 * ローディングUI
 *
 * ページ読み込み中に自動で表示される。
 * React Suspense を内部で使用。
 */

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
}

/*
 * loading.tsx の特徴:
 *
 * 1. 自動的に Suspense でラップ
 *    <Suspense fallback={<Loading />}>
 *      <Page />
 *    </Suspense>
 *
 * 2. ネスト対応
 *    app/loading.tsx        → 全ページ
 *    app/posts/loading.tsx  → /posts以下のページ
 *
 * 3. ストリーミング
 *    重い処理があってもUIは即座に表示
 *    データ取得完了後に差し替え
 */
