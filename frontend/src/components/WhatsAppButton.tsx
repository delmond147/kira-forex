'use client';

import React from 'react';

interface WhatsAppButtonProps {
  phone?: string;
  url?: string;
}

export function WhatsAppButton({ 
  phone = '+233 502 75 8608', 
  url = 'https://wa.me/message/WELLF6ZJDKQXA1' 
}: WhatsAppButtonProps) {
  const targetUrl = url || (phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}` : 'https://wa.me/message/WELLF6ZJDKQXA1');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip Bubble */}
      <div className="mr-3 px-3.5 py-1.5 rounded-full bg-neutral-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0 hidden sm:block whitespace-nowrap">
        <span>Chat with Support on WhatsApp</span>
      </div>

      {/* Pulsing radar wave */}
      <div className="absolute right-0 w-14 h-14 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />

      {/* Floating Action Button */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact KIRAFOREX on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <svg 
          viewBox="0 0 32 32" 
          className="w-7 h-7 fill-current drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.01 2.01C8.28 2.01 2 8.29 2 16.02c0 2.65.73 5.14 2 7.28L2 30l6.91-1.96c2.06 1.18 4.45 1.86 7.1 1.86 7.73 0 14.01-6.28 14.01-14.01s-6.28-14.01-14.01-13.88zm0 25.6c-2.31 0-4.47-.64-6.32-1.76l-.45-.27-4.66 1.32 1.35-4.48-.3-.47c-1.28-1.98-1.96-4.29-1.96-6.72 0-6.6 5.37-11.97 11.98-11.97 6.61 0 11.98 5.37 11.98 11.97 0 6.61-5.37 12-11.98 12.02zm6.57-8.99c-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.95-1.79-2.12-2-2.48-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61l-.69-.01c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.88 6.15 5.44.86.37 1.53.59 2.05.76.86.27 1.64.23 2.26.14.69-.1 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42z"/>
        </svg>
      </a>
    </div>
  );
}
