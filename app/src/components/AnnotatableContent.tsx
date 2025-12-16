'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useAnnotations, Annotation } from '@/contexts/AnnotationContext';
import { AnnotationPopover } from './AnnotationPopover';
import { useProgress } from '@/contexts/ProgressContext';

interface AnnotatableContentProps {
  slug: string;
  children: ReactNode;
}

interface PopoverState {
  isOpen: boolean;
  position: { top: number; left: number } | null;
  mode: 'create' | 'view';
}

// Get text context around selection
function getSelectionContext(range: Range, contextLength: number = 50): { prefix: string; suffix: string } {
  const container = range.commonAncestorContainer;
  const textContent = container.textContent || '';

  // For text nodes
  if (container.nodeType === Node.TEXT_NODE) {
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const prefix = textContent.slice(Math.max(0, startOffset - contextLength), startOffset);
    const suffix = textContent.slice(endOffset, Math.min(textContent.length, endOffset + contextLength));
    return { prefix, suffix };
  }

  // For element nodes, try to get surrounding text
  return { prefix: '', suffix: '' };
}

// Find and highlight text matching an annotation
function highlightAnnotation(
  container: HTMLElement,
  annotation: Annotation,
  onClick: (annotation: Annotation, rect: DOMRect) => void
): HTMLElement[] {
  const highlights: HTMLElement[] = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent || '';
    const index = text.indexOf(annotation.selectedText);

    if (index !== -1) {
      // Verify context if available
      const beforeText = text.slice(Math.max(0, index - 50), index);
      const afterText = text.slice(index + annotation.selectedText.length, index + annotation.selectedText.length + 50);

      // Check if context matches (fuzzy match)
      const prefixMatch = !annotation.prefix || beforeText.includes(annotation.prefix.slice(-20));
      const suffixMatch = !annotation.suffix || afterText.includes(annotation.suffix.slice(0, 20));

      if (prefixMatch && suffixMatch) {
        // Create highlight
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + annotation.selectedText.length);

        const highlight = document.createElement('mark');
        highlight.className = `annotation-highlight annotation-${annotation.color} cursor-pointer`;
        highlight.dataset.annotationId = annotation.id;
        highlight.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = highlight.getBoundingClientRect();
          onClick(annotation, rect);
        });

        try {
          range.surroundContents(highlight);
          highlights.push(highlight);
        } catch {
          // Range may cross element boundaries, skip this annotation
        }
        break; // Only highlight first occurrence
      }
    }
  }

  return highlights;
}

// Remove all highlights from container
function clearHighlights(container: HTMLElement) {
  const highlights = container.querySelectorAll('.annotation-highlight');
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (parent) {
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    }
  });
}

export function AnnotatableContent({ slug, children }: AnnotatableContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useProgress();
  const {
    annotations,
    fetchAnnotations,
    setCurrentSelection,
    setActiveAnnotation,
    currentSelection,
  } = useAnnotations();

  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    position: null,
    mode: 'create',
  });

  // Fetch annotations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnotations(slug);
    }
  }, [slug, isAuthenticated, fetchAnnotations]);

  // Apply highlights when annotations change
  useEffect(() => {
    if (!contentRef.current || !isAuthenticated) return;

    // Clear existing highlights
    clearHighlights(contentRef.current);

    // Apply new highlights
    annotations.forEach((annotation) => {
      if (contentRef.current) {
        highlightAnnotation(contentRef.current, annotation, (ann, rect) => {
          setActiveAnnotation(ann);
          // 親要素からの相対位置を計算
          const containerRect = contentRef.current!.getBoundingClientRect();
          setPopover({
            isOpen: true,
            position: {
              top: rect.bottom - containerRect.top + 8,
              left: rect.left + rect.width / 2 - containerRect.left,
            },
            mode: 'view',
          });
        });
      }
    });
  }, [annotations, isAuthenticated, setActiveAnnotation]);

  // Handle text selection
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      if (!isAuthenticated) {
        console.log('[Annotation] Not authenticated');
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        console.log('[Annotation] No valid selection');
        return;
      }

      // Check if selection is within our content (check both anchor and focus nodes)
      const anchorInContent = contentRef.current?.contains(selection.anchorNode);
      const focusInContent = contentRef.current?.contains(selection.focusNode);

      if (!anchorInContent && !focusInContent) {
        console.log('[Annotation] Selection not in content area');
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length < 3) {
        console.log('[Annotation] Selection too short:', selectedText.length);
        return;
      }

      console.log('[Annotation] Valid selection:', selectedText.substring(0, 50));

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const context = getSelectionContext(range);

      setCurrentSelection({
        text: selectedText,
        prefix: context.prefix,
        suffix: context.suffix,
        range: range.cloneRange(),
      });

      // 親要素からの相対位置を計算
      const containerRect = contentRef.current!.getBoundingClientRect();
      setPopover({
        isOpen: true,
        position: {
          top: rect.bottom - containerRect.top + 8,
          left: rect.left + rect.width / 2 - containerRect.left,
        },
        mode: 'create',
      });
    }, 10);
  }, [isAuthenticated, setCurrentSelection]);

  const handleClosePopover = useCallback(() => {
    setPopover({ isOpen: false, position: null, mode: 'create' });
    setCurrentSelection(null);
    setActiveAnnotation(null);
  }, [setCurrentSelection, setActiveAnnotation]);

  return (
    <div
      ref={contentRef}
      onMouseUp={handleMouseUp}
      className="annotatable-content relative"
    >
      {children}

      {popover.isOpen && (
        <AnnotationPopover
          slug={slug}
          position={popover.position}
          mode={popover.mode}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}
