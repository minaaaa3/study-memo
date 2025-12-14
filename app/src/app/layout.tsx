import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navigation, MobileNavigation } from '@/components/Navigation';
import { getAllDocsWithContent } from '@/lib/docs';
import { buildNavigation } from '@/lib/navigation';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { SearchProvider } from '@/contexts/SearchContext';
import { PWARegister } from '@/components/PWARegister';

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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Web開発学習',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docs = getAllDocsWithContent();
  const navSections = buildNavigation(docs);

  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>
          <SearchProvider navSections={navSections}>
            <PWARegister />

            {/* ヘッダー */}
            <Header />

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
          </SearchProvider>
        </Providers>
      </body>
    </html>
  );
}
