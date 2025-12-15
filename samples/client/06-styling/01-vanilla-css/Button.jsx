/**
 * 素のCSS でボタンを実装
 */

import './button.css';

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}) {
  // クラス名を組み立てる
  const className = [
    'button',
    `button-${variant}`,
    size !== 'md' && `button-${size}`,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={className}
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
 * 問題点:
 * - クラス名が衝突する可能性
 * - ファイルを行き来する必要がある
 * - 動的なスタイルが書きにくい
 */

export { Button, Example };
