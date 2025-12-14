import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navigation, MobileNavigation } from '@/components/Navigation';
import { getAllDocs } from '@/lib/docs';
import { buildNavigation } from '@/lib/navigation';
import { Providers } from '@/components/Providers';
import { UserMenu } from '@/components/UserMenu';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Web開発 基礎から実践まで',
  description: 'TypeScriptやReactを理解するための学習サイト',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docs = getAllDocs();
  const navSections = buildNavigation(docs);

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>
          {/* ヘッダー */}
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 truncate">
                Web開発 基礎から実践まで
              </Link>
              {/* デスクトップナビゲーション */}
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  ホーム
                </Link>
                <Link
                  href="/docs/01-web-basics/01-what-is-web"
                  className="text-gray-600 hover:text-gray-900"
                >
                  学習を始める
                </Link>
                <UserMenu />
              </nav>
              {/* モバイルユーザーメニュー */}
              <div className="md:hidden">
                <UserMenu />
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto flex">
            {/* サイドバー（デスクトップ） */}
            <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-gray-200 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
              <Navigation sections={navSections} />
            </aside>

            {/* メインコンテンツ */}
            <main className="flex-1 min-w-0 px-4 py-8 lg:px-8">{children}</main>
          </div>

          {/* モバイルナビゲーション */}
          <MobileNavigation sections={navSections} />

          {/* フッター */}
          <footer className="border-t border-gray-200 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
              <p>Web開発 基礎から実践まで</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
