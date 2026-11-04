'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroParallaxProps {
  portraitSrc?: string;
}

export function HeroParallax({ portraitSrc = '/kira_forex_portrait_transparent.png' }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({
    tv: { x: 0, y: 0 },
    deriv: { x: 0, y: 0 },
    mt5: { x: 0, y: 0 },
  });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current || e.pointerType === 'touch') return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2); // Normalized -1 to 1
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Apply different movement factors to create multi-plane depth
    setOffsets({
      tv: { x: deltaX * 18, y: deltaY * 18 },      // Top-right: moves with cursor
      deriv: { x: -deltaX * 15, y: -deltaY * 15 },  // Bottom-left: moves opposite for depth
      mt5: { x: deltaX * 12, y: -deltaY * 12 },     // Bottom-right: diagonal parallax
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setOffsets({
      tv: { x: 0, y: 0 },
      deriv: { x: 0, y: 0 },
      mt5: { x: 0, y: 0 },
    });
  };

  return (
    <div 
      ref={containerRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full max-w-[520px] aspect-square mx-auto flex items-center justify-center select-none"
    >
      {/* Subtle Luminous Radial Backdrop Accent */}
      <div 
        className="absolute inset-4 rounded-full bg-gradient-to-tr from-forest-100/70 via-emerald-50/50 to-white -z-10 blur-2xl transform transition-transform duration-700"
        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
      />
      
      {/* Decorative Halo Ring */}
      <div className="absolute inset-8 rounded-full border border-forest-200/60 -z-10" />

      {/* Dominant Founder Portrait */}
      <div 
        style={{ position: 'relative' }} 
        className="relative w-[90%] h-[90%] flex items-end justify-center"
      >
        <Image
          src={portraitSrc}
          alt="Kira — Founder of Kiraforex Trading Academy & Africa's Female Forex Traders"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(7,43,25,0.18)]"
        />
      </div>

      {/* Floating Badge 1: TradingView (Top Right) */}
      <div 
        className="absolute -top-2 right-4 sm:right-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate3d(${offsets.tv.x}px, ${offsets.tv.y}px, 0)`,
        }}
      >
        <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-neutral-900 p-1 flex items-center justify-center">
          <Image src="/logos/tradingview.webp" alt="TradingView" width={28} height={28} />
        </div>
        <div className="text-left">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-forest-700">Official Charts</span>
          <span className="block text-xs font-bold text-neutral-900">TradingView</span>
        </div>
      </div>

      {/* Floating Badge 2: Deriv (Bottom Left) */}
      <div 
        className="absolute bottom-6 -left-2 sm:left-2 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate3d(${offsets.deriv.x}px, ${offsets.deriv.y}px, 0)`,
        }}
      >
        <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-white p-0.5 border border-neutral-200 flex items-center justify-center">
          <Image src="/logos/deriv.webp" alt="Deriv Partner" width={28} height={28} />
        </div>
        <div className="text-left">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-red-600">Broker Partner</span>
          <span className="block text-xs font-bold text-neutral-900">Deriv Synthetics</span>
        </div>
      </div>

      {/* Floating Badge 3: MetaTrader 5 (Bottom Right) */}
      <div 
        className="absolute -bottom-2 right-2 sm:right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate3d(${offsets.mt5.x}px, ${offsets.mt5.y}px, 0)`,
        }}
      >
        <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-white p-0.5 border border-neutral-200 flex items-center justify-center">
          <Image src="/logos/metatrader5.webp" alt="MetaTrader 5" width={32} height={32} />
        </div>
        <div className="text-left">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-700">Platform</span>
          <span className="block text-xs font-bold text-neutral-900">MetaTrader 5</span>
        </div>
      </div>
    </div>
  );
}
