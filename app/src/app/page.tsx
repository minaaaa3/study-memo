import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';
import { buildNavigation } from '@/lib/navigation';
import { TableOfContents } from '@/components/TableOfContents';

export default function Home() {
  const docs = getAllDocs();
  const sections = buildNavigation(docs);

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヒーローセクション */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Web開発 基礎から実践まで
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          「TypeScriptやReactは触ったことあるけど、結局何が起きてるかわからない」
          <br />
          そんなエンジニアのための学習サイトです。
        </p>
        <Link
          href="/docs/01-web-basics/01-what-is-web"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          学習を始める
        </Link>
      </section>

      {/* 特徴 */}
      <section className="py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          学習の進め方
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-3">📖</div>
            <h3 className="font-semibold text-gray-900 mb-2">例え話から入る</h3>
            <p className="text-gray-600 text-sm">
              難しい概念も、身近なものに例えてから説明します
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-3">💻</div>
            <h3 className="font-semibold text-gray-900 mb-2">コードで確かめる</h3>
            <p className="text-gray-600 text-sm">
              読むだけでなく、実際に動かして確認します
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-3">🤔</div>
            <h3 className="font-semibold text-gray-900 mb-2">「なぜ」を大切に</h3>
            <p className="text-gray-600 text-sm">
              「こう書けば動く」ではなく「なぜそう書くのか」を理解します
            </p>
          </div>
        </div>
      </section>

      {/* 目次 */}
      <section className="py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">目次</h2>
        <TableOfContents sections={sections} />
      </section>

      {/* 推奨学習順序 */}
      <section className="py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          推奨する学習順序
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📚 標準ルート（しっかり学びたい人向け）
            </h3>
            <p className="text-blue-800 text-sm">
              第1部から順番に進めてください。
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              ⚡ 最短ルート（急いでいる人向け）
            </h3>
            <p className="text-gray-600 text-sm">
              1-1 → 1-2 → 1-3 → 2-2 → 3-1 → 4-2 → 6-5
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              🎯 つまみ食いルート（特定のトピックだけ知りたい人向け）
            </h3>
            <p className="text-gray-600 text-sm">
              各章は独立して読めますが、前提知識として第1部は読んでおくことをお勧めします。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
