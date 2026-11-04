import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { SiteSettings } from '@/lib/store';

export function AboutSection({ settings }: { settings: SiteSettings }) {
  return (
    <section id="about" className="py-14 bg-neutral-50/80 border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {settings.about_badge || 'Founder & Leader'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-neutral-950 mt-1">
              {settings.about_heading || 'Empowering the Next Generation of African Traders'}
            </h2>
            <p className="mt-4 text-neutral-700 text-base leading-relaxed">
              {settings.about_snippet || ''}
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  {settings.about_point1 || 'CEO of KIRAFOREX TRADING ACADEMY'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  {settings.about_point2 || "Founder of AFRICA'S FEMALE FOREX TRADERS"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  {settings.about_point3 || 'Certified Deriv Synthetics & Price Action Specialist'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-card">
            <h3 className="font-heading font-bold text-xl text-neutral-900 mb-3">
              {settings.philosophy_title || 'The Kiraforex Core Philosophy'}
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed italic">
              &ldquo;{settings.philosophy_quote || 'Trading is not a lottery or an overnight fortune. It is an intellectual discipline governed by asymmetric risk-to-reward ratios, deep understanding of liquidity pools, and unmatched emotional control.'}&rdquo;
            </p>
            <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center gap-4">
              <div 
                style={{ position: 'relative' }} 
                className="relative w-12 h-12 rounded-full overflow-hidden border border-emerald-300"
              >
                <Image 
                  src="/kira_forex_founder.jpg" 
                  alt="Kira" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div>
                <span className="block font-heading font-bold text-sm text-neutral-950">
                  {settings.philosophy_author || 'Kira'}
                </span>
                <span className="block text-xs text-neutral-500">
                  {settings.philosophy_author_title || 'Lead Mentor & Founder'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
