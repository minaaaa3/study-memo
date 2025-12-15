'use client';

import { useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Markdown文字列用コンポーネント
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        // コードブロック
        code: ({ children, className, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !className;

          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              style={oneDark}
              language={match ? match[1] : 'text'}
              PreTag="div"
              className="rounded-lg text-sm my-4"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },
        // 段落
        p: ({ children }) => <p className="my-2">{children}</p>,
        // 強調
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        // リスト
        ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 my-2">{children}</ol>,
        li: ({ children }) => <li className="my-1">{children}</li>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ============================================
// Accordion - 折りたたみコンテンツ
// ============================================
interface AccordionItem {
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
}

export function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ?? null);

  // 防御的チェック
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
      {items.map((item, index) => (
        <div key={index} className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
          >
            <span>{item.title}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-4 py-4 bg-white prose prose-sm max-w-none">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 単一のアコーディオン
interface AccordionSingleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionSingle({ title, children, defaultOpen = false }: AccordionSingleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="my-4 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 py-4 bg-white prose prose-sm max-w-none">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// Tabs - タブ切り替え（子要素ベース）
// ============================================

// TabItem - 個別のタブ（MDXから直接使える）
interface TabItemProps {
  value?: string;
  label: string;
  title?: string; // labelの別名
  children: ReactNode;
}

export function TabItem({ children }: TabItemProps) {
  // TabItem単体では何も表示しない（Tabsが子要素を処理する）
  return <>{children}</>;
}

// Tab - TabItemのエイリアス
export const Tab = TabItem;

// items propsベース（旧API）
interface TabsItemsProps {
  items: { label: string; content: ReactNode | string }[];
  defaultTab?: number;
  children?: never;
}

// children ベース（新API）
interface TabsChildrenProps {
  children: ReactNode;
  defaultTab?: number;
  items?: never;
}

type TabsProps = TabsItemsProps | TabsChildrenProps;

export function Tabs(props: TabsProps) {
  const [activeTab, setActiveTab] = useState(props.defaultTab ?? 0);

  // タブ情報を抽出
  const tabs: { label: string; content: ReactNode }[] = [];

  if ('items' in props && props.items) {
    // 旧API: items propsを使用
    props.items.forEach((item) => {
      tabs.push({
        label: item.label,
        content: typeof item.content === 'string'
          ? <MarkdownContent content={item.content} />
          : item.content,
      });
    });
  } else if ('children' in props && props.children) {
    // 新API: childrenからTabItem/Tabを抽出
    const processChildren = (nodes: ReactNode) => {
      const childArray = Array.isArray(nodes) ? nodes : [nodes];
      childArray.forEach((child) => {
        if (child && typeof child === 'object' && 'props' in child) {
          const element = child as React.ReactElement<TabItemProps>;
          const label = element.props?.label || element.props?.title || '';
          if (label) {
            tabs.push({
              label,
              content: element.props?.children,
            });
          } else if (element.props?.children) {
            processChildren(element.props.children);
          }
        }
      });
    };
    processChildren(props.children);
  }

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === index
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 bg-white border border-t-0 border-gray-200 rounded-b-lg prose prose-sm max-w-none">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}

// ============================================
// Timeline - 時系列表示
// ============================================
interface TimelineItem {
  year?: string;
  title: string;
  description: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="my-6 relative">
      {/* 縦線 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="relative pl-10">
            {/* 丸ポイント */}
            <div className="absolute left-2.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow" />

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {item.year && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded mb-2">
                  {item.year}
                </span>
              )}
              <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// StepByStep - ステップ表示（子要素ベース）
// ============================================
interface StepProps {
  title: string;
  children: ReactNode;
}

// 個別のStep（MDXから直接使える）
export function Step({ title, children }: StepProps) {
  return (
    <div className="step-item" data-title={title}>
      {children}
    </div>
  );
}

interface StepByStepProps {
  children: ReactNode;
  title?: string;
}

export function StepByStep({ children, title }: StepByStepProps) {
  // childrenからStepコンポーネントを抽出
  const steps: { title: string; content: ReactNode }[] = [];

  const processChildren = (nodes: ReactNode) => {
    const childArray = Array.isArray(nodes) ? nodes : [nodes];
    childArray.forEach((child) => {
      if (child && typeof child === 'object' && 'props' in child) {
        const element = child as React.ReactElement<{ title?: string; children?: ReactNode; 'data-title'?: string }>;
        // Step コンポーネントまたは step-item クラスを持つ要素を探す
        if (element.props?.title || element.props?.['data-title']) {
          steps.push({
            title: element.props.title || element.props['data-title'] || '',
            content: element.props.children,
          });
        } else if (element.props?.children) {
          // ネストされた要素の中も探す
          processChildren(element.props.children);
        }
      }
    });
  };

  processChildren(children);

  // Stepコンポーネントが見つからない場合は、childrenをそのまま表示
  if (steps.length === 0) {
    return (
      <div className="my-6">
        {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
        <div className="prose prose-sm max-w-none">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      {title && <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* ステップ番号 */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>

            <div className="flex-1 pb-4 border-b border-gray-100 last:border-b-0">
              <h5 className="font-medium text-gray-900 mb-1">{step.title}</h5>
              <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Callout - 強調ボックス
// ============================================
type CalloutType = 'info' | 'warning' | 'success' | 'error' | 'tip' | 'danger' | 'note';

interface CalloutProps {
  type?: CalloutType | string; // 任意の文字列も許容（フォールバック用）
  title?: string;
  children: ReactNode;
}

const calloutStyles: Record<CalloutType, { bg: string; border: string; icon: string; title: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    icon: 'text-blue-500',
    title: 'text-blue-800',
  },
  note: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    icon: 'text-blue-500',
    title: 'text-blue-800',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    icon: 'text-green-500',
    title: 'text-green-800',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    icon: 'text-red-500',
    title: 'text-red-800',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    icon: 'text-red-500',
    title: 'text-red-800',
  },
  tip: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    icon: 'text-purple-500',
    title: 'text-purple-800',
  },
};

const infoIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const warningIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const errorIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const calloutIcons: Record<CalloutType, ReactNode> = {
  info: infoIcon,
  note: infoIcon,
  warning: warningIcon,
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: errorIcon,
  danger: errorIcon,
  tip: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
    </svg>
  ),
};

const calloutTitles: Record<CalloutType, string> = {
  info: '情報',
  note: 'Note',
  warning: '注意',
  success: '成功',
  error: 'エラー',
  danger: '危険',
  tip: 'Tips',
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  // 未知のtypeの場合はinfoにフォールバック
  const validType = (type && type in calloutStyles) ? type as CalloutType : 'info';
  const styles = calloutStyles[validType];
  const displayTitle = title || calloutTitles[validType];

  return (
    <div className={`my-6 p-4 ${styles.bg} border-l-4 ${styles.border} rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 ${styles.icon}`}>
          {calloutIcons[validType]}
        </span>
        <div className="flex-1">
          <h5 className={`font-semibold ${styles.title} mb-1`}>{displayTitle}</h5>
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// InteractiveDemo - インタラクティブデモ
// ============================================
interface InteractiveDemoProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function InteractiveDemo({ title, description, children }: InteractiveDemoProps) {
  return (
    <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="p-4 bg-white">
        {children}
      </div>
    </div>
  );
}

// インタラクティブな状態図デモ
interface StateItem {
  id: string;
  label: string;
  description?: string;
}

interface StateDemoProps {
  states: StateItem[];
  transitions: { from: string; to: string; label: string }[];
  title?: string;
}

export function StateDemo({ states, transitions, title }: StateDemoProps) {
  const [activeState, setActiveState] = useState(states[0]?.id);

  const currentState = states.find(s => s.id === activeState);
  const availableTransitions = transitions.filter(t => t.from === activeState);

  return (
    <InteractiveDemo title={title || "状態遷移デモ"} description="状態をクリックして遷移を体験">
      <div className="space-y-4">
        {/* 現在の状態 */}
        <div className="text-center p-4 bg-blue-100 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">現在の状態</div>
          <div className="text-xl font-bold text-blue-800">{currentState?.label}</div>
          {currentState?.description && (
            <div className="text-sm text-blue-600 mt-1">{currentState.description}</div>
          )}
        </div>

        {/* 遷移ボタン */}
        {availableTransitions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {availableTransitions.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveState(t.to)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {t.label} →
              </button>
            ))}
          </div>
        )}

        {/* リセットボタン */}
        {activeState !== states[0]?.id && (
          <div className="text-center">
            <button
              onClick={() => setActiveState(states[0]?.id)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              最初に戻る
            </button>
          </div>
        )}
      </div>
    </InteractiveDemo>
  );
}
