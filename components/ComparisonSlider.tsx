
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ComparisonSliderProps {
  before: string;
  after: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ before, after }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  }, []);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    updatePosition(clientX);
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e 
      ? (e as TouchEvent).touches[0].clientX 
      : (e as MouseEvent).clientX;
    updatePosition(clientX);
  }, [updatePosition]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    // Attach window listeners to ensure drag continues even if mouse leaves the container
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden cursor-ew-resize select-none border border-slate-800 shadow-2xl bg-slate-900 group"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      {/* Base Image (Original) - Static */}
      <img 
        src={before} 
        className="absolute inset-0 w-full h-full object-cover" 
        alt="Original" 
        draggable={false}
      />
      
      {/* Staged Image (Clipped) - Static within the clip area */}
      <img 
        src={after} 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        alt="Staged" 
        draggable={false}
      />

      {/* Vertical Divider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] z-10 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform duration-200 ring-4 ring-indigo-500/30">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l-3 3m0 0l3 3m-3-3h14m-3-3l3 3m0 0l-3 3" />
          </svg>
        </div>
      </div>

      {/* Persistent Labels */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] uppercase font-black tracking-[0.2em] text-white/80">
          Original Space
        </div>
      </div>
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
        <div className="bg-indigo-600/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] uppercase font-black tracking-[0.2em] text-white">
          Damon Staged
        </div>
      </div>
    </div>
  );
};
