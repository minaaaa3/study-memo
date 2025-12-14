export interface NavItem {
  title: string;
  href: string;
  part: number;
  chapter: number;
}

export interface NavSection {
  title: string;
  part: number;
  items: NavItem[];
}

// ナビゲーションデータを生成
export function buildNavigation(
  docs: Array<{
    slug: string[];
    title: string;
    part: number;
    chapter: number;
    partName: string;
  }>
): NavSection[] {
  const sections = new Map<number, NavSection>();

  for (const doc of docs) {
    if (!sections.has(doc.part)) {
      sections.set(doc.part, {
        title: doc.partName,
        part: doc.part,
        items: [],
      });
    }

    sections.get(doc.part)!.items.push({
      title: doc.title,
      href: `/docs/${doc.slug.join('/')}`,
      part: doc.part,
      chapter: doc.chapter,
    });
  }

  // 部の順番でソートして返す
  return Array.from(sections.values()).sort((a, b) => a.part - b.part);
}
