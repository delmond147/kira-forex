import React from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAF9]">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#04170D] text-white p-6 flex flex-col justify-between border-r border-[#072B19]">
        <div>
          <div className="flex items-center gap-3.5 pb-6 border-b border-[#0E3E26]">
            <img src="/kira_academy_logo.jpg" alt="Logo" className="w-11 h-11 rounded-full border border-emerald-600 p-0.5 object-contain bg-white" />
            <div>
              <span className="block font-bold text-lg text-white">KIRAFOREX</span>
              <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Executive CMS</span>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5 text-sm font-semibold">
            <Link href="/" className="w-full text-left px-4 py-3 rounded-xl bg-[#0A3E26] text-white flex items-center justify-between">
              <span>📊 Analytics & KPIs</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">LIVE</span>
            </Link>
            <Link href="/programs" className="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-[#072B19] hover:text-white transition flex items-center gap-3">
              <span>🎓</span>
              <span>Academy Programs</span>
            </Link>
            <Link href="/events" className="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-[#072B19] hover:text-white transition flex items-center gap-3">
              <span>📅</span>
              <span>Events & Workshops</span>
            </Link>
            <Link href="/enquiries" className="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-[#072B19] hover:text-white transition flex items-center gap-3">
              <span>📬</span>
              <span>Student Leads & CRM</span>
            </Link>
            <Link href="/pages" className="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-[#072B19] hover:text-white transition flex items-center gap-3">
              <span>📝</span>
              <span>Homepage Copy</span>
            </Link>
            <Link href="/settings" className="w-full text-left px-4 py-3 rounded-xl text-neutral-300 hover:bg-[#072B19] hover:text-white transition flex items-center gap-3">
              <span>⚙️</span>
              <span>Brand Settings</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#0E3E26] text-xs">
          <div className="flex items-center gap-3 mb-3">
            <img src="/kira_forex_founder.jpg" alt="Kira" className="w-9 h-9 rounded-full object-cover border border-emerald-400" />
            <div>
              <span className="block text-white font-bold text-sm">Kira (Founder)</span>
              <span className="block text-emerald-400 text-[11px] font-semibold">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Executive Overview</span>
          <h1 className="text-3xl font-extrabold text-neutral-900 mt-1">Platform Performance & Analytics</h1>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Inbound Leads</span>
            <span className="text-4xl font-extrabold text-neutral-900 block mt-2">4 Leads</span>
            <div className="mt-4 pt-3 border-t text-xs text-emerald-700 font-semibold">● 2 Active Inquiries</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Academy Programs</span>
            <span className="text-4xl font-extrabold text-neutral-900 block mt-2">3 Courses</span>
            <div className="mt-4 pt-3 border-t text-xs text-neutral-500 font-semibold">● 100% Published</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pipeline Admissions</span>
            <span className="text-4xl font-extrabold text-emerald-700 block mt-2">$649 USD</span>
            <div className="mt-4 pt-3 border-t text-xs text-emerald-700 font-semibold">25% Enrolled</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Scheduled Events</span>
            <span className="text-4xl font-extrabold text-neutral-900 block mt-2">1 Active</span>
            <div className="mt-4 pt-3 border-t text-xs text-neutral-500 font-semibold">Nov 5th Beginner Class</div>
          </div>
        </div>
      </main>
    </div>
  );
}
