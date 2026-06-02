'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Upload, ArrowRightLeft, ChevronLeft, ChevronRight, Phone, User, BookOpen, Calendar, MessageSquare } from 'lucide-react';
import { toast } from "sonner";
import TransferModal from '@/app/component/TransferModal';
import { useUser } from '@/app/component/context/user-context';

type Lead = {
  _id: string;
  eqId: string;
  enquiryId: string;
  eqName: string;
  contact: string;
  course?: string;
  department?: string;
  city?: string;
  state?: string;
  address?: string;
  email?: string;
  preDemoExpectedDate?: string;
  preDemoActualDate?: string;
  preDemoDate?: string;
  demoDate?: string;
  postDemoDate?: string;
  admissionStatus?: string;
  salesDeck: string;
  reminder: string;
  interested?: string;
  remark?: string;
  status: string;
  preDemoDateHistory?: string[];
  demoDateHistory?: string[];
  photoUrl?: string[];
};

type Course = {
  _id: string;
  name: string;
  fee: string;
  duration: string;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function ApproachedLeadsTable({
  tabType = "pre-demo"
}: {
  tabType?: "pre-demo" | "demo-day" | "post-demo"
}) {
  const { user } = useUser();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transferLead, setTransferLead] = useState<Lead | null>(null);

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ── Courses state ──
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (user?.department) {
      fetchCourses(user.department);
    }
  }, [user?.department]);

  const fetchCourses = async (department: string) => {
    try {
      const res = await fetch(
        `/api/courses/by-department?department=${encodeURIComponent(department)}`
      );
      const result = await res.json();
      if (result.success) setCourses(result.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads?status=${tabType}`);
      const data = await res.json();
      if (data.success) {
        let filtered = data.data || [];
        if (tabType === "pre-demo") {
          filtered = filtered.filter((lead: any) =>
            lead.isPreDemo === true ||
            lead.status === 'pre-demo' ||
            lead.preDemoDate ||
            lead.preDemoExpectedDate
          );
        }
        setLeads(filtered);
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [tabType]);

  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const toggleRow = (id: string) =>
    setExpandedRow(expandedRow === id ? null : id);

  const startEditing = (lead: Lead) => {
    setEditingRow(lead._id);
    setEditForm({
      preDemoDate: (lead.preDemoExpectedDate || lead.preDemoActualDate || lead.preDemoDate || '').split('T')[0],
      demoDate: (lead.demoDate || '').split('T')[0],
      postDemoDate: (lead.postDemoDate || '').split('T')[0],
      admissionStatus: lead.admissionStatus || 'Pending',
      salesDeck: lead.salesDeck || 'No',
      reminder: lead.reminder || 'No',
      interested: lead.interested || 'Hot',
      remark: lead.remark || '',
      course: lead.course || '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Image size should be less than 1MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const saveChanges = async (id: string) => {
    const payload: any = {
      preDemoDate: editForm.preDemoDate,
      demoDate: editForm.demoDate,
      postDemoDate: editForm.postDemoDate,
      admissionStatus: editForm.admissionStatus,
      salesDeck: editForm.salesDeck,
      reminder: editForm.reminder,
      interested: editForm.interested,
      remark: editForm.remark,
      course: editForm.course || undefined,
      increaseCall: false,
    };

    const currentLead = leads.find(l => l._id === id);
    const preDemoHistoryCount = currentLead?.preDemoDateHistory?.length || 0;

    if (tabType === "pre-demo" && editForm.preDemoDate && preDemoHistoryCount >= 10) {
      toast.error("Maximum 10 Pre-Demo date changes allowed!");
      return;
    }

    if (tabType === "pre-demo") {
      if (editForm.demoDate) {
        payload.demoDate = editForm.demoDate;
        payload.status = 'demo-day';
      } else {
        payload.status = 'pre-demo';
      }
    } else if (tabType === "demo-day") {
      payload.status = 'demo-day';
    }

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined) formData.append(key, String(value));
        });
        formData.append('photo', selectedFile);
        res = await fetch(`/api/leads/${id}`, { method: 'PATCH', body: formData });
      } else {
        res = await fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success("✅ Lead Updated Successfully!");
        setEditingRow(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchLeads();
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'hot': return 'bg-red-50 text-red-700 border-red-200';
      case 'cold': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dead': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        <p className="ml-3 text-gray-500 font-medium">Loading {tabType} leads...</p>
      </div>
    );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-slate-50 md:bg-white shadow-sm overflow-hidden">
      
      {/* ── MOBILE / TABLET VIEW (Cards Layout) ── */}
      <div className="block md:hidden space-y-4 p-4">
        {currentLeads.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border">No records found.</div>
        ) : (
          currentLeads.map((lead) => {
            const isEditing = editingRow === lead._id;
            const preDemoHistory = lead.preDemoDateHistory || [lead.preDemoExpectedDate, lead.preDemoActualDate, lead.preDemoDate].filter(Boolean);
            const demoHistory = lead.demoDateHistory || (lead.demoDate ? [lead.demoDate] : []);

            return (
              <div key={lead._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Enquiry ID</span>
                    <button onClick={() => toggleRow(lead._id)} className="text-blue-600 font-bold flex items-center gap-1 text-sm">
                      {lead.enquiryId} {expandedRow === lead._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  <div>
                    {isEditing ? (
                      <select
                        value={editForm.interested}
                        onChange={(e) => setEditForm({ ...editForm, interested: e.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-xs"
                      >
                        <option value="Hot">Hot</option>
                        <option value="Cold">Cold</option>
                        <option value="Dead">Dead</option>
                      </select>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(lead.interested)}`}>
                        {lead.interested || 'Not Set'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><User size={12}/> Name</span>
                    <p className="font-semibold text-gray-900">{lead.eqName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Phone size={12}/> Contact</span>
                    <p className="text-gray-700 font-medium">{lead.contact}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-gray-400 flex items-center gap-1"><BookOpen size={12}/> Course</span>
                    {isEditing ? (
                      <select
                        value={editForm.course}
                        onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-white text-xs"
                      >
                        <option value="">Select Course</option>
                        {courses.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    ) : (
                      <p className="text-gray-800 font-medium bg-slate-50 px-2 py-1 rounded inline-block">{lead.course || '—'}</p>
                    )}
                  </div>

                  {/* Dates Layout */}
                  <div className="space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Calendar size={12}/> Follow-Up Date</span>
                    {isEditing ? (
                      <div className="space-y-1">
                        <input type="date" value={editForm.preDemoDate} onChange={(e) => setEditForm({ ...editForm, preDemoDate: e.target.value })} className="border rounded px-2 py-0.5 w-full text-xs" />
                        {preDemoHistory.length > 0 && (
                          <select onChange={(e) => setEditForm({ ...editForm, preDemoDate: e.target.value })} className="border rounded w-full text-[10px] p-0.5 text-gray-500">
                            <option value="">History Logs</option>
                            {preDemoHistory.map((d, idx) => <option key={idx} value={d?.split('T')[0] || ''}>{formatDate(d)}</option>)}
                          </select>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium">{formatDate(lead.preDemoExpectedDate || lead.preDemoActualDate || lead.preDemoDate)}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Calendar size={12}/> Demo Date</span>
                    {isEditing ? (
                      <div className="space-y-1">
                        <input type="date" value={editForm.demoDate} onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border rounded px-2 py-0.5 w-full text-xs" />
                        {demoHistory.length > 0 && (
                          <select onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border rounded w-full text-[10px] p-0.5 text-gray-500">
                            <option value="">History Logs</option>
                            {demoHistory.map((d, idx) => <option key={idx} value={d?.split('T')[0] || ''}>{formatDate(d)}</option>)}
                          </select>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium">{formatDate(lead.demoDate)}</p>
                    )}
                  </div>

                  {/* Remark Layout */}
                  <div className="space-y-1 col-span-2">
                    <span className="text-gray-400 flex items-center gap-1"><MessageSquare size={12}/> Remark</span>
                    {isEditing ? (
                      <input type="text" value={editForm.remark} onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" />
                    ) : (
                      <p className="text-gray-600 bg-slate-50/50 p-2 rounded-lg border border-dashed text-xs">{lead.remark || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Mobile Expanded Drawer View */}
                {expandedRow === lead._id && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1.5 animate-fadeIn">
                    <p><span className="text-gray-400 font-medium">City:</span> {lead.city || '—'}</p>
                    <p><span className="text-gray-400 font-medium">State:</span> {lead.state || '—'}</p>
                    <p><span className="text-gray-400 font-medium">Address:</span> {lead.address || '—'}</p>
                    <p><span className="text-gray-400 font-medium">Email:</span> {lead.email || '—'}</p>
                  </div>
                )}

                {/* Action System Buttons */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-end gap-2">
                  {isEditing ? (
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex items-center gap-2 justify-between">
                        <label className="cursor-pointer flex items-center justify-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-300">
                          <Upload size={12} /> Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                        {previewUrl && (
                          <div className="relative">
                            <img src={previewUrl} className="h-8 w-8 object-cover rounded border" />
                            <button onClick={removeSelectedFile} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={8} /></button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveChanges(lead._id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex-1">Save</button>
                        <button onClick={cancelEditing} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium flex-1">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setTransferLead(lead)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                        <ArrowRightLeft size={12} /> Transfer
                      </button>
                      <button onClick={() => startEditing(lead)} className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium">
                        Update
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP VIEW (Classic Beautiful Table) ── */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full min-w-[1400px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200 text-slate-700 font-semibold">
              <th className="px-6 py-4 text-left w-44">ENQUIRY ID</th>
              <th className="px-6 py-4 text-left">NAME</th>
              <th className="px-6 py-4 text-left">CONTACT</th>
              <th className="px-6 py-4 text-left w-56">COURSE</th>
              <th className="px-6 py-4 text-left w-56">FOLLOW-UP DATE</th>
              <th className="px-6 py-4 text-left w-56">DEMO DATE</th>
              <th className="px-6 py-4 text-left w-36">STATUS</th>
              <th className="px-6 py-4 text-left">REMARK</th>
              <th className="px-6 py-4 text-center w-48">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-gray-400">No records found.</td>
              </tr>
            ) : (
              currentLeads.map((lead) => {
                const isEditing = editingRow === lead._id;
                const preDemoHistory = lead.preDemoDateHistory || [lead.preDemoExpectedDate, lead.preDemoActualDate, lead.preDemoDate].filter(Boolean);
                const demoHistory = lead.demoDateHistory || (lead.demoDate ? [lead.demoDate] : []);

                return (
                  <>
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-medium">
                        <button onClick={() => toggleRow(lead._id)} className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800">
                          {expandedRow === lead._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {lead.enquiryId}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{lead.eqName}</td>
                      <td className="px-6 py-4 text-gray-600">{lead.contact}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1.5 w-full bg-white focus:ring-2 focus:ring-blue-500 text-xs">
                            <option value="">Select Course</option>
                            {courses.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                            {lead.course || '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input type="date" value={editForm.preDemoDate} onChange={(e) => setEditForm({ ...editForm, preDemoDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1 w-full text-xs focus:ring-2 focus:ring-blue-500" />
                            {preDemoHistory.length > 0 && (
                              <select onChange={(e) => setEditForm({ ...editForm, preDemoDate: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1 w-full text-[11px] text-gray-500 bg-slate-50">
                                <option value="">History Logs</option>
                                {preDemoHistory.map((date, idx) => <option key={idx} value={date?.split('T')[0] || ''}>{formatDate(date)}</option>)}
                              </select>
                            )}
                          </div>
                        ) : (
                          formatDate(lead.preDemoExpectedDate || lead.preDemoActualDate || lead.preDemoDate)
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input type="date" value={editForm.demoDate} onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1 w-full text-xs focus:ring-2 focus:ring-blue-500" />
                            {demoHistory.length > 0 && (
                              <select onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1 w-full text-[11px] text-gray-500 bg-slate-50">
                                <option value="">History Logs</option>
                                {demoHistory.map((date, idx) => <option key={idx} value={date?.split('T')[0] || ''}>{formatDate(date)}</option>)}
                              </select>
                            )}
                          </div>
                        ) : (
                          formatDate(lead.demoDate)
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select value={editForm.interested} onChange={(e) => setEditForm({ ...editForm, interested: e.target.value })} className="border border-gray-300 rounded-lg px-2 py-1 w-full bg-white text-xs focus:ring-2 focus:ring-blue-500">
                            <option value="Hot">Hot</option>
                            <option value="Cold">Cold</option>
                            <option value="Dead">Dead</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(lead.interested)}`}>
                            {lead.interested || 'Not Set'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-600 text-xs">
                        {isEditing ? (
                          <input type="text" value={editForm.remark} onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })} placeholder="Add remark..." className="border border-gray-300 rounded-lg px-3 py-1 w-full text-xs focus:ring-2 focus:ring-blue-500" />
                        ) : (
                          lead.remark || '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-2">
                            <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 w-full">
                              <Upload size={14} /> Upload
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                            {previewUrl && (
                              <div className="relative">
                                <img src={previewUrl} alt="preview" className="h-12 w-12 object-cover rounded-md border" />
                                <button onClick={removeSelectedFile} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                              </div>
                            )}
                            <div className="flex gap-1.5 w-full">
                              <button onClick={() => saveChanges(lead._id)} className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-medium flex-1">Save</button>
                              <button onClick={cancelEditing} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium flex-1">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => startEditing(lead)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">Update</button>
                            <button onClick={() => setTransferLead(lead)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"><ArrowRightLeft size={12} /> Transfer</button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedRow === lead._id && (
                      <tr key={`${lead._id}-expanded`} className="bg-slate-50/50">
                        <td colSpan={9} className="px-6 py-4 border-t border-b border-gray-100">
                          <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-inner text-xs">
                            <div><span className="text-gray-400 block mb-0.5 font-medium">City</span> <p className="text-gray-800 font-medium">{lead.city || '—'}</p></div>
                            <div><span className="text-gray-400 block mb-0.5 font-medium">State</span> <p className="text-gray-800 font-medium">{lead.state || '—'}</p></div>
                            <div><span className="text-gray-400 block mb-0.5 font-medium">Address</span> <p className="text-gray-800 font-medium">{lead.address || '—'}</p></div>
                            <div><span className="text-gray-400 block mb-0.5 font-medium">Email</span> <p className="text-gray-800 font-medium break-all">{lead.email || '—'}</p></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── UNIVERSAL RESPONSIVE PAGINATION FOOTER ── */}
      {totalPages > 1 && (
        <div className="px-4 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{indexOfFirstLead + 1}</span> to{' '}
            <span className="font-semibold text-gray-700">{Math.min(indexOfLastLead, leads.length)}</span> of{' '}
            <span className="font-semibold text-gray-700">{leads.length}</span> leads
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1 text-xs font-medium">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <TransferModal
        lead={transferLead}
        onClose={() => setTransferLead(null)}
        onTransferred={fetchLeads}
      />
    </div>
  );
}