import type { MDXComponents as MDXComponentsType } from 'mdx/types';
import { CodeBlock } from './CodeBlock';
import Link from 'next/link';

// Markdown内のリンクをNext.jsのLinkに変換
function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) {
    return <a {...props}>{children}</a>;
  }

  // 外部リンク
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  // 内部リンク: .md を除去してNext.jsのルートに変換
  const internalHref = href
    .replace(/\.md$/, '')
    .replace(/^\.\//, '')
    .replace(/^\.\.\//, '/docs/');

  // 相対パスの処理
  if (!internalHref.startsWith('/')) {
    return (
      <Link href={internalHref} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={internalHref} {...props}>
      {children}
    </Link>
  );
}

// preタグの処理
// rehype-pretty-codeで処理されたものはそのまま表示（シンタックスハイライト付き）
// それ以外はCodeBlockで処理
function CustomPre({ children, ...props }: React.HTMLAttributes<HTMLPreElement> & { 'data-language'?: string }) {
  // rehype-pretty-codeで処理されたコードブロック（data-language属性がある）
  // シンタックスハイライト付きでそのまま表示
  if (props['data-language']) {
    return (
      <pre
        className="p-4 overflow-x-auto rounded-lg text-sm my-4"
        {...props}
      >
        {children}
      </pre>
    );
  }

  // childrenがcode要素の場合
  if (
    children &&
    typeof children === 'object' &&
    'type' in children &&
    children.type === 'code'
  ) {
    const codeProps = children.props as {
      children?: string;
      className?: string;
      'data-language'?: string;
    };

    // rehype-pretty-codeで処理済みの場合はそのまま
    if (codeProps['data-language']) {
      return (
        <pre
          className="p-4 overflow-x-auto rounded-lg text-sm my-4"
          {...props}
        >
          {children}
        </pre>
      );
    }

    return (
      <CodeBlock className={codeProps.className}>
        {codeProps.children || ''}
      </CodeBlock>
    );
  }

  // childrenが文字列の場合（言語指定なしのコードブロック）
  if (typeof children === 'string') {
    return <CodeBlock>{children}</CodeBlock>;
  }

  // それ以外はスタイル付きで表示
  return (
    <pre
      className="p-4 overflow-x-auto rounded-lg text-sm font-mono my-4"
      style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
      {...props}
    >
      {children}
    </pre>
  );
}

// テーブルのスタイリング
function CustomTable({
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full border-collapse border border-gray-300"
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function CustomThead({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-gray-100" {...props}>
      {children}
    </thead>
  );
}

function CustomTbody({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className="bg-white" {...props}>
      {children}
    </tbody>
  );
}

function CustomTr({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className="border-b border-gray-200" {...props}>
      {children}
    </tr>
  );
}

function CustomTh({
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-300"
      {...props}
    >
      {children}
    </th>
  );
}

function CustomTd({
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300" {...props}>
      {children}
    </td>
  );
}

// 見出しにアンカーリンクを追加
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return function Heading({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = typeof children === 'string' ? children : '';
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const sizes: Record<number, string> = {
      1: 'text-3xl font-bold mt-8 mb-4',
      2: 'text-2xl font-bold mt-6 mb-3',
      3: 'text-xl font-semibold mt-4 mb-2',
      4: 'text-lg font-semibold mt-3 mb-2',
      5: 'text-base font-medium mt-2 mb-1',
      6: 'text-sm font-medium mt-2 mb-1',
    };

    return (
      <Tag id={id} className={`${sizes[level]} group`} {...props}>
        {children}
        {level > 1 && (
          <a
            href={`#${id}`}
            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
            aria-label={`${text}へのリンク`}
          >
            #
          </a>
        )}
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponentsType = {
  // 見出し
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  // リンク
  a: CustomLink,

  // コードブロック
  pre: CustomPre,

  // インラインコード
  code: ({ children, className, ...props }) => {
    // preの中のcodeはCustomPreで処理
    if (className?.includes('language-')) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },

  // テーブル
  table: CustomTable,
  thead: CustomThead,
  tbody: CustomTbody,
  tr: CustomTr,
  th: CustomTh,
  td: CustomTd,

  // 段落
  p: ({ children, ...props }) => (
    <p className="my-4 leading-7 text-gray-700" {...props}>
      {children}
    </p>
  ),

  // リスト
  ul: ({ children, ...props }) => (
    <ul className="my-4 ml-6 list-disc space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-4 ml-6 list-decimal space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-700" {...props}>
      {children}
    </li>
  ),

  // 区切り線
  hr: () => <hr className="my-8 border-gray-200" />,

  // 引用
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-4 pl-4 border-l-4 border-gray-300 text-gray-600 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // 強調
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
};
