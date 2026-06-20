import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  onMediaView?: (item: MediaItem) => void;
  aspectRatio?: 'square' | 'portrait' | 'auto';
}

export const MediaCarousel = ({ media, onMediaView, aspectRatio = 'auto' }: MediaCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const total = media.length;

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(c => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(c => (c + 1) % total);
  }, [total]);

  const goTo = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent(i);
  }, []);

  // Swipe táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Só activa swipe horizontal se o movimento for mais horizontal do que vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) setCurrent(c => (c + 1) % total);
      else setCurrent(c => (c - 1 + total) % total);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!media || total === 0) return null;

  // Uma única imagem — sem carrossel
  if (total === 1) {
    const item = media[0];
    return (
      <div className="relative rounded-xl overflow-hidden bg-black/5">
        {item.type === 'video' ? (
          <video
            src={item.url}
            className="w-full max-h-[500px] object-contain"
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <button
            onClick={() => onMediaView?.(item)}
            className="w-full block"
          >
            <img
              src={item.url}
              alt="Post image"
              className="w-full max-h-[500px] object-cover"
            />
          </button>
        )}
        {onMediaView && item.type === 'image' && (
          <button
            onClick={e => { e.stopPropagation(); onMediaView(item); }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    );
  }

  // Grid de 2 imagens lado a lado (sem carrossel)
  if (total === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
        {media.map((item, i) => (
          <button
            key={i}
            onClick={() => onMediaView?.(item)}
            className="block aspect-square overflow-hidden bg-black/5"
          >
            <img
              src={item.url}
              alt={`Image ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </button>
        ))}
      </div>
    );
  }

  // Grid de 3 imagens
  if (total === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
        <button
          onClick={() => onMediaView?.(media[0])}
          className="block row-span-2 overflow-hidden bg-black/5"
          style={{ aspectRatio: '1/2' }}
        >
          <img
            src={media[0].url}
            alt="Image 1"
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        </button>
        {media.slice(1).map((item, i) => (
          <button
            key={i}
            onClick={() => onMediaView?.(item)}
            className="block aspect-square overflow-hidden bg-black/5"
          >
            <img
              src={item.url}
              alt={`Image ${i + 2}`}
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </button>
        ))}
      </div>
    );
  }

  // 4+ imagens — carrossel com swipe
  const item = media[current];

  return (
    <div className="relative rounded-xl overflow-hidden select-none">
      {/* Imagem/vídeo actual */}
      <div
        className="relative bg-black/5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {item.type === 'video' ? (
          <video
            src={item.url}
            className="w-full aspect-square object-cover"
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <button
            onClick={() => onMediaView?.(item)}
            className="w-full block"
          >
            <img
              src={item.url}
              alt={`Image ${current + 1} of ${total}`}
              className="w-full aspect-square object-cover"
            />
          </button>
        )}

        {/* Botões anterior/próximo */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Contador no canto */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          {current + 1}/{total}
        </div>

        {/* Expand */}
        {onMediaView && item.type === 'image' && (
          <button
            onClick={e => { e.stopPropagation(); onMediaView(item); }}
            className="absolute top-2 left-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Indicadores (dots) */}
      <div className="flex justify-center gap-1.5 py-2 bg-white">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={e => goTo(i, e)}
            className={`rounded-full transition-all ${
              i === current
                ? 'w-4 h-2 bg-green-600'
                : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
