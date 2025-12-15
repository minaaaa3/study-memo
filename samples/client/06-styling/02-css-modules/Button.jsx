/**
 * CSSモジュール でボタンを実装
 */

import styles from './Button.module.css';
import clsx from 'clsx'; // npm install clsx

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}) {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size !== 'md' && styles[size]
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
    <div>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  );
}

/*
 * 利点:
 * ✅ クラス名の衝突なし（自動でユニーク化）
 * ✅ CSSの書き方そのまま
 * ✅ 追加ライブラリ不要（Vite, Next.js標準対応）
 *
 * 注意点:
 * - ファイルを行き来する必要がある
 * - 動的なスタイルは別の方法が必要
 */

export { Button, Example };
