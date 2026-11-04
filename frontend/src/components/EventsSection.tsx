import React from 'react';
import Image from 'next/image';
import { Calendar, Phone } from 'lucide-react';
import { EventItem, SiteSettings } from '@/lib/store';

export function EventsSection({ 
  events = [], 
  settings 
}: { 
  events: EventItem[]; 
  settings: SiteSettings;
}) {
  if (!events || events.length === 0) return null;

  return (
    <section id="events" className="py-14 bg-neutral-50/70 border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Upcoming Academy Events
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-neutral-950 mt-1">
              {settings.events_heading || 'Live Interactive Sessions & Workshops'}
            </h2>
            <p className="mt-2 text-neutral-600 text-base max-w-xl">
              Register for live training classes. Event flyers display in their full native proportions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((e) => (
            <div 
              key={e.id}
              className="bg-white rounded-2xl border border-neutral-200/90 shadow-card hover:shadow-elevated transition-all overflow-hidden flex flex-col group"
            >
              {/* NATIVE 818:1024 RATIO FULL PICTURE DISPLAY */}
              <div 
                style={{ position: 'relative' }} 
                className="relative w-full aspect-[818/1024] bg-neutral-900/5 overflow-hidden border-b border-neutral-100 flex items-center justify-center"
              >
                <Image 
                  src={e.thumbnail_url || '/events/beginner_class_event_flyer.jpg'} 
                  alt={e.title} 
                  fill
                  className="object-contain group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/90 text-white font-heading font-bold text-xs shadow-md">
                  {e.price_currency} {Number(e.price_amount).toFixed(2)}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-white/95 text-[11px] font-bold text-neutral-900 shadow-sm border border-neutral-200">
                  {e.venue_type}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {e.time_zone}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-neutral-950 group-hover:text-emerald-800 transition">
                    {e.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-3">
                    {e.short_description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2.5">
                  <a 
                    href={`https://wa.me/${(e.booking_whatsapp || '233502758608').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello KiraForex, I want to book my seat for ' + e.title)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-sm shadow-sm transition"
                  >
                    <span>Book via WhatsApp ({e.booking_whatsapp})</span>
                  </a>
                  <div className="flex items-center justify-between text-xs px-1 text-neutral-500">
                    <span>Direct Hotline:</span>
                    <a 
                      href={`tel:${(e.booking_call || '+233594862521').replace(/\s+/g, '')}`} 
                      className="font-bold text-neutral-900 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {e.booking_call}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
