import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_PATH = path.join(process.cwd(), '..', 'docs');

export interface DocMeta {
  slug: string[];
  title: string;
  part: number;
  chapter: number;
  partName: string;
}

export interface Doc extends DocMeta {
  content: string;
}

// 部の名前マッピング
const PART_NAMES: Record<string, string> = {
  '01-web-basics': '第1部: Webの全体像を掴む',
  '02-server-world': '第2部: サーバーの世界',
  '03-server-tech': '第3部: サーバーサイドの技術',
  '04-client-tech': '第4部: クライアントサイドの技術',
  '05-dev-support': '第5部: 開発を支える技術',
  '06-practice': '第6部: 実装演習',
};

// ファイル名からメタデータを抽出
function extractMeta(partDir: string, fileName: string): Omit<DocMeta, 'title'> {
  const partMatch = partDir.match(/^(\d+)-/);
  const chapterMatch = fileName.match(/^(\d+)-/);

  return {
    slug: [partDir, fileName.replace('.md', '')],
    part: partMatch ? parseInt(partMatch[1], 10) : 0,
    chapter: chapterMatch ? parseInt(chapterMatch[1], 10) : 0,
    partName: PART_NAMES[partDir] || partDir,
  };
}

// Markdownからタイトルを抽出
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1] : 'Untitled';
}

// すべてのドキュメントのメタデータを取得
export function getAllDocs(): DocMeta[] {
  const docs: DocMeta[] = [];

  const partDirs = fs.readdirSync(DOCS_PATH).filter((dir) => {
    const fullPath = path.join(DOCS_PATH, dir);
    return fs.statSync(fullPath).isDirectory() && /^\d+-/.test(dir);
  });

  for (const partDir of partDirs) {
    const partPath = path.join(DOCS_PATH, partDir);
    const files = fs.readdirSync(partPath).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(partPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const meta = extractMeta(partDir, file);
      const title = extractTitle(content);

      docs.push({ ...meta, title });
    }
  }

  // 部 → 章の順でソート
  return docs.sort((a, b) => {
    if (a.part !== b.part) return a.part - b.part;
    return a.chapter - b.chapter;
  });
}

// slugからドキュメントを取得
export function getDocBySlug(slug: string[]): Doc | null {
  const [partDir, chapter] = slug;
  const filePath = path.join(DOCS_PATH, partDir, `${chapter}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { content } = matter(fileContent);
  const meta = extractMeta(partDir, `${chapter}.md`);
  const title = extractTitle(content);

  return {
    ...meta,
    title,
    content,
  };
}

// 部ごとにグループ化したドキュメントを取得
export function getDocsGroupedByPart(): Map<string, DocMeta[]> {
  const docs = getAllDocs();
  const grouped = new Map<string, DocMeta[]>();

  for (const doc of docs) {
    const partKey = doc.slug[0];
    if (!grouped.has(partKey)) {
      grouped.set(partKey, []);
    }
    grouped.get(partKey)!.push(doc);
  }

  return grouped;
}

// 前後のドキュメントを取得
export function getAdjacentDocs(slug: string[]): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const docs = getAllDocs();
  const currentIndex = docs.findIndex(
    (doc) => doc.slug[0] === slug[0] && doc.slug[1] === slug[1]
  );

  return {
    prev: currentIndex > 0 ? docs[currentIndex - 1] : null,
    next: currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null,
  };
}

// 静的パス生成用
export function getAllDocSlugs(): string[][] {
  return getAllDocs().map((doc) => doc.slug);
}
