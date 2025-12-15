/**
 * Header（Server Component）
 *
 * Server Componentはデフォルトでサーバーで実行される。
 * DBアクセスや環境変数へのアクセスが可能。
 */

import Link from 'next/link';

// Server Componentでデータ取得（仮の実装）
async function getCurrentUser() {
  // 実際はDBやセッションから取得
  return { name: 'ゲスト' };
}

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white border-b">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          My App
        </Link>

        <ul className="flex gap-6">
          <li>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              ホーム
            </Link>
          </li>
          <li>
            <Link
              href="/posts"
              className="text-gray-600 hover:text-gray-900"
            >
              投稿
            </Link>
          </li>
        </ul>

        <div className="text-gray-600">
          {user.name}
        </div>
      </nav>
    </header>
  );
}

/*
 * Server Component の利点:
 *
 * 1. バンドルサイズ削減
 *    - コンポーネントのJSがクライアントに送られない
 *    - 依存ライブラリもバンドルに含まれない
 *
 * 2. 直接データアクセス
 *    - DBクエリを直接実行
 *    - useEffect + fetch 不要
 *
 * 3. セキュリティ
 *    - API キーなどがクライアントに露出しない
 *    - 秘密情報を安全に扱える
 */
