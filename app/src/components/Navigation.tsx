'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { NavSection } from '@/lib/navigation';

interface NavigationProps {
  sections: NavSection[];
}

export function Navigation({ sections }: NavigationProps) {
  const pathname = usePathname();
  const [expandedParts, setExpandedParts] = useState<Set<number>>(() => {
    // 現在のパスに対応する部を開いた状態にする
    const initialExpanded = new Set<number>();
    for (const section of sections) {
      for (const item of section.items) {
        if (pathname === item.href) {
          initialExpanded.add(section.part);
          break;
        }
      }
    }
    // 初期状態で何も開いていなければ第1部を開く
    if (initialExpanded.size === 0 && sections.length > 0) {
      initialExpanded.add(sections[0].part);
    }
    return initialExpanded;
  });

  const togglePart = (part: number) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(part)) {
        next.delete(part);
      } else {
        next.add(part);
      }
      return next;
    });
  };

  return (
    <nav className="space-y-2">
      {sections.map((section) => (
        <div key={section.part} className="border-b border-gray-200 pb-2">
          <button
            onClick={() => togglePart(section.part)}
            className="flex items-center justify-between w-full py-2 text-left text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            <span>{section.title}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedParts.has(section.part) ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {expandedParts.has(section.part) && (
            <ul className="ml-4 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block py-1 text-sm transition-colors ${
                        isActive
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}

// モバイル用ナビゲーション
export function MobileNavigation({ sections }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
        aria-label="メニューを開く"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto p-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">目次</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Navigation sections={sections} />
          </div>
        </>
      )}
    </div>
  );
}
