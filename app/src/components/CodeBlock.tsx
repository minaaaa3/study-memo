'use client';

import { Sandpack } from '@codesandbox/sandpack-react';

// Sandpackで実行可能な言語
const SANDPACK_LANGUAGES = ['jsx', 'tsx', 'javascript', 'typescript', 'js', 'ts'];

interface CodeBlockProps {
  children: string | string[];
  className?: string;
}

// コードブロックから言語を抽出
function extractLanguage(className?: string): string {
  if (!className) return '';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : '';
}

// 言語がSandpackで実行可能かチェック
function isExecutable(language: string): boolean {
  return SANDPACK_LANGUAGES.includes(language.toLowerCase());
}

// コードがReactコンポーネントを含むかチェック
function isReactCode(code: string): boolean {
  return (
    code.includes('import React') ||
    code.includes('from "react"') ||
    code.includes("from 'react'") ||
    code.includes('useState') ||
    code.includes('useEffect') ||
    code.includes('<') ||
    code.includes('function ') && code.includes('return (')
  );
}

// コードが完全なコンポーネントかチェック
function isCompleteComponent(code: string): boolean {
  return (
    code.includes('export default') ||
    code.includes('export function') ||
    (code.includes('function ') && code.includes('return'))
  );
}

// Reactコード用のラッパーを追加
function wrapReactCode(code: string, language: string): string {
  // すでにexport defaultがある場合はそのまま
  if (code.includes('export default')) {
    return code;
  }

  // function ComponentName() の形式を検出
  const functionMatch = code.match(/function\s+([A-Z]\w*)\s*\(/);
  if (functionMatch) {
    const componentName = functionMatch[1];
    return `${code}\n\nexport default ${componentName};`;
  }

  // JSXを含むがexportがない場合はラップ
  if (code.includes('<') && code.includes('>')) {
    return `export default function App() {\n  return (\n    ${code.trim()}\n  );\n}`;
  }

  return code;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const language = extractLanguage(className);
  // childrenが配列の場合は結合、それ以外は文字列化
  const code = (Array.isArray(children) ? children.join('') : String(children || '')).trim();

  // シンプルなコードブロックを表示するヘルパー
  const renderSimpleCodeBlock = (lang: string) => (
    <div className="relative my-4">
      {lang && (
        <div
          className="absolute top-0 right-0 px-2 py-1 text-xs rounded-bl z-10"
          style={{ backgroundColor: '#e5e7eb', color: '#6b7280' }}
        >
          {lang}
        </div>
      )}
      <pre
        className="p-4 overflow-x-auto rounded-lg text-sm font-mono"
        style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}
      >
        <code style={{ color: '#f3f4f6' }}>{code}</code>
      </pre>
    </div>
  );

  // Sandpackで実行不可能な言語はシンプルなコードブロックを表示
  if (!isExecutable(language)) {
    return renderSimpleCodeBlock(language);
  }

  // 短いスニペットや説明的なコードはシンプル表示
  if (code.split('\n').length < 3 || code.includes('// ...')) {
    return renderSimpleCodeBlock(language);
  }

  // Reactコードの場合
  const isReact = isReactCode(code);

  if (isReact && isCompleteComponent(code)) {
    const wrappedCode = wrapReactCode(code, language);

    return (
      <div className="my-4">
        <Sandpack
          template="react"
          theme="dark"
          files={{
            '/App.js': wrappedCode,
          }}
          options={{
            showNavigator: false,
            showTabs: false,
            showLineNumbers: true,
            editorHeight: 300,
          }}
        />
      </div>
    );
  }

  // 純粋なJavaScript/TypeScript
  if (!isReact) {
    return (
      <div className="my-4">
        <Sandpack
          template="vanilla"
          theme="dark"
          files={{
            '/index.js': code,
          }}
          options={{
            showNavigator: false,
            showTabs: false,
            showLineNumbers: true,
            editorHeight: 300,
            showConsole: true,
            showConsoleButton: true,
          }}
        />
      </div>
    );
  }

  // デフォルト: シンプルなコードブロック
  return renderSimpleCodeBlock(language);
}
