import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { getDocBySlug, getAllDocSlugs, getAdjacentDocs } from '@/lib/docs';
import { mdxComponents } from '@/components/MDXComponents';

// シンタックスハイライトの設定
const rehypePrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,
};

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// 静的パス生成
export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

// メタデータ生成
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'ページが見つかりません',
    };
  }

  return {
    title: `${doc.title} | Web開発 基礎から実践まで`,
    description: `${doc.partName} - ${doc.title}`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const { prev, next } = getAdjacentDocs(slug);

  return (
    <article className="max-w-3xl mx-auto">
      {/* パンくずリスト */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{doc.partName}</span>
      </nav>

      {/* 本文 */}
      <div className="prose prose-gray max-w-none">
        <MDXRemote
          source={doc.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
            },
          }}
        />
      </div>

      {/* 前後のナビゲーション */}
      <nav className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
        {prev ? (
          <Link
            href={`/docs/${prev.slug.join('/')}`}
            className="group flex flex-col items-start"
          >
            <span className="text-sm text-gray-500 group-hover:text-blue-600">
              ← 前の章
            </span>
            <span className="text-gray-900 group-hover:text-blue-600">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug.join('/')}`}
            className="group flex flex-col items-end"
          >
            <span className="text-sm text-gray-500 group-hover:text-blue-600">
              次の章 →
            </span>
            <span className="text-gray-900 group-hover:text-blue-600">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
