import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Youtube, Facebook, Instagram, Phone, MessageSquare, AlertCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-sage-50 border-t border-neutral-200/90 text-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                style={{ position: 'relative' }} 
                className="relative w-11 h-11 rounded-full overflow-hidden border border-neutral-200 bg-white p-0.5"
              >
                <Image 
                  src="/kira_academy_logo.jpg" 
                  alt="Kiraforex Trading Academy" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div>
                <span className="block font-heading font-extrabold text-lg text-forest-950">
                  KIRAFOREX
                </span>
                <span className="block text-[11px] font-semibold text-forest-700 uppercase tracking-wider">
                  Trading Academy & Tools
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed max-w-sm">
              Led by Kira, CEO of Kiraforex Trading Academy and Founder of Africa's Female Forex Traders. Dedicated to actionable market structure education, algorithmic synthetic trading, and strict risk discipline.
            </p>

            {/* Social Channels */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://t.me/kira_forex"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-forest-800 hover:bg-forest-800 hover:text-white transition shadow-sm"
                aria-label="Telegram General Community"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"
                aria-label="YouTube Channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/message/WELLF6ZJDKQXA1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm"
                aria-label="WhatsApp Contact"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/kira_forex?exln=aWF0dzNodmpwcTc5"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition shadow-sm"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61585879264537"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                aria-label="Facebook Profile"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav Links: Academy */}
          <div>
            <h4 className="font-heading font-bold text-sm text-forest-950 uppercase tracking-wider mb-4">
              Academy & Learning
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/services" className="hover:text-forest-800 transition">Bootcamp Foundations</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-forest-800 transition">Deriv Synthetics Mastery</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-forest-800 transition">1-on-1 VIP Mentorship</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-forest-800 transition">Live Interactive Events</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-forest-800 transition">Africa's Female Forex Traders</Link>
              </li>
            </ul>
          </div>

          {/* Nav Links: Community & Tools */}
          <div>
            <h4 className="font-heading font-bold text-sm text-forest-950 uppercase tracking-wider mb-4">
              Community & Tools
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <a href="https://t.me/kira_forex" target="_blank" rel="noopener noreferrer" className="hover:text-forest-800 transition">
                  General Telegram Community
                </a>
              </li>
              <li>
                <a href="https://t.me/kiraforexsynth" target="_blank" rel="noopener noreferrer" className="hover:text-forest-800 transition">
                  Synthetics Telegram Hub
                </a>
              </li>
              <li>
                <a href="https://t.deriv.link/?t=642J9K6PYXX5" target="_blank" rel="noopener noreferrer" className="hover:text-forest-800 transition">
                  Official Deriv Partner Link
                </a>
              </li>
              <li>
                <Link href="/tools" className="hover:text-forest-800 transition">Risk & Position Size Tool</Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-forest-800 transition">Trader's Journal & Metrics</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Verification */}
          <div>
            <h4 className="font-heading font-bold text-sm text-forest-950 uppercase tracking-wider mb-4">
              Official Desk
            </h4>
            <div className="space-y-3 text-sm">
              <a 
                href="https://wa.me/233502758608" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-neutral-600 hover:text-emerald-700"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>+233 502 75 8608 (WhatsApp)</span>
              </a>
              <a 
                href="tel:+233594862521" 
                className="flex items-center gap-2 text-neutral-600 hover:text-forest-800"
              >
                <Phone className="w-4 h-4 text-forest-700" />
                <span>+233 594 86 2521 (Direct Call)</span>
              </a>
              <div className="pt-2">
                <span className="text-xs text-neutral-500 block">Accra / Ghana Desk (GMT)</span>
                <span className="text-xs text-neutral-500 block">Mon - Fri: 08:00 - 18:00</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mandatory Financial Risk Disclosure */}
        <div className="mt-14 pt-8 border-t border-neutral-200">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Financial & Trading Risk Disclosure:</strong> Foreign exchange (Forex) and synthetic derivative trading carry a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange, you should carefully consider your investment objectives, level of experience, and risk appetite. Past performance is no guarantee of future results. KIRAFOREX TRADING ACADEMY is an educational platform and does not provide financial advice or guarantee trading returns.
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
            <p>© {new Date().getFullYear()} KIRAFOREX TRADING ACADEMY. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-forest-800 transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-forest-800 transition">Terms of Use</Link>
              <Link href="/risk-disclosure" className="hover:text-forest-800 transition">Risk Disclosure</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
