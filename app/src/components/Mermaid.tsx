'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

// Mermaidの初期化
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

// ズームレベルの設定
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_ZOOM_INDEX = 2; // 100%

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  // ドラッグ状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // 通常表示時のコンテナ幅を保持（モーダルで同じサイズにするため）
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // 前のズームレベルを保持（中央維持のため）
  const prevZoomRef = useRef(ZOOM_LEVELS[DEFAULT_ZOOM_INDEX]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // ユニークなIDを生成
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : '不明なエラー';
        setError(errorMessage);
      }
    };

    renderDiagram();
  }, [chart]);

  // モーダルを開く
  const openModal = useCallback(() => {
    // 通常表示時のコンテナ幅を取得
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    setIsModalOpen(true);
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    prevZoomRef.current = ZOOM_LEVELS[DEFAULT_ZOOM_INDEX];
  }, []);

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // ズームイン
  const zoomIn = useCallback(() => {
    setZoomIndex((prev) => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
  }, []);

  // ズームアウト
  const zoomOut = useCallback(() => {
    setZoomIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // 図をクリックしてズーム切り替え（100% ↔ 200%）
  const toggleZoom = useCallback(() => {
    // ドラッグ後はズーム切り替えしない
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    setZoomIndex((prev) => {
      if (prev <= DEFAULT_ZOOM_INDEX) {
        return 5; // 200%
      }
      return DEFAULT_ZOOM_INDEX; // 100%
    });
  }, [hasDragged]);

  // ドラッグ開始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    setHasDragged(false);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    });
  }, []);

  // ドラッグ中
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // 一定距離以上動いたらドラッグとみなす
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasDragged(true);
      }

      container.scrollLeft = dragStart.scrollLeft - deltaX;
      container.scrollTop = dragStart.scrollTop - deltaY;
    },
    [isDragging, dragStart]
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ズーム変更時に中央を維持
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isModalOpen) return;

    const prevZoom = prevZoomRef.current;
    const newZoom = ZOOM_LEVELS[zoomIndex];

    if (prevZoom !== newZoom) {
      // 現在の表示中央のコンテンツ座標を計算
      const centerX = (container.scrollLeft + container.clientWidth / 2) / prevZoom;
      const centerY = (container.scrollTop + container.clientHeight / 2) / prevZoom;

      // 新しいズームレベルでの同じ位置にスクロール
      const newScrollLeft = centerX * newZoom - container.clientWidth / 2;
      const newScrollTop = centerY * newZoom - container.clientHeight / 2;

      container.scrollLeft = Math.max(0, newScrollLeft);
      container.scrollTop = Math.max(0, newScrollTop);

      prevZoomRef.current = newZoom;
    }
  }, [zoomIndex, isModalOpen]);

  // キーボードイベント
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // スクロールを無効化
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen, closeModal, zoomIn, zoomOut]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <div className="font-semibold mb-2">図の描画に失敗しました</div>
        <div className="text-xs text-red-600 mb-2">{error}</div>
        <pre className="mt-2 text-xs overflow-x-auto bg-red-100 p-2 rounded">{chart}</pre>
      </div>
    );
  }

  const currentZoom = ZOOM_LEVELS[zoomIndex];

  return (
    <>
      {/* 通常表示 - SVGを横幅いっぱいに広げて中央配置 */}
      <div
        ref={containerRef}
        className="my-6 cursor-zoom-in group relative"
        onClick={openModal}
        title="クリックで拡大表示"
      >
        <div
          dangerouslySetInnerHTML={{ __html: svg }}
          className="transition-transform duration-200 group-hover:scale-[1.01] [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:mx-auto [&_svg]:block"
        />
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          クリックで拡大
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeModal}
        >
          {/* コントロールバー */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="縮小 (-)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm font-medium min-w-15 text-center">
              {Math.round(currentZoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="拡大 (+)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={closeModal}
              className="p-2 rounded hover:bg-gray-100"
              title="閉じる (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 図の表示エリア - スクロール可能なコンテナ */}
          <div
            ref={scrollContainerRef}
            className="max-w-[95vw] max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            {/* 白背景コンテナ - 通常表示と同じ幅で表示、CSS zoomで拡大縮小 */}
            <div
              className="bg-white rounded-lg p-6 inline-block"
              onClick={toggleZoom}
              style={{
                zoom: currentZoom,
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: svg }}
                style={{ width: containerWidth ?? 'auto' }}
                className="[&_svg]:w-full [&_svg]:h-auto [&_svg]:mx-auto [&_svg]:block"
              />
            </div>
          </div>

          {/* キーボードショートカットヘルプ */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded">+</kbd> / <kbd className="px-1.5 py-0.5 bg-white/20 rounded">-</kbd> ズーム
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded">Esc</kbd> 閉じる
            </span>
            <span>ドラッグで移動</span>
            <span>クリックで拡大/縮小</span>
          </div>
        </div>
      )}
    </>
  );
}
