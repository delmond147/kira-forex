'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Program {
  id: string;
  title: string;
  category: string;
  slug: string;
  short_description: string;
  price_amount: number;
  delivery_format: string;
  duration: string;
  features: string[];
  cta_text: string;
  status: string;
}

export default function ProgramsManagerPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Foundational Course');
  const [price, setPrice] = useState('150.00');
  const [shortDesc, setShortDesc] = useState('');
  const [duration, setDuration] = useState('6 Weeks');
  const [delivery, setDelivery] = useState('Live Online Masterclass & Video Vault');
  const [features, setFeatures] = useState('');
  const [ctaText, setCtaText] = useState('Enroll via WhatsApp');
  const [status, setStatus] = useState('published');

  useEffect(() => {
    fetch('/api/admin/services')
      .then(res => res.json())
      .then(data => setPrograms(data))
      .catch(err => console.error(err));
  }, []);

  const openNew = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Foundational Course');
    setPrice('150.00');
    setShortDesc('');
    setDuration('6 Weeks');
    setDelivery('Live Online Masterclass & Video Vault');
    setFeatures('Platform Mastery (MT5 & TradingView)\nRisk-to-Reward Protocols\nLive Weekly Q&A');
    setCtaText('Enroll via WhatsApp');
    setStatus('published');
    setModalOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category || 'Course');
    setPrice(String(p.price_amount));
    setShortDesc(p.short_description);
    setDuration(p.duration);
    setDelivery(p.delivery_format);
    setFeatures((p.features || []).join('\n'));
    setCtaText(p.cta_text || 'Enroll via WhatsApp');
    setStatus(p.status || 'published');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      category,
      price_amount: parseFloat(price) || 0,
      short_description: shortDesc,
      duration,
      delivery_format: delivery,
      features: features.split('\n').map(s => s.trim()).filter(Boolean),
      cta_text: ctaText,
      status,
    };

    const url = editingId ? `/api/admin/services/${editingId}` : '/api/admin/services';
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setModalOpen(false);
    // Refresh
    const res = await fetch('/api/admin/services');
    const data = await res.json();
    setPrograms(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this academy program?')) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    setPrograms(programs.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Course & Mentorship Catalog</span>
          <h1 className="text-3xl font-extrabold text-neutral-900 mt-1">Academy Programs Manager</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create, edit, and publish academy offerings directly to the public website.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition"
        >
          + Create New Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {p.category || 'Course'}
                </span>
                <span className="text-xl font-extrabold text-neutral-900">
                  ${Number(p.price_amount).toFixed(2)}
                </span>
              </div>

              <h3 className="font-bold text-lg text-neutral-900 mb-1">{p.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">{p.short_description}</p>

              <div className="mb-4 text-xs text-neutral-500 font-semibold space-y-1">
                <div>⏱️ Duration: <strong>{p.duration || 'Flexible'}</strong></div>
                <div>💻 Format: <strong>{p.delivery_format || 'Online'}</strong></div>
              </div>

              <ul className="text-xs text-neutral-700 space-y-1 mb-4">
                {(p.features || []).slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => openEdit(p)}
                className="text-xs font-bold text-forest-800 hover:underline"
              >
                ✏️ Edit Program
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <h3 className="font-bold text-2xl text-neutral-900">
                {editingId ? 'Edit Academy Program' : 'Create Academy Program'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border text-sm font-semibold bg-white"
                  >
                    <option value="Foundational Course">Foundational Course</option>
                    <option value="Synthetics Specialization">Synthetics Specialization</option>
                    <option value="Private Coaching">Private Coaching</option>
                    <option value="Advanced Masterclass">Advanced Masterclass</option>
                    <option value="Intensive Bootcamp">Intensive Bootcamp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={shortDesc}
                  onChange={e => setShortDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Delivery Format</label>
                  <input
                    type="text"
                    required
                    value={delivery}
                    onChange={e => setDelivery(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Curriculum Modules (1 per line)</label>
                <textarea
                  rows={4}
                  required
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border text-sm font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    required
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border text-sm font-semibold bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border text-sm font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-bold shadow-sm hover:bg-forest-900 transition"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
