'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Send, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  primaryTelegramUrl?: string;
}

export function Header({ primaryTelegramUrl = 'https://t.me/kira_forex' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div 
              style={{ position: 'relative' }} 
              className="relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shadow-sm bg-white p-0.5 group-hover:border-forest-700 transition"
            >
              <Image 
                src="/kira_academy_logo.jpg" 
                alt="Kiraforex Trading Academy Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="block font-heading font-extrabold text-xl tracking-tight text-forest-900 group-hover:text-forest-700 transition">
                KIRAFOREX
              </span>
              <span className="block text-[11px] font-semibold tracking-wider text-forest-600 uppercase">
                Trading Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-700">
            <Link href="/" className="hover:text-forest-800 transition py-1 border-b-2 border-transparent hover:border-forest-700">
              Home
            </Link>
            <Link href="/about" className="hover:text-forest-800 transition py-1 border-b-2 border-transparent hover:border-forest-700">
              About
            </Link>
            <Link href="/services" className="hover:text-forest-800 transition py-1 border-b-2 border-transparent hover:border-forest-700">
              Academy & Services
            </Link>
            <Link href="/tools" className="hover:text-forest-800 transition py-1 border-b-2 border-transparent hover:border-forest-700">
              Trading Tools
            </Link>
            <Link href="/events" className="hover:text-forest-800 transition py-1 border-b-2 border-transparent hover:border-forest-700">
              Events
            </Link>
            <Link href="/contact" className="hover:text-forest-800 transition py-1 border-b-2 border-transparent hover:border-forest-700">
              Contact
            </Link>
          </nav>

          {/* Primary CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href={primaryTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Join Telegram Community</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 hover:text-forest-900 hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-forest-600"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-800 hover:bg-sage-100 hover:text-forest-800"
          >
            Home
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-800 hover:bg-sage-100 hover:text-forest-800"
          >
            About Kira
          </Link>
          <Link 
            href="/services" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-800 hover:bg-sage-100 hover:text-forest-800"
          >
            Academy Courses
          </Link>
          <Link 
            href="/tools" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-800 hover:bg-sage-100 hover:text-forest-800"
          >
            8 Trading Tools Hub
          </Link>
          <Link 
            href="/events" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-800 hover:bg-sage-100 hover:text-forest-800"
          >
            Upcoming Events
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-neutral-800 hover:bg-sage-100 hover:text-forest-800"
          >
            Contact
          </Link>

          <div className="pt-2">
            <a 
              href={primaryTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-forest-800 text-white font-semibold text-sm shadow-sm"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Join Telegram Community</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
