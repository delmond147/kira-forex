import React from 'react';
import { Check, Clock, Laptop } from 'lucide-react';
import { ServiceItem, SiteSettings } from '@/lib/store';

export function ServicesSection({ 
  services = [], 
  settings 
}: { 
  services: ServiceItem[]; 
  settings: SiteSettings;
}) {
  return (
    <section id="services" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Academy Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-neutral-950 mt-1">
            {settings.programs_heading || 'Structured Education Built for Mastery'}
          </h2>
          <p className="mt-2 text-neutral-600 text-base">
            From beginner bootcamps to private 1-on-1 VIP mentorship and 24/7 Deriv synthetics training.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <div 
              key={s.id} 
              className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-card hover:shadow-elevated hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800">
                    {s.category || s.duration || 'Comprehensive'}
                  </span>
                  <span className="text-2xl font-heading font-extrabold text-neutral-900">
                    ${Number(s.price_amount).toFixed(2)} <span className="text-xs text-neutral-500 font-normal">USD</span>
                  </span>
                </div>
                <h3 className="font-heading font-bold text-xl text-neutral-950 mb-2">
                  {s.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  {s.short_description}
                </p>
                
                <div className="mb-5 text-xs text-neutral-500 font-semibold flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <strong>{s.duration || 'Ongoing'}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5" />
                    <strong>{s.delivery_format || 'Online'}</strong>
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-neutral-700 font-medium mb-6">
                  {(s.features || []).map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <a 
                  href={`https://wa.me/233502758608?text=${encodeURIComponent(s.cta_whatsapp_message || 'Hi Kira, I want to enroll in ' + s.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm shadow-sm transition active:scale-[0.98]"
                >
                  <span>{s.cta_text || 'Enroll via WhatsApp'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
