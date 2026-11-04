import React from 'react';
import { SiteSettings } from '@/lib/store';

export function TelegramSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="py-14 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
          {settings.community_heading || 'Join the Official KIRAFOREX Community'}
        </h2>
        <p className="mt-3 text-neutral-300 text-base leading-relaxed">
          {settings.community_subheading || 'Connect with like-minded traders, receive live educational trade breakdowns, and stay updated on our upcoming academy workshops.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href={settings.primary_telegram_url || 'https://t.me/kira_forex'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-bold text-sm shadow-elevated transition"
          >
            {settings.community_btn1_text || 'Join General Telegram (Primary)'}
          </a>
          <a 
            href={settings.synthetics_telegram_url || 'https://t.me/kiraforexsynth'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-sm transition"
          >
            {settings.community_btn2_text || 'Join Synthetics Telegram'}
          </a>
        </div>

        <div className="mt-6 text-xs text-neutral-400">
          Transparent partner disclosure: Looking to trade synthetics 24/7?{' '}
          <a 
            href={settings.deriv_partner_url || 'https://t.deriv.link/?t=642J9K6PYXX5'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white underline font-semibold hover:text-neutral-200"
          >
            Create an official Deriv account via our link
          </a>.
        </div>
      </div>
    </section>
  );
}
