/**
 * styled-components（CSS-in-JS）でボタンを実装
 */

import styled, { css } from 'styled-components';

// ベーススタイル
const baseStyles = css`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// サイズバリエーション
const sizeStyles = {
  sm: css`
    padding: 4px 8px;
    font-size: 12px;
  `,
  md: css``,
  lg: css`
    padding: 12px 24px;
    font-size: 16px;
  `,
};

// バリアントスタイル
const variantStyles = {
  primary: css`
    background-color: #3b82f6;
    color: white;
    &:hover:not(:disabled) {
      background-color: #2563eb;
    }
  `,
  secondary: css`
    background-color: #6b7280;
    color: white;
    &:hover:not(:disabled) {
      background-color: #4b5563;
    }
  `,
  outline: css`
    background-color: transparent;
    border: 1px solid #3b82f6;
    color: #3b82f6;
    &:hover:not(:disabled) {
      background-color: #eff6ff;
    }
  `,
};

// Styled Component
const StyledButton = styled.button`
  ${baseStyles}
  ${({ $variant }) => variantStyles[$variant || 'primary']}
  ${({ $size }) => sizeStyles[$size || 'md']}
`;

// React Component
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </StyledButton>
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
 * ✅ propsで動的にスタイル変更
 * ✅ ファイル1つで完結
 * ✅ 自動でスコープ分離
 *
 * 注意点:
 * - ランタイムコスト（実行時にCSS生成）
 * - Server Componentsでは使えない（Next.js App Router）
 * - バンドルサイズ増加
 */

export { Button, Example, StyledButton };
