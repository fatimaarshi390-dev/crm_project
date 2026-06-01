'use client';

import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { RefreshCw, BookOpen, Phone, User } from 'lucide-react';

type Lead = {
  _id: string;
  eqId: string;
  eqName: string;
  contact: string;
  course?: string;
  status: string;
};

export default function ApproachedLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApproachedLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?status=approached');
      const data = await res.json();

      if (data.success) {
        setLeads(data.data || []);
      } else {
        toast.error("Failed to load approached leads");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproachedLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
        <RefreshCw className="animate-spin text-blue-600" size={24} />
        <p className="font-medium">Loading Negative Leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* ================= HEADER PANEL ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            Negative Leads
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Total active records: <span className="font-semibold text-gray-700">{leads.length}</span>
          </p>
        </div>
        <button
          onClick={fetchApproachedLeads}
          className="inline-flex items-center gap-2 text-sm px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-98 transition shadow-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ================= LEADS CONTAINER ================= */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-500 shadow-sm">
          <User className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="font-medium text-gray-600">No negative leads found</p>
          <p className="text-xs text-gray-400 mt-1">Check back later or try refreshing the view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between gap-4 group"
            >
              {/* Card Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    {lead.eqId}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {lead.eqName}
                    </p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                      <Phone size={13} className="shrink-0" />
                      <span className="truncate">{lead.contact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1.5 text-gray-600 text-sm min-w-0">
                  <BookOpen size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate font-medium">{lead.course || '—'}</span>
                </div>
                <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full shrink-0">
                  Not Interested
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}