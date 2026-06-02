'use client';

import Link from 'next/link';

import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Activity,
  Sparkles,
  Layers,
} from 'lucide-react';

import AdminCockpitView from './AdminCockpitView';
import AdminSwitchAccount from './AdminSwitchAccount';
import Header from './header';
import AddMemberDialog from './addmember';
import AddDepartmentDialog from './AddDepartmentDialog';
import AddCourseDialog from './AddCourseDialog';
import AddTeacherDialog from './AddTeacherDialog';
import DivisionManager from './Division';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 transition-colors duration-200">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ================= HERO HERO SECTION ================= */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 h-80 w-80 bg-slate-100 dark:bg-zinc-800/40 rounded-full blur-3xl opacity-70 pointer-events-none" />

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 p-6 sm:p-8 lg:p-10">
            {/* Hero Details */}
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-md">
                  <ShieldCheck size={28} />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    <Sparkles size={12} className="text-amber-500" />
                    Admin Control Center
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                    System Architecture Panel
                  </h1>
                </div>
              </div>

              <p className="text-slate-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                Manage corporate accounts, track system workloads, deploy active course structural trees, and fine-tune system infrastructure across the core matrix.
              </p>

              {/* Grid Metric Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { label: 'Team Control', desc: 'Account Access', icon: <Users size={18} /> },
                  { label: 'Monitoring', desc: 'Live Cockpit View', icon: <Activity size={18} /> },
                  { label: 'Security', desc: 'Identity Matrix', icon: <ShieldCheck size={18} /> }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50 p-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{item.label}</p>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.desc}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Primary Actions Box */}
            <div className="flex flex-col sm:flex-row xl:flex-col gap-4 xl:min-w-[280px] justify-center">
              <Link
                href="/cockpit"
                className="inline-flex items-center justify-center gap-2 bg-slate-950 dark:bg-zinc-50 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-5 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm"
              >
                <LayoutDashboard size={18} />
                View Full Cockpit
                <ArrowRight size={16} className="ml-1" />
              </Link>

              {/* Operations Control Dialog Pad */}
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 p-4 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-zinc-800/60">
                  <Layers size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Directory Management</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <AddMemberDialog />
                  <AddDepartmentDialog />
                  <AddCourseDialog />
                  <AddTeacherDialog />
                  <DivisionManager />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN DASHBOARD CONTENT GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Component: Switch Account Column */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-full space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Switch Profile</h2>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Access auxiliary secure permissions</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 p-4 flex-1">
                <AdminSwitchAccount />
              </div>
            </div>
          </div>

          {/* Component: Cockpit Live Overview Terminal */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-full space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center">
                    <LayoutDashboard size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Cockpit Feed Monitoring</h2>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">Live operational event streaming pipeline</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link 
                    href='/overwrite' 
                    className='text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-zinc-700 transition-colors'
                  >
                    Fee Overwrite
                  </Link>
                     <Link 
                    href='/leads' 
                    className='text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-zinc-700 transition-colors'
                  >
                    Leads
                  </Link>
                  <Link 
                    href="/investment" 
                    className='text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-zinc-700 transition-colors'
                  >
                    Investment Engine
                  </Link>
                </div>
              </div>

              {/* Embed Core Stream Window */}
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-950/20 p-4 min-h-[340px] flex-1">
                <AdminCockpitView />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}