'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAnnotations } from '@/contexts/AnnotationContext';

interface Position {
  top: number;
  left: number;
}

const POPOVER_WIDTH = 320; // w-80 = 20rem = 320px

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', hover: 'hover:bg-yellow-300' },
  { name: 'green', bg: 'bg-green-200', hover: 'hover:bg-green-300' },
  { name: 'blue', bg: 'bg-blue-200', hover: 'hover:bg-blue-300' },
  { name: 'pink', bg: 'bg-pink-200', hover: 'hover:bg-pink-300' },
  { name: 'purple', bg: 'bg-purple-200', hover: 'hover:bg-purple-300' },
];

interface AnnotationPopoverProps {
  slug: string;
  position: Position | null;
  mode: 'create' | 'view';
  onClose: (keepHighlight?: boolean) => void;
  onColorChange?: (color: string) => void;
}

export function AnnotationPopover({ slug, position, mode, onClose, onColorChange }: AnnotationPopoverProps) {
  const {
    currentSelection,
    activeAnnotation,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearSelection,
    setActiveAnnotation,
  } = useAnnotations();

  const [comment, setComment] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');

  // 色変更時にコールバックを呼び出す
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === 'view' && activeAnnotation) {
      setComment(activeAnnotation.comment);
      setSelectedColor(activeAnnotation.color);
      setIsEditing(false);
    } else if (mode === 'create') {
      setComment('');
      setSelectedColor('yellow');
      setIsEditing(false);
    }
  }, [mode, activeAnnotation]);

  useEffect(() => {
    if (mode === 'create' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 画面端からはみ出さないように位置を調整
  const getAdjustedPosition = useCallback(() => {
    if (!position || !popoverRef.current) return { top: position?.top ?? 0, left: position?.left ?? 0 };

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedLeft = position.left;
    let adjustedTop = position.top;

    // 左端からはみ出す場合
    const leftEdge = popoverRect.left;
    if (leftEdge < 8) {
      adjustedLeft = position.left + (8 - leftEdge);
    }

    // 右端からはみ出す場合
    const rightEdge = popoverRect.right;
    if (rightEdge > viewportWidth - 8) {
      adjustedLeft = position.left - (rightEdge - viewportWidth + 8);
    }

    // 下端からはみ出す場合（上に表示）
    const bottomEdge = popoverRect.bottom;
    if (bottomEdge > viewportHeight - 8) {
      // popoverの高さ分 + 選択テキストの高さ分上にずらす
      adjustedTop = position.top - popoverRect.height - 40;
    }

    return { top: adjustedTop, left: adjustedLeft };
  }, [position]);

  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (position && popoverRef.current) {
      // 初回レンダリング後に位置を調整
      requestAnimationFrame(() => {
        setAdjustedPosition(getAdjustedPosition());
      });
    }
  }, [position, getAdjustedPosition]);

  if (!position) return null;

  const handleCreate = async () => {
    if (!currentSelection || !comment.trim()) return;

    setIsSubmitting(true);
    const result = await addAnnotation({
      slug,
      selectedText: currentSelection.text,
      prefix: currentSelection.prefix,
      suffix: currentSelection.suffix,
      comment: comment.trim(),
      color: selectedColor,
    });

    setIsSubmitting(false);
    if (result) {
      clearSelection();
      // 保存成功時はハイライトを維持（useEffectで永続化される）
      onClose(true);
    }
  };

  const handleUpdate = async () => {
    if (!activeAnnotation || !comment.trim()) return;

    setIsSubmitting(true);
    const success = await updateAnnotation(activeAnnotation.id, {
      comment: comment.trim(),
      color: selectedColor,
    });

    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!activeAnnotation) return;

    if (confirm('このメモを削除しますか？')) {
      setIsSubmitting(true);
      await deleteAnnotation(activeAnnotation.id);
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleClose = () => {
    clearSelection();
    setActiveAnnotation(null);
    onClose(false);
  };

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80"
      style={{
        top: adjustedPosition?.top ?? position.top,
        left: adjustedPosition?.left ?? position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {mode === 'create' ? 'メモを追加' : isEditing ? 'メモを編集' : 'メモ'}
        </span>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Comment input/display */}
      <div className="p-3">
        {mode === 'create' || isEditing ? (
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="メモを入力..."
            className="w-full h-24 p-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{activeAnnotation?.comment}</p>
        )}

        {/* Color picker */}
        {(mode === 'create' || isEditing) && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">色:</span>
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={`w-6 h-6 rounded-full ${color.bg} ${color.hover} ${
                  selectedColor === color.name ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                }`}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-3">
          {mode === 'create' ? (
            <>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!comment.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
            </>
          ) : isEditing ? (
            <>
              <button
                onClick={() => {
                  setComment(activeAnnotation?.comment || '');
                  setSelectedColor(activeAnnotation?.color || 'yellow');
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdate}
                disabled={!comment.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '更新中...' : '更新'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800"
              >
                削除
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                編集
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
