'use client';

import React, { useState } from 'react';
import { MessageSquare, PhoneCall, CheckCircle, AlertCircle } from 'lucide-react';
import { ServiceItem, SiteSettings } from '@/lib/store';

export function ContactSection({ 
  services = [], 
  settings 
}: { 
  services: ServiceItem[]; 
  settings: SiteSettings;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: services[0]?.title || 'General Enquiry',
    message: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending enquiry...' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: 'Enquiry received! Our team will contact you shortly.' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: services[0]?.title || 'General Enquiry',
          message: ''
        });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to submit. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try WhatsApp support directly.' });
    }
  };

  return (
    <section id="contact" className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-neutral-950 mt-1">
              Connect Directly with the Academy
            </h2>
            <p className="mt-3 text-neutral-600 text-base leading-relaxed">
              Have questions about beginner classes, mentorship, or our trading tools? Reach out via WhatsApp, phone, or the enquiry form.
            </p>

            <div className="mt-8 space-y-4">
              <a 
                href={settings.whatsapp_general_url || 'https://wa.me/message/WELLF6ZJDKQXA1'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-500 uppercase">
                    WhatsApp Help Desk
                  </span>
                  <span className="block text-base font-bold text-neutral-900">
                    {settings.whatsapp_phone || '+233 502 75 8608'}
                  </span>
                </div>
              </a>

              <a 
                href={`tel:${(settings.call_phone || '+233594862521').replace(/\s+/g, '')}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 hover:border-neutral-300 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-neutral-500 uppercase">
                    Direct Telephone Call
                  </span>
                  <span className="block text-base font-bold text-neutral-900">
                    {settings.call_phone || '+233 594 86 2521'}
                  </span>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-neutral-50/70 p-8 rounded-3xl border border-neutral-200 shadow-card">
            <h3 className="font-heading font-bold text-xl text-neutral-950 mb-4">
              Send an Enquiry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Your Full Name
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Phone / WhatsApp
                </label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Service of Interest
                </label>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                  <option value="Beginner Class">Beginner Forex Trading Class</option>
                  <option value="General Enquiry">General Enquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Message
                </label>
                <textarea 
                  rows={3} 
                  required 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-medium text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <button 
                type="submit" 
                disabled={status.type === 'loading'}
                className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {status.type === 'loading' ? 'Submitting...' : 'Submit Enquiry'}
              </button>

              {status.type === 'success' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}
              {status.type === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
