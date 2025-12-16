'use client';

import Link from 'next/link';
import { useProgress } from '@/contexts/ProgressContext';
import type { NavSection } from '@/lib/navigation';

interface TableOfContentsProps {
  sections: NavSection[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const { isCompleted, isAuthenticated } = useProgress();

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.part}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {section.title}
          </h3>
          <ul className="grid md:grid-cols-2 gap-2">
            {section.items.map((item) => {
              // hrefから/docs/を除いた部分がslug
              const slug = item.href.replace('/docs/', '');
              const completed = isAuthenticated && isCompleted(slug);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block p-3 border rounded transition-colors ${
                      completed
                        ? 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100'
                        : 'hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {completed && (
                        <svg
                          className="w-4 h-4 text-green-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      <span className={completed ? 'text-green-800' : 'text-gray-900'}>
                        {item.title}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
