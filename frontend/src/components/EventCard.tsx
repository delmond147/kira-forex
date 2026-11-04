'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Phone, MessageSquare, Clock, MapPin, Tag } from 'lucide-react';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description?: string;
  thumbnail_url: string;
  start_date: string;
  end_date?: string;
  expiry_date: string;
  time_zone: string;
  venue_type: string;
  location_or_link?: string;
  price_amount: number;
  price_currency: string;
  booking_whatsapp: string;
  booking_call: string;
  booking_url?: string;
  status: string;
}

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_date);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const whatsappHref = event.booking_whatsapp 
    ? `https://wa.me/${event.booking_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello KiraForex Academy, I would like to register for "${event.title}" ($${event.price_amount} ${event.price_currency}).`)}`
    : `https://wa.me/233502758608`;

  const phoneHref = `tel:${(event.booking_call || '+233594862521').replace(/\s+/g, '')}`;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* 
        MANDATORY UNIFORM DEFAULT ASPECT RATIO MATCHING FLYER (818:1024 / 4:5 Portrait)
        Displays the full event photo without cropping any top or bottom details.
      */}
      <div 
        style={{ position: 'relative' }} 
        className="relative w-full aspect-[818/1024] bg-neutral-900/5 overflow-hidden border-b border-neutral-100 flex items-center justify-center"
      >
        <Image
          src={event.thumbnail_url || '/events/beginner_class_event_flyer.jpg'}
          alt={event.title}
          fill
          priority
          className="object-contain w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Pricing Badge (USD 50.00) */}
        <div className="absolute top-3 right-3 px-3.5 py-1.5 rounded-full bg-forest-900/90 backdrop-blur-md border border-forest-700/50 text-white font-heading font-extrabold text-sm shadow-md flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>{event.price_currency} {Number(event.price_amount).toFixed(2)}</span>
        </div>

        {/* Venue Type Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-white/95 backdrop-blur-md text-xs font-bold text-forest-900 shadow-sm border border-neutral-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-forest-600" />
          <span>{event.venue_type}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time pill */}
          <div className="flex items-center gap-3 text-xs font-semibold text-neutral-500 mb-2.5">
            <span className="flex items-center gap-1 text-forest-700">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.time_zone}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="font-heading font-extrabold text-xl text-forest-950 group-hover:text-forest-700 transition">
            <Link href={`/events/${event.slug}`}>
              {event.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-3">
            {event.short_description}
          </p>
        </div>

        {/* Actions & Contacts */}
        <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2.5">
          {/* Primary WhatsApp Booking Button */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition active:scale-[0.99]"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Book via WhatsApp ({event.booking_whatsapp || '+233 502 75 8608'})</span>
          </a>

          {/* Secondary Call CTA */}
          <div className="flex items-center justify-between text-xs px-1 text-neutral-500">
            <span>For Enquiries & Phone Booking:</span>
            <a 
              href={phoneHref}
              className="font-bold text-forest-800 hover:text-emerald-600 flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              {event.booking_call || '+233 594 86 2521'}
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
