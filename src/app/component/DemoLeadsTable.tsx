'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Upload, ArrowRightLeft, User, Phone, BookOpen, Calendar, CheckSquare, MessageSquare, Briefcase, AlertCircle } from 'lucide-react';
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
  demoDate?: string;
  postDemoDate?: string;
  demoDoneDate?: string;
  demoDoneBy?: string;
  admissionDate?: string;
  admissionStatus?: string;
  remark?: string;
  reminder?: string;
  interested?: string;
  status: string;
  demoDateHistory?: string[];
  photoUrl?: string[];
};

type Course = {
  _id: string;
  name: string;
  fee: string;
  duration: string;
};

type Teacher = {
  _id: string;
  name: string;
  specialization: string;
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

export default function DemoDayLeadsTable() {
  const { user } = useUser();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [transferLead, setTransferLead] = useState<Lead | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    if (user?.department) {
      fetchCourses(user.department);
      fetchTeachers();
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

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers/by-department');
      const result = await res.json();
      if (result.success) setTeachers(result.data || []);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?status=demo-day');
      const data = await res.json();
      if (data.success) setLeads(data.data || []);
    } catch (error) {
      toast.error("Failed to load Demo Day leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const toggleRow = (id: string) =>
    setExpandedRow(expandedRow === id ? null : id);

  const startEditing = (lead: Lead) => {
    setEditingRow(lead._id);
    setEditForm({
      demoDate: lead.demoDate ? lead.demoDate.split('T')[0] : '',
      postDemoDate: lead.postDemoDate ? lead.postDemoDate.split('T')[0] : '',
      admissionStatus: lead.admissionStatus || 'Pending',
      reminder: lead.reminder || 'No',
      remark: lead.remark || '',
      demoDone: !!lead.demoDoneDate,
      interested: lead.interested || 'Hot',
      demoDoneBy: lead.demoDoneBy || '',
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
      demoDate: editForm.demoDate,
      postDemoDate: editForm.postDemoDate,
      admissionStatus: editForm.admissionStatus,
      remark: editForm.remark,
      reminder: editForm.reminder,
      demoDone: editForm.demoDone,
      interested: editForm.interested || 'Hot',
      demoDoneBy: editForm.demoDoneBy || undefined,
      course: editForm.course || undefined,
    };

    const currentLead = leads.find(l => l._id === id);
    const demoHistoryCount = currentLead?.demoDateHistory?.length || 0;

    if (editForm.demoDate && demoHistoryCount >= 10) {
      toast.error("Maximum 10 Demo Date changes allowed!");
      return;
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
        toast.success("✅ Updated Successfully!");
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

  const getAdmissionBadgeClass = (status?: string) => {
    switch (status) {
      case 'Admitted': return 'bg-green-50 text-green-700 border-green-200';
      case 'Not Admitted': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        <p className="ml-3 text-gray-500 font-medium">Loading Demo Day leads...</p>
      </div>
    );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-slate-50 md:bg-white shadow-sm overflow-hidden">
      
      {/* ── MOBILE / TABLET VIEW (Responsive Stacked Cards Layout) ── */}
      <div className="block md:hidden space-y-4 p-4">
        {leads.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border">No records found.</div>
        ) : (
          leads.map((lead) => {
            const isEditing = editingRow === lead._id;
            const historyDates = lead.demoDateHistory || (lead.demoDate ? [lead.demoDate] : []);

            return (
              <div key={lead._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                {/* Header System info */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Enquiry ID</span>
                    <button onClick={() => toggleRow(lead._id)} className="text-blue-600 font-bold flex items-center gap-1 text-sm">
                      {lead.enquiryId} {expandedRow === lead._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {isEditing ? (
                      <select
                        value={editForm.interested}
                        onChange={(e) => setEditForm({ ...editForm, interested: e.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-xs font-semibold"
                      >
                        <option value="Hot">Hot</option>
                        <option value="Cold">Cold</option>
                        <option value="Dead">Dead</option>
                      </select>
                    ) : (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(lead.interested)}`}>
                        {lead.interested || 'Not Set'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Base Metadata Layout */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-gray-400 flex items-center gap-1"><User size={12}/> Name</span>
                    <p className="font-bold text-gray-900">{lead.eqName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 flex items-center gap-1"><Phone size={12}/> Contact</span>
                    <p className="text-gray-700 font-medium">{lead.contact}</p>
                  </div>
                  <div className="space-y-0.5 col-span-2">
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
                      <p className="text-gray-800 font-semibold bg-slate-50 px-2 py-1 rounded inline-block">{lead.course || '—'}</p>
                    )}
                  </div>

                  {/* Demo Timeline Matrix */}
                  <div className="space-y-0.5">
                    <span className="text-gray-400 flex items-center gap-1"><Calendar size={12}/> Demo Date</span>
                    {isEditing ? (
                      <div className="space-y-1">
                        <input type="date" value={editForm.demoDate} onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border rounded px-2 py-0.5 w-full text-xs" />
                        {historyDates.length > 0 && (
                          <select onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border rounded w-full text-[10px] p-0.5 text-gray-500 bg-slate-50">
                            <option value="">Previous Dates</option>
                            {historyDates.map((d, idx) => <option key={idx} value={d?.split('T')[0] || ''}>{formatDate(d)}</option>)}
                          </select>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium">{formatDate(lead.demoDate)}</p>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-gray-400 flex items-center gap-1"><Calendar size={12}/> Post-Demo Date</span>
                    {isEditing ? (
                      <input type="date" value={editForm.postDemoDate} onChange={(e) => setEditForm({ ...editForm, postDemoDate: e.target.value })} className="border rounded px-2 py-0.5 w-full text-xs" />
                    ) : (
                      <p className="text-gray-700 font-medium">{lead.postDemoDate ? lead.postDemoDate.split('T')[0] : '—'}</p>
                    )}
                  </div>

                  {/* Verification & Faculty assignment info */}
                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 flex items-center gap-1 font-medium"><CheckSquare size={12}/> Demo Completed</span>
                    <div className="pt-0.5">
                      {isEditing ? (
                        <input type="checkbox" checked={editForm.demoDone} onChange={(e) => setEditForm({ ...editForm, demoDone: e.target.checked })} className="w-4 h-4 accent-green-600" />
                      ) : (
                        <span>{lead.demoDoneDate ? '✅ Done' : '❌ Pending'}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 flex items-center gap-1 font-medium"><Briefcase size={12}/> Handled By</span>
                    {isEditing ? (
                      <select value={editForm.demoDoneBy} onChange={(e) => setEditForm({ ...editForm, demoDoneBy: e.target.value })} className="border border-gray-300 rounded px-2 py-0.5 w-full bg-white text-xs">
                        <option value="">Select Teacher</option>
                        {teachers.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
                      </select>
                    ) : (
                      <p className="text-slate-700 font-semibold text-[11px] truncate">{lead.demoDoneBy || '—'}</p>
                    )}
                  </div>

                  {/* Administrative Parameters */}
                  <div className="space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><AlertCircle size={12}/> Admission Progress</span>
                    {isEditing ? (
                      <select value={editForm.admissionStatus} onChange={(e) => setEditForm({ ...editForm, admissionStatus: e.target.value })} className="border border-gray-300 rounded px-2 py-1 w-full bg-white text-xs">
                        <option value="Pending">Pending</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Not Admitted">Not Admitted</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full font-semibold border inline-block text-[11px] ${getAdmissionBadgeClass(lead.admissionStatus)}`}>
                        {lead.admissionStatus || 'Pending'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Calendar size={12}/> System Reminder</span>
                    <p className="text-gray-700 font-medium bg-slate-50 border rounded px-2 py-0.5 inline-block text-[11px]">{lead.reminder || 'No'}</p>
                  </div>

                  {/* Core Content Remark */}
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-gray-400 flex items-center gap-1"><MessageSquare size={12}/> Operations Remark</span>
                    {isEditing ? (
                      <input type="text" value={editForm.remark} onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" />
                    ) : (
                      <p className="text-gray-600 bg-slate-50 p-2 rounded-lg border border-dashed text-xs">{lead.remark || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Mobile Extra Collapsible Info Drawer */}
                {expandedRow === lead._id && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1.5 animate-fadeIn">
                    <p><span className="text-gray-400 font-medium">City:</span> {lead.city || '—'}</p>
                    <p><span className="text-gray-400 font-medium">State:</span> {lead.state || '—'}</p>
                    <p><span className="text-gray-400 font-medium">Address:</span> {lead.address || '—'}</p>
                    <p><span className="text-gray-400 font-medium">Email:</span> {lead.email || '—'}</p>
                  </div>
                )}

                {/* Mobile Operations Action Tray */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-end gap-2">
                  {isEditing ? (
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex items-center gap-2 justify-between">
                        <label className="cursor-pointer flex items-center justify-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-300">
                          <Upload size={12} /> Photo Verification
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
                        <button onClick={() => saveChanges(lead._id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex-1">Save Parameters</button>
                        <button onClick={cancelEditing} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium flex-1">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setTransferLead(lead)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                        <ArrowRightLeft size={12} /> Transfer Lead
                      </button>
                      <button onClick={() => startEditing(lead)} className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium">
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

      {/* ── DESKTOP VIEW (Classic Table Mode) ── */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full min-w-[2000px] border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold">
              <th className="px-5 py-4 text-left">ENQUIRY ID</th>
              <th className="px-5 py-4 text-left">NAME</th>
              <th className="px-5 py-4 text-left">CONTACT</th>
              <th className="px-5 py-4 text-left w-56">COURSE</th>
              <th className="px-5 py-4 text-left w-56">DEMO DATE HISTORY</th>
              <th className="px-5 py-4 text-center">DEMO DONE</th>
              <th className="px-5 py-4 text-left w-56">DEMO DONE BY</th>
              <th className="px-5 py-4 text-left">REMARK</th>
              <th className="px-5 py-4 text-left w-48">POST-DEMO DATE</th>
              <th className="px-5 py-4 text-left w-36">STATUS</th>
              <th className="px-5 py-4 text-left w-44">ADMISSION STATUS</th>
              <th className="px-5 py-4 text-left">REMINDER</th>
              <th className="px-5 py-4 text-center w-48">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-5 py-10 text-center text-gray-400">No records found.</td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isEditing = editingRow === lead._id;
                const historyDates = lead.demoDateHistory || (lead.demoDate ? [lead.demoDate] : []);

                return (
                  <>
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors group border-b">
                      <td className="px-5 py-4 font-semibold">
                        <button onClick={() => toggleRow(lead._id)} className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800">
                          {expandedRow === lead._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {lead.enquiryId}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">{lead.eqName}</td>
                      <td className="px-5 py-4 text-gray-600">{lead.contact}</td>
                      
                      {/* Course */}
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1.5 w-full bg-white text-xs">
                            <option value="">Select Course</option>
                            {courses.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                            {lead.course || '—'}
                          </span>
                        )}
                      </td>

                      {/* Demo Date Log */}
                      <td className="px-5 py-4 font-medium">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input type="date" value={editForm.demoDate} onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1 w-full text-xs" />
                            {historyDates.length > 0 && (
                              <select onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })} className="border border-gray-200 rounded-lg px-2 py-1 w-full text-[11px] text-gray-500 bg-slate-50">
                                <option value="">Previous Demo Dates</option>
                                {historyDates.map((date, idx) => <option key={idx} value={date?.split('T')[0] || ''}>{formatDate(date)}</option>)}
                              </select>
                            )}
                          </div>
                        ) : (
                          formatDate(lead.demoDate)
                        )}
                      </td>

                      {/* Demo Checkmark Verification */}
                      <td className="px-5 py-4 text-center">
                        {isEditing ? (
                          <input type="checkbox" checked={editForm.demoDone} onChange={(e) => setEditForm({ ...editForm, demoDone: e.target.checked })} className="w-5 h-5 accent-green-600" />
                        ) : (
                          lead.demoDoneDate ? '✅' : '—'
                        )}
                      </td>

                      {/* Demo Handled By */}
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select value={editForm.demoDoneBy} onChange={(e) => setEditForm({ ...editForm, demoDoneBy: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1.5 w-full bg-white text-xs">
                            <option value="">Select Teacher</option>
                            {teachers.map((t) => <option key={t._id} value={t.name}>{t.name}{t.specialization ? ` (${t.specialization})` : ''}</option>)}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
                            {lead.demoDoneBy || '—'}
                          </span>
                        )}
                      </td>

                      {/* Remark */}
                      <td className="px-5 py-4 max-w-xs truncate text-gray-600">
                        {isEditing ? (
                          <input type="text" value={editForm.remark} onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })} placeholder="Add remark..." className="border border-gray-300 rounded-lg px-3 py-1 w-full text-xs" />
                        ) : (
                          lead.remark || '—'
                        )}
                      </td>

                      {/* Post-Demo Timeline */}
                      <td className="px-5 py-4 font-medium text-gray-600">
                        {isEditing ? (
                          <input type="date" value={editForm.postDemoDate} onChange={(e) => setEditForm({ ...editForm, postDemoDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1 w-full text-xs" />
                        ) : (
                          lead.postDemoDate ? lead.postDemoDate.split('T')[0] : '—'
                        )}
                      </td>

                      {/* Interest status badge */}
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select value={editForm.interested} onChange={(e) => setEditForm({ ...editForm, interested: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs">
                            <option value="Hot">Hot</option>
                            <option value="Cold">Cold</option>
                            <option value="Dead">Dead</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusBadgeClass(lead.interested)}`}>
                            {lead.interested || "Not Set"}
                          </span>
                        )}
                      </td>

                      {/* Admission Flow Stage */}
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <select value={editForm.admissionStatus} onChange={(e) => setEditForm({ ...editForm, admissionStatus: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-1.5 w-full bg-white text-xs">
                            <option value="Pending">Pending</option>
                            <option value="Admitted">Admitted</option>
                            <option value="Not Admitted">Not Admitted</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getAdmissionBadgeClass(lead.admissionStatus)}`}>
                            {lead.admissionStatus || 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Reminder Field */}
                      <td className="px-5 py-4 text-gray-600">{lead.reminder || 'No'}</td>

                      {/* Action System Buttons */}
                      <td className="px-5 py-4 text-center">
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
                              <button onClick={() => saveChanges(lead._id)} className="bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-medium flex-1">Save</button>
                              <button onClick={cancelEditing} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium flex-1">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 items-center w-full min-w-[110px]">
                            <button onClick={() => startEditing(lead)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium w-full shadow-sm">Update</button>
                            <button onClick={() => setTransferLead(lead)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-medium w-full flex items-center justify-center gap-1"><ArrowRightLeft size={12} /> Transfer</button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Desktop Expanded Drawer Details */}
                    {expandedRow === lead._id && (
                      <tr key={`${lead._id}-expanded`} className="bg-blue-50/40">
                        <td colSpan={13} className="px-5 py-4">
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

      <TransferModal
        lead={transferLead}
        onClose={() => setTransferLead(null)}
        onTransferred={fetchLeads}
      />
    </div>
  );
}