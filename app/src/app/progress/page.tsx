'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useProgress } from '@/contexts/ProgressContext';

// 各部の情報
const PARTS = [
  {
    id: 1,
    key: '01-web-basics',
    name: 'Webの全体像',
    fullName: '第1部: Webの全体像を掴む',
    description: 'HTTPやブラウザの仕組みなど、Web開発の基礎となる知識',
    color: '#3B82F6',
  },
  {
    id: 2,
    key: '02-server-world',
    name: 'サーバーの世界',
    fullName: '第2部: サーバーの世界',
    description: 'サーバーの役割やOS、ネットワークの基礎',
    color: '#10B981',
  },
  {
    id: 3,
    key: '03-server-tech',
    name: 'サーバーサイド',
    fullName: '第3部: サーバーサイドの技術',
    description: 'API設計、データベース、認証など',
    color: '#8B5CF6',
  },
  {
    id: 4,
    key: '04-client-tech',
    name: 'クライアントサイド',
    fullName: '第4部: クライアントサイドの技術',
    description: 'React、状態管理、レンダリングなど',
    color: '#F59E0B',
  },
  {
    id: 5,
    key: '05-dev-support',
    name: '開発支援技術',
    fullName: '第5部: 開発を支える技術',
    description: 'Git、CI/CD、テスト、セキュリティなど',
    color: '#EF4444',
  },
  {
    id: 6,
    key: '06-practice',
    name: '実装演習',
    fullName: '第6部: 実装演習',
    description: '実際にアプリケーションを作りながら学ぶ',
    color: '#EC4899',
  },
];

// 各部の章数（実際のコンテンツに基づく）
const CHAPTERS_PER_PART: Record<string, string[]> = {
  '01-web-basics': ['01-what-is-web', '02-request-response', '03-server-client', '04-history'],
  '02-server-world': ['01-what-is-server', '02-build-server', '03-pull-communication', '04-push-communication', '05-database'],
  '03-server-tech': ['01-auth', '02-session', '03-jwt', '04-hash-encryption', '05-https', '06-cache'],
  '04-client-tech': ['01-dom-rendering', '02-state-management', '03-routing', '04-styling', '05-async', '06-form', '07-data-fetching', '08-nextjs'],
  '05-dev-support': ['01-git', '02-testing', '03-ci-cd', '04-environment', '05-debugging', '06-cloud'],
  '06-practice': ['01-auth-system', '02-state-management', '03-api-client', '04-form', '05-mini-app'],
};

interface PartProgress {
  part: typeof PARTS[number];
  completed: number;
  total: number;
  percentage: number;
}

export default function ProgressPage() {
  const { progress, isAuthenticated, completedCount } = useProgress();
  const [partProgress, setPartProgress] = useState<PartProgress[]>([]);

  useEffect(() => {
    // 各部の進捗を計算
    const progressByPart = PARTS.map((part) => {
      const chapters = CHAPTERS_PER_PART[part.key] || [];
      const completedChapters = chapters.filter((chapter) => {
        const slug = `${part.key}/${chapter}`;
        return progress.find((p) => p.slug === slug && p.completed);
      }).length;

      return {
        part,
        completed: completedChapters,
        total: chapters.length,
        percentage: chapters.length > 0 ? Math.round((completedChapters / chapters.length) * 100) : 0,
      };
    });

    setPartProgress(progressByPart);
  }, [progress]);

  // レーダーチャート用データ
  const radarData = partProgress.map((p) => ({
    subject: p.part.name,
    progress: p.percentage,
    fullMark: 100,
  }));

  // 全体の進捗
  const totalChapters = Object.values(CHAPTERS_PER_PART).flat().length;
  const overallPercentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">スキルマップ</h1>
          <p className="text-gray-600 mb-8">
            学習の進捗を確認するにはログインが必要です。
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">スキルマップ</h1>
      <p className="text-gray-600 mb-8">
        Web開発の学習ロードマップと、あなたの現在の進捗状況を確認できます。
      </p>

      {/* 全体進捗サマリー */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">全体の学習進捗</h2>
            <p className="text-blue-100">
              {completedCount}/{totalChapters} 章完了
            </p>
          </div>
          <div className="text-5xl font-bold">{overallPercentage}%</div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* レーダーチャートと凡例 */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">スキルレーダー</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Radar
                  name="学習進捗"
                  dataKey="progress"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.5}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 各部の進捗リスト */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">各セクションの進捗</h2>
          <div className="space-y-4">
            {partProgress.map((p) => (
              <div key={p.part.id} className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.part.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {p.part.fullName}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {p.completed}/{p.total}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${p.percentage}%`,
                        backgroundColor: p.part.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 学習ロードマップ */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">学習ロードマップ</h2>
        <div className="relative">
          {/* 接続線 */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 hidden md:block" />

          <div className="space-y-6">
            {partProgress.map((p, index) => {
              const isComplete = p.percentage === 100;
              const isInProgress = p.percentage > 0 && p.percentage < 100;
              const isNext = index > 0 && partProgress[index - 1].percentage === 100 && p.percentage === 0;

              return (
                <div key={p.part.id} className="relative flex items-start gap-4 md:gap-6">
                  {/* ステータスアイコン */}
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete
                        ? 'bg-green-100 text-green-600'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-600'
                        : isNext
                        ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="font-bold">{p.part.id}</span>
                    )}
                  </div>

                  {/* コンテンツ */}
                  <div
                    className={`flex-1 p-4 rounded-lg border-2 ${
                      isComplete
                        ? 'border-green-200 bg-green-50'
                        : isInProgress
                        ? 'border-blue-200 bg-blue-50'
                        : isNext
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`font-semibold ${
                            isComplete
                              ? 'text-green-900'
                              : isInProgress
                              ? 'text-blue-900'
                              : isNext
                              ? 'text-yellow-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {p.part.fullName}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${
                            isComplete
                              ? 'text-green-700'
                              : isInProgress
                              ? 'text-blue-700'
                              : isNext
                              ? 'text-yellow-700'
                              : 'text-gray-400'
                          }`}
                        >
                          {p.part.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-2xl font-bold ${
                            isComplete
                              ? 'text-green-600'
                              : isInProgress
                              ? 'text-blue-600'
                              : isNext
                              ? 'text-yellow-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {p.percentage}%
                        </div>
                        <div
                          className={`text-xs ${
                            isComplete
                              ? 'text-green-600'
                              : isInProgress
                              ? 'text-blue-600'
                              : isNext
                              ? 'text-yellow-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {p.completed}/{p.total} 完了
                        </div>
                      </div>
                    </div>

                    {/* 進捗に応じたCTA */}
                    {(isInProgress || isNext) && (
                      <Link
                        href={`/docs/${p.part.key}/${CHAPTERS_PER_PART[p.part.key]?.[p.completed] || CHAPTERS_PER_PART[p.part.key]?.[0]}`}
                        className={`inline-block mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isInProgress
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                      >
                        {isInProgress ? '続きを学習する' : '学習を始める'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ホームへ戻るリンク */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
