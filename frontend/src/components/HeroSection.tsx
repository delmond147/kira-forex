'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { SiteSettings } from '@/lib/store';

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({
    tv: { x: 0, y: 0 },
    deriv: { x: 0, y: 0 },
    mt5: { x: 0, y: 0 },
  });
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.pointerType === 'touch') return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    setOffsets({
      tv: { x: deltaX * 18, y: deltaY * 18 },
      deriv: { x: -deltaX * 15, y: -deltaY * 15 },
      mt5: { x: deltaX * 12, y: -deltaY * 12 },
    });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setOffsets({ tv: { x: 0, y: 0 }, deriv: { x: 0, y: 0 }, mt5: { x: 0, y: 0 } });
  };

  return (
    <section id="hero" className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-neutral-950 tracking-tight leading-[1.1]">
              {settings.hero_headline || 'Master the Financial Markets with Precision & Discipline'}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 max-w-xl font-normal leading-relaxed">
              {settings.hero_subheadline || 'Institutional trading education, proven risk management tools, and an empowering community built for serious traders.'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a 
                href={settings.primary_telegram_url || 'https://t.me/kira_forex'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-base shadow-elevated transition active:scale-[0.98]"
              >
                <span>{settings.hero_btn1_text || 'Join the Telegram Community'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </a>

              <a 
                href={settings.hero_btn2_url || settings.deriv_partner_url || 'https://track.deriv.com/_eBEGHBqxmKyDrNOKR4fSNGNd7ZgqdRLk/1/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-red-50 text-neutral-900 font-bold text-base border border-neutral-300 hover:border-red-300 shadow-sm transition active:scale-[0.98]"
              >
                <div style={{ position: 'relative' }} className="relative w-5 h-5">
                  <Image src="/logos/deriv.webp" alt="Deriv" fill className="object-contain" />
                </div>
                <span>{settings.hero_btn2_text || 'Open a Deriv Account'}</span>
              </a>
            </div>

            <div className="pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="block text-2xl font-heading font-extrabold text-neutral-900">
                  {settings.hero_stat1_val || '100%'}
                </span>
                <span className="block text-xs font-semibold text-neutral-500">
                  {settings.hero_stat1_lbl || 'Pure Price Action'}
                </span>
              </div>
              <div>
                <span className="block text-2xl font-heading font-extrabold text-neutral-900">
                  {settings.hero_stat2_val || '24/7'}
                </span>
                <span className="block text-xs font-semibold text-neutral-500">
                  {settings.hero_stat2_lbl || 'Deriv Synthetics'}
                </span>
              </div>
              <div>
                <span className="block text-2xl font-heading font-extrabold text-neutral-900">
                  {settings.hero_stat3_val || 'Zero'}
                </span>
                <span className="block text-xs font-semibold text-neutral-500">
                  {settings.hero_stat3_lbl || 'Guaranteed Hype'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Parallax Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div 
              ref={containerRef}
              onPointerEnter={() => setIsHovered(true)}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className="relative w-full max-w-[480px] aspect-square flex items-center justify-center select-none cursor-default"
            >
              {/* Subtle Luminous Radial Backdrop */}
              <div 
                className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-100/60 via-emerald-50/40 to-white -z-10 blur-2xl transform transition-transform duration-700"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
              />
              
              {/* Decorative Halo Ring */}
              <div className="absolute inset-8 rounded-full border border-emerald-300/40 -z-10" />

              {/* Dominant Founder Portrait */}
              <div 
                style={{ position: 'relative' }} 
                className="relative w-[92%] h-[92%] flex items-end justify-center"
              >
                <Image
                  src={settings.hero_image_url || '/kira_forex_portrait_transparent.png'}
                  alt="Kira — Founder and CEO of Kiraforex Trading Academy"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(7,43,25,0.18)]"
                />
              </div>

              {/* Floating Badge 1: TradingView */}
              <div 
                style={{ transform: `translate3d(${offsets.tv.x}px, ${offsets.tv.y}px, 0)` }}
                className="absolute -top-1 right-2 sm:right-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-out will-change-transform"
              >
                <div style={{ position: 'relative' }} className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-900 p-1 flex items-center justify-center">
                  <Image src="/logos/tradingview.webp" alt="TradingView" width={32} height={32} />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-800">Official Charts</span>
                  <span className="block text-xs font-bold text-neutral-900">TradingView</span>
                </div>
              </div>

              {/* Floating Badge 2: Deriv */}
              <div 
                style={{ transform: `translate3d(${offsets.deriv.x}px, ${offsets.deriv.y}px, 0)` }}
                className="absolute bottom-4 -left-2 sm:left-2 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-out will-change-transform"
              >
                <div style={{ position: 'relative' }} className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-neutral-200 flex items-center justify-center">
                  <Image src="/logos/deriv.webp" alt="Deriv" width={32} height={32} />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-red-600">Broker Partner</span>
                  <span className="block text-xs font-bold text-neutral-900">Deriv Synthetics</span>
                </div>
              </div>

              {/* Floating Badge 3: MetaTrader 5 */}
              <div 
                style={{ transform: `translate3d(${offsets.mt5.x}px, ${offsets.mt5.y}px, 0)` }}
                className="absolute -bottom-1 right-2 sm:right-4 z-20 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 border border-neutral-200/90 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-out will-change-transform"
              >
                <div style={{ position: 'relative' }} className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-neutral-200 flex items-center justify-center">
                  <Image src="/logos/metatrader5.webp" alt="MetaTrader 5" width={32} height={32} />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-800">Platform</span>
                  <span className="block text-xs font-bold text-neutral-900">MetaTrader 5</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
