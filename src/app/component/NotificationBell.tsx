'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  RefreshCcw,
  Phone,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

type Lead = {
  _id: string;
  eqId: string;
  eqName: string;
  contact: string;
  course?: string;
};

type NotificationData = {
  preDemoLeads: Lead[];
  demoLeads: Lead[];
  postDemoLeads: Lead[];
  preDemo: number;
  demo: number;
  postDemo: number;
  total: number;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();

    try {
      const saved = localStorage.getItem('dismissed_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const ref = useRef<HTMLDivElement>(null);

  // Midnight reset
  useEffect(() => {
    try {
      const lastCleared = localStorage.getItem(
        'notifications_cleared_date'
      );

      const today = new Date().toDateString();

      if (lastCleared !== today) {
        localStorage.removeItem('dismissed_notifications');
        localStorage.setItem(
          'notifications_cleared_date',
          today
        );

        setDismissed(new Set());
      }
    } catch {}
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () =>
      document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/notifications/today');
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(prev => {
      const updated = new Set(prev);

      updated.add(id);

      try {
        localStorage.setItem(
          'dismissed_notifications',
          JSON.stringify([...updated])
        );
      } catch {}

      return updated;
    });

    toast.success('Notification dismissed');
  };

  // Filter
  const visiblePreDemo =
    data?.preDemoLeads.filter(
      l => !dismissed.has(l._id)
    ) || [];

  const visibleDemo =
    data?.demoLeads.filter(
      l => !dismissed.has(l._id)
    ) || [];

  const visiblePostDemo =
    data?.postDemoLeads.filter(
      l => !dismissed.has(l._id)
    ) || [];

  const totalVisible =
    visiblePreDemo.length +
    visibleDemo.length +
    visiblePostDemo.length;

  return (
    <div className="relative z-50" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          relative
          flex
          items-center
          justify-center
          h-11
          w-11
          rounded-2xl
          bg-white/80
          backdrop-blur-lg
          border
          border-white/30
          shadow-lg
          hover:scale-105
          hover:shadow-2xl
          transition-all
          duration-300
        "
      >
        <Bell
          size={22}
          className="text-slate-700"
        />

        {totalVisible > 0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-[22px]
              h-[22px]
              px-1
              flex
              items-center
              justify-center
              rounded-full
              text-[11px]
              font-bold
              bg-gradient-to-r
              from-red-500
              to-pink-500
              text-white
              shadow-md
            "
          >
            {totalVisible > 99
              ? '99+'
              : totalVisible}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-14
            w-[380px]
            max-w-[95vw]
            overflow-hidden
            rounded-3xl
            border
            border-white/20
            bg-white/80
            backdrop-blur-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            animate-in
            fade-in
            zoom-in-95
            duration-200
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              bg-gradient-to-r
              from-slate-50
              to-white
            "
          >
            <div>
              <h2 className="font-bold text-slate-800 text-lg">
                Today's Follow-ups
              </h2>

              <p className="text-xs text-slate-500">
                Manage all pending leads
              </p>
            </div>

            <button
              onClick={fetchNotifications}
              className="
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-xl
                bg-slate-100
                hover:bg-slate-200
                transition
                text-sm
                font-medium
              "
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>

          {/* Body */}
          {loading ? (
            <div className="py-16 text-center">
              <div
                className="
                  mx-auto
                  h-10
                  w-10
                  rounded-full
                  border-4
                  border-slate-200
                  border-t-slate-600
                  animate-spin
                "
              />

              <p className="mt-4 text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : totalVisible === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2
                className="mx-auto text-green-500"
                size={42}
              />

              <p className="mt-3 font-semibold text-slate-700">
                No follow-ups today 🎉
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Everything is cleared
              </p>
            </div>
          ) : (
            <div
              className="
                max-h-[500px]
                overflow-y-auto
                custom-scrollbar
                space-y-5
                p-4
              "
            >
           

{visiblePreDemo.length > 0 && (
  <Section
    title="Pre-Demo Follow-ups"
    count={visiblePreDemo.length}
    gradient="from-blue-500 to-cyan-500"
    leads={visiblePreDemo}
    onDismiss={handleDismiss}
    onNavigate={(status) => {
      router.replace(`/leads?tab=${status}`);
      setOpen(false);
    }}
  />
)}

{visibleDemo.length > 0 && (
  <Section
    title="Demo Follow-ups"
    count={visibleDemo.length}
    gradient="from-violet-500 to-purple-500"
    leads={visibleDemo}
    onDismiss={handleDismiss}
    onNavigate={(status) => {
      router.replace(`/leads?tab=${status}`);
      setOpen(false);
    }}
  />
)}

{visiblePostDemo.length > 0 && (
  <Section
    title="Post-Demo Follow-ups"
    count={visiblePostDemo.length}
    gradient="from-emerald-500 to-green-500"
    leads={visiblePostDemo}
    onDismiss={handleDismiss}
    onNavigate={(status) => {
      router.replace(`/leads?tab=${status}`);
      setOpen(false);
    }}
  />
)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// SECTION COMPONENT
function Section({
  title,
  count,
  gradient,
  leads,
  onDismiss,
  onNavigate,
}: {
  title: string;
  count: number;
  gradient: string;
  leads: Lead[];
  onDismiss: (id: string) => void;
  onNavigate: (status: string) => void;  // ← NEW
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Status determine karo title se
  const getStatus = () => {
    if (title.includes('Pre-Demo'))  return 'per-demo-followups';
    if (title.includes('Demo'))      return 'demo-day-followups';
    if (title.includes('Post-Demo')) return 'post-demo-followups';
    return 'Fresh Leads';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">Pending leads</p>
        </div>
        <div className={`bg-gradient-to-r ${gradient} text-white text-sm font-bold px-3 py-1 rounded-full shadow`}>
          {count}
        </div>
      </div>

      {/* Leads */}
      <div className="space-y-3">
        {leads.map(lead => (
          <div
            key={lead._id}
            className="relative"
            onMouseEnter={() => setHovered(lead._id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-white hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded accent-green-500 cursor-pointer"
                  onChange={() => onDismiss(lead._id)}
                />

                {/* ← Name click pe navigate */}
                <div className="min-w-0">
                  <p
                    onClick={() => onNavigate(getStatus())}
                    className="text-sm font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                  >
                    {lead.eqName}
                  </p>
                </div>
              </div>

              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition">
                <Phone size={16} className="text-slate-600" />
              </div>
            </div>

            {/* Tooltip */}
            {hovered === lead._id && (
              <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-slate-800">{lead.eqName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Phone size={14} />
                    {lead.contact}
                  </div>
                  {lead.course && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <GraduationCap size={15} />
                      {lead.course}
                    </div>
                  )}
                  <button
                    onClick={() => onNavigate(getStatus())}
                    className="w-full mt-2 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Lead →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}