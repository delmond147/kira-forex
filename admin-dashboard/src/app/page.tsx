'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Youtube, 
  Users, 
  Palette, 
  ExternalLink, 
  Trash2, 
  Save, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  GraduationCap
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'events' | 'youtube' | 'leads' | 'customizer'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Store data
  const [settings, setSettings] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // Modals / New entries
  const [newProgram, setNewProgram] = useState({ title: '', category: 'Course', price_amount: 50, duration: '4 Weeks', short_description: '' });
  const [newEvent, setNewEvent] = useState({ title: '', price_amount: 50, venue_type: 'Online', thumbnail_url: '/events/beginner_class_event_flyer.jpg', short_description: '' });
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', thumbnailUrl: '/kira_forex_founder.jpg' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, srvRes, eRes, vRes, lRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/services'),
        fetch('/api/admin/events'),
        fetch('/api/admin/youtube'),
        fetch('/api/admin/leads')
      ]);

      if (sRes.ok) setSettings(await sRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      if (eRes.ok) setEvents(await eRes.json());
      if (vRes.ok) setVideos(await vRes.json());
      if (lRes.ok) setLeads(await lRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Settings & Customizer changes saved successfully!');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student lead?')) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        showToast('Lead deleted successfully');
      } else {
        showToast('Failed to delete lead', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting', 'error');
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgram)
      });
      if (res.ok) {
        const data = await res.json();
        setServices([...services, data.service]);
        setNewProgram({ title: '', category: 'Course', price_amount: 50, duration: '4 Weeks', short_description: '' });
        showToast('Program created successfully!');
      }
    } catch (err) {
      showToast('Failed to create program', 'error');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Delete this program?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
        showToast('Program deleted');
      }
    } catch (err) {
      showToast('Error deleting program', 'error');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        const data = await res.json();
        setEvents([...events, data.event]);
        setNewEvent({ title: '', price_amount: 50, venue_type: 'Online', thumbnail_url: '/events/beginner_class_event_flyer.jpg', short_description: '' });
        showToast('Event created successfully!');
      }
    } catch (err) {
      showToast('Failed to create event', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
        showToast('Event deleted');
      }
    } catch (err) {
      showToast('Error deleting event', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-600">Loading KIRAFOREX Executive CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row text-neutral-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
          notification.type === 'success' ? 'bg-emerald-950 text-emerald-100 border border-emerald-800' : 'bg-red-950 text-red-100 border border-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200/90 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
            <div style={{ position: 'relative' }} className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-200">
              <Image src="/kira_academy_logo.jpg" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <span className="block font-heading font-extrabold text-base tracking-tight text-neutral-950">KIRAFOREX</span>
              <span className="block text-[10px] font-bold tracking-wider text-emerald-800 uppercase">Executive CMS</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'overview' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'programs' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Academy Programs</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">{services.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'events' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Live Events</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">{events.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'youtube' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube Media</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'leads' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Leads CRM</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">{leads.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'customizer' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Full Customizer</span>
            </button>
          </nav>
        </div>

        {/* Live Preview Button */}
        <div className="p-4 border-t border-neutral-100">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            <span>Open Public Website</span>
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl overflow-y-auto">
        
        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-neutral-950">Executive Overview</h1>
              <p className="text-sm text-neutral-600 mt-1">Platform analytics, active enrollment demand, and real-time student activity.</p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Student Leads</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-heading font-extrabold text-neutral-950">{leads.length}</div>
                <span className="text-xs text-emerald-800 font-semibold mt-1 block">Live captured leads</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Active Programs</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-heading font-extrabold text-neutral-950">{services.length}</div>
                <span className="text-xs text-neutral-500 font-semibold mt-1 block">Foundations & Synthetics</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Scheduled Events</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-heading font-extrabold text-neutral-950">{events.length}</div>
                <span className="text-xs text-neutral-500 font-semibold mt-1 block">Live masterclasses</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Deriv Partner Link</span>
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-800">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg font-heading font-bold text-neutral-950 truncate">Active & Verified</div>
                <span className="text-xs text-neutral-500 font-semibold mt-1 block">24/7 Synthetics tracking</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
              <h2 className="text-lg font-heading font-bold text-neutral-950 mb-4">Quick Shortcuts</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setActiveTab('customizer')}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition"
                >
                  Edit Theme & Fonts
                </button>
                <button 
                  onClick={() => setActiveTab('leads')}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-bold hover:bg-neutral-100 transition"
                >
                  Review Student Leads ({leads.length})
                </button>
                <button 
                  onClick={() => setActiveTab('events')}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-bold hover:bg-neutral-100 transition"
                >
                  Manage Live Events
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMY PROGRAMS */}
        {activeTab === 'programs' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-neutral-950">Academy Programs & Courses</h1>
                <p className="text-sm text-neutral-600 mt-1">Manage structured courses, pricing, and curriculum delivery.</p>
              </div>
            </div>

            {/* Program List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((s) => (
                <div key={s.id} className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800">{s.category}</span>
                      <span className="text-xl font-heading font-extrabold text-neutral-900">${s.price_amount} USD</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-neutral-950">{s.title}</h3>
                    <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{s.short_description}</p>
                    <div className="mt-4 text-xs font-semibold text-neutral-500">Duration: {s.duration} • Format: {s.delivery_format}</div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                    <button 
                      onClick={() => handleDeleteProgram(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Program Form */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
              <h2 className="text-lg font-heading font-bold text-neutral-950 mb-4">Add New Program</h2>
              <form onSubmit={handleAddProgram} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Course Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newProgram.title} 
                    onChange={e => setNewProgram({ ...newProgram, title: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Category / Level</label>
                  <input 
                    type="text" 
                    value={newProgram.category} 
                    onChange={e => setNewProgram({ ...newProgram, category: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Price (USD)</label>
                  <input 
                    type="number" 
                    value={newProgram.price_amount} 
                    onChange={e => setNewProgram({ ...newProgram, price_amount: Number(e.target.value) })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Duration</label>
                  <input 
                    type="text" 
                    value={newProgram.duration} 
                    onChange={e => setNewProgram({ ...newProgram, duration: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Short Description</label>
                  <textarea 
                    rows={2} 
                    value={newProgram.short_description} 
                    onChange={e => setNewProgram({ ...newProgram, short_description: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition">
                    <Plus className="w-4 h-4" />
                    <span>Create Course</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-neutral-950">Live Events & Workshops</h1>
              <p className="text-sm text-neutral-600 mt-1">Manage event announcements and flyer displays (native 818:1024 flyer ratio).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((e) => (
                <div key={e.id} className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card flex gap-4">
                  <div style={{ position: 'relative' }} className="relative w-24 aspect-[818/1024] rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    <Image src={e.thumbnail_url || '/events/beginner_class_event_flyer.jpg'} alt={e.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800">{e.venue_type} • ${e.price_amount} USD</span>
                      <h3 className="font-heading font-bold text-base text-neutral-950 mt-1">{e.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{e.short_description}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => handleDeleteEvent(e.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Event Form */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card">
              <h2 className="text-lg font-heading font-bold text-neutral-950 mb-4">Schedule Live Event</h2>
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Event Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newEvent.title} 
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Ticket Price (USD)</label>
                  <input 
                    type="number" 
                    value={newEvent.price_amount} 
                    onChange={e => setNewEvent({ ...newEvent, price_amount: Number(e.target.value) })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Flyer Image Path</label>
                  <input 
                    type="text" 
                    value={newEvent.thumbnail_url} 
                    onChange={e => setNewEvent({ ...newEvent, thumbnail_url: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Venue Type</label>
                  <input 
                    type="text" 
                    value={newEvent.venue_type} 
                    onChange={e => setNewEvent({ ...newEvent, venue_type: e.target.value })} 
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition">
                    <Plus className="w-4 h-4" />
                    <span>Publish Event</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: YOUTUBE MEDIA */}
        {activeTab === 'youtube' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-neutral-950">YouTube Media Showcase</h1>
              <p className="text-sm text-neutral-600 mt-1">Configure the 3 featured educational market breakdowns shown on the public site.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div key={v.id} className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-card flex flex-col justify-between">
                  <div>
                    <div style={{ position: 'relative' }} className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 mb-3">
                      <Image src={v.thumbnailUrl || '/kira_forex_founder.jpg'} alt={v.title} fill className="object-cover" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-neutral-950 line-clamp-2">{v.title}</h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center">
                    <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1">
                      <Youtube className="w-3.5 h-3.5" />
                      <span>Watch</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RESPONSIVE STUDENT LEADS CRM (WITH DELETE) */}
        {activeTab === 'leads' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-neutral-950">Student Leads CRM</h1>
              <p className="text-sm text-neutral-600 mt-1">Real-time enquiries captured from the website contact forms. Fully responsive with border sections and 1-click delete action.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse border border-neutral-200">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-700 text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
                      <th className="p-3.5 border-r border-neutral-200">Student Name</th>
                      <th className="p-3.5 border-r border-neutral-200">Contact Details</th>
                      <th className="p-3.5 border-r border-neutral-200">Service Interest</th>
                      <th className="p-3.5 border-r border-neutral-200">Message Snippet</th>
                      <th className="p-3.5 border-r border-neutral-200">Status</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500 text-xs">
                          No student enquiries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      leads.map((l) => (
                        <tr key={l.id} className="hover:bg-neutral-50/80 transition">
                          <td className="p-3.5 border-r border-neutral-200 font-bold text-neutral-950">
                            {l.full_name}
                          </td>
                          <td className="p-3.5 border-r border-neutral-200 text-xs text-neutral-600">
                            <span className="block font-semibold text-neutral-800">{l.phone || 'No Phone'}</span>
                            <span className="block text-[11px] text-neutral-500">{l.email || 'No Email'}</span>
                          </td>
                          <td className="p-3.5 border-r border-neutral-200 text-xs font-semibold text-neutral-800">
                            {l.service_interest}
                          </td>
                          <td className="p-3.5 border-r border-neutral-200 text-xs text-neutral-600 max-w-xs truncate">
                            {l.message || '—'}
                          </td>
                          <td className="p-3.5 border-r border-neutral-200">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                              {l.status || 'New'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleDeleteLead(l.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FULL VISUAL CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-heading font-extrabold text-neutral-950">Full Visual Customizer</h1>
                <p className="text-sm text-neutral-600 mt-1">Customize themes, brand colors, typography engines, hero photo, and all copy.</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
              </button>
            </div>

            {/* Sub-Section 1: Theme & Colors */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card space-y-6">
              <h2 className="text-lg font-heading font-bold text-neutral-950 border-b border-neutral-100 pb-3">
                1. Theme & Color Palettes
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Theme Mode</label>
                  <select 
                    value={settings.theme_mode || 'light'} 
                    onChange={e => setSettings({ ...settings, theme_mode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  >
                    <option value="light">Pure White (Default)</option>
                    <option value="dark">Obsidian Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Brand Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={settings.brand_accent_color || '#10B981'} 
                      onChange={e => setSettings({ ...settings, brand_accent_color: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-neutral-300 p-0.5 cursor-pointer bg-white"
                    />
                    <input 
                      type="text" 
                      value={settings.brand_accent_color || '#10B981'} 
                      onChange={e => setSettings({ ...settings, brand_accent_color: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Canvas Background</label>
                  <input 
                    type="text" 
                    value={settings.theme_bg_color || '#FFFFFF'} 
                    onChange={e => setSettings({ ...settings, theme_bg_color: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section 2: Typography Engine */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card space-y-6">
              <h2 className="text-lg font-heading font-bold text-neutral-950 border-b border-neutral-100 pb-3">
                2. Typography Engine (Google Fonts)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Heading Font Family</label>
                  <select 
                    value={settings.font_heading || 'Outfit'} 
                    onChange={e => setSettings({ ...settings, font_heading: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  >
                    <option value="Outfit">Outfit</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Syne">Syne</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Body Font Family</label>
                  <select 
                    value={settings.font_body || 'Inter'} 
                    onChange={e => setSettings({ ...settings, font_body: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  >
                    <option value="Inter">Inter</option>
                    <option value="DM Sans">DM Sans</option>
                    <option value="Manrope">Manrope</option>
                    <option value="Urbanist">Urbanist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Font Scale ({settings.font_scale || '1'}x)</label>
                  <input 
                    type="range" 
                    min="0.85" 
                    max="1.25" 
                    step="0.05"
                    value={settings.font_scale || '1'} 
                    onChange={e => setSettings({ ...settings, font_scale: e.target.value })}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section 3: Hero Photo & Headlines */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card space-y-6">
              <h2 className="text-lg font-heading font-bold text-neutral-950 border-b border-neutral-100 pb-3">
                3. Signature Hero Section & Photo
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Hero Portrait Image Path</label>
                  <input 
                    type="text" 
                    value={settings.hero_image_url || '/kira_forex_portrait_transparent.png'} 
                    onChange={e => setSettings({ ...settings, hero_image_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Hero Main Headline</label>
                  <input 
                    type="text" 
                    value={settings.hero_headline || ''} 
                    onChange={e => setSettings({ ...settings, hero_headline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Hero Subheadline</label>
                  <textarea 
                    rows={2}
                    value={settings.hero_subheadline || ''} 
                    onChange={e => setSettings({ ...settings, hero_subheadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Button 1 Text (Community)</label>
                  <input 
                    type="text" 
                    value={settings.hero_btn1_text || ''} 
                    onChange={e => setSettings({ ...settings, hero_btn1_text: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Button 2 Text (Deriv Broker)</label>
                  <input 
                    type="text" 
                    value={settings.hero_btn2_text || ''} 
                    onChange={e => setSettings({ ...settings, hero_btn2_text: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Section 4: Contact & Social URLs */}
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-card space-y-6">
              <h2 className="text-lg font-heading font-bold text-neutral-950 border-b border-neutral-100 pb-3">
                4. WhatsApp, Telegram & Partner URLs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">WhatsApp Live Chat Phone</label>
                  <input 
                    type="text" 
                    value={settings.whatsapp_phone || ''} 
                    onChange={e => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Direct Call Phone</label>
                  <input 
                    type="text" 
                    value={settings.call_phone || ''} 
                    onChange={e => setSettings({ ...settings, call_phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Primary Telegram URL</label>
                  <input 
                    type="text" 
                    value={settings.primary_telegram_url || ''} 
                    onChange={e => setSettings({ ...settings, primary_telegram_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">Deriv Partner Affiliate Link</label>
                  <input 
                    type="text" 
                    value={settings.deriv_partner_url || ''} 
                    onChange={e => setSettings({ ...settings, deriv_partner_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save All Customizer Settings'}</span>
              </button>
            </div>
          </form>
        )}

      </main>
    </div>
  );
}
