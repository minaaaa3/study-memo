/**
 * Tailwind CSS でボタンを実装
 */

import clsx from 'clsx';

// バリアント別のクラス
const variantClasses = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  outline: 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50',
};

// サイズ別のクラス
const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className,
}) {
  return (
    <button
      className={clsx(
        // ベーススタイル
        'rounded font-medium transition-colors',
        // バリアント
        variantClasses[variant],
        // サイズ
        sizeClasses[size],
        // disabled
        disabled && 'opacity-50 cursor-not-allowed',
        // カスタムクラス
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 使用例
function Example() {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" disabled>Disabled</Button>

      {/* カスタムクラスを追加 */}
      <Button variant="primary" className="w-full">Full Width</Button>
    </div>
  );
}

/*
 * 利点:
 * ✅ CSSファイル不要
 * ✅ クラス名を見ればスタイルがわかる
 * ✅ ビルド時に未使用CSSを削除（小さいバンドル）
 * ✅ レスポンシブ対応が簡単（md:, lg: など）
 * ✅ Server Components対応
 *
 * 注意点:
 * - クラス名が長くなりがち
 * - 最初は覚えることが多い
 */

// cva (class-variance-authority) を使うとより整理できる
// npm install class-variance-authority

import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // ベーススタイル
  'rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600',
        outline: 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

function ButtonWithCVA({ variant, size, disabled, children, onClick, className }) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export { Button, ButtonWithCVA, Example, buttonVariants };
