'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import {
  ChevronDown, ChevronUp, Save, X, MapPin, Mail, Upload, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from "sonner";
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
  preDemoDate?: string;
  demoDate?: string;
  salesDeck: string;
  reminder: string;
  interested?: string;
  remark?: string;
  status: string;
  photoUrl?: string[];
};

type Course = {
  _id: string;
  name: string;
  fee: string;
  duration: string;
};

export default function EnquiryTable({
  data,
  onRefresh
}: {
  data: Lead[];
  onRefresh: () => void;
}) {
  const { user } = useUser();

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Fetch courses by user's department
  useEffect(() => {
    if (user?.department) {
      fetchCourses(user.department);
    }
  }, [user?.department]);

  const fetchCourses = async (department: string) => {
    try {
      const res = await fetch(`/api/courses/by-department?department=${department}`);
      const result = await res.json();
      if (result.success) setCourses(result.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  // Fixed useMemo with proper dependencies
  const filteredData = useMemo(() => {
    if (!user || !user.department || user.role === 'admin') {
      return data;
    }

    const userDepartment = user.department.toLowerCase().trim();

    return data.filter((lead) => {
      if (!lead.department) return false;
      return lead.department.toLowerCase().trim() === userDepartment;
    });
  }, [data, user?.department, user?.role]);

  // Reset page position if dataset metrics change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length]);

  // Client-side pagination slices
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const startEditing = (lead: Lead) => {
    setEditingRow(lead._id);
    setEditForm({
      preDemoDate: lead.preDemoDate ? lead.preDemoDate.split('T')[0] : '',
      demoDate: lead.demoDate ? lead.demoDate.split('T')[0] : '',
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
    const { preDemoDate, demoDate, salesDeck, reminder, interested, remark, course } = editForm;

    // ==================== VALIDATION CHECKS ====================

    // 1. Cannot set both Pre-Demo and Demo Date at the same time
    if (preDemoDate && demoDate) {
      toast.error("❌ You cannot set both Pre-Demo and Demo Date at the same time.");
      return;
    }

    // 2. Sales Deck must be "Yes" before saving
    if (salesDeck !== "Yes") {
      toast.error("❌ Sales Deck must be send.");
      return;
    }
    if (!preDemoDate && !demoDate) {
      toast.error("❌ You must select either Pre-Demo Date or Demo Date.");
      return;
    }
    // ==================== PREPARE PAYLOAD ====================
    const payload: any = {
      preDemoDate: preDemoDate || undefined,
      demoDate: demoDate || undefined,
      salesDeck: salesDeck || 'No',
      reminder: reminder || 'No',
      interested: interested || 'Cold',
      remark: remark || '',
      course: course || undefined,
      increaseCall: true,
    };

    // Auto status logic
    if (demoDate) {
      payload.status = 'demo-day';
    } else if (preDemoDate) {
      payload.status = 'pre-demo';
    } else {
      payload.status = 'approached';
    }

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
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

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("✅ Lead Updated Successfully!");
        setEditingRow(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        onRefresh();
      } else {
        toast.error(result.message || "Failed to save changes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving");
    }
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="w-full space-y-4">
      {user?.department && user.role !== 'admin' && (
        <div className="text-sm bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl">
          Showing leads for division: <strong>{user.department}</strong>
        </div>
      )}

      {/* Mobile View */}
      <div className="block xl:hidden space-y-4">
        {paginatedData.map((lead) => {
          const isEditing = editingRow === lead._id;

          return (
            <div
              key={lead._id}
              className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 font-bold">
                      {lead.enquiryId}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900">
                    {lead.eqName}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {lead.contact}
                  </p>
                </div>

                <button
                  onClick={() => toggleRow(lead._id)}
                  className="p-2 rounded-xl bg-gray-100"
                >
                  {expandedRow === lead._id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Course */}
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Course
                  </p>

                  {isEditing ? (
                    <select
                      value={editForm.course}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          course: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                      {lead.course || "N/A"}
                    </span>
                  )}
                </div>

                {/* Pre Demo */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Pre Demo
                  </p>

                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.preDemoDate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          preDemoDate: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {lead.preDemoDate
                        ? lead.preDemoDate.split("T")[0]
                        : "—"}
                    </p>
                  )}
                </div>

                {/* Sales Deck */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Sales Deck
                  </p>

                  {isEditing ? (
                    <select
                      value={editForm.salesDeck}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          salesDeck: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        lead.salesDeck === "Yes"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lead.salesDeck}
                    </span>
                  )}
                </div>

                {/* Demo Date */}
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Demo Date
                  </p>

                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.demoDate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          demoDate: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                  ) : (
                    <p className="text-sm font-medium">
                      {lead.demoDate
                        ? lead.demoDate.split("T")[0]
                        : "—"}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Status
                  </p>

                  {isEditing ? (
                    <select
                      value={editForm.interested}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          interested: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    >
                      <option value="Hot">Hot</option>
                      <option value="Cold">Cold</option>
                      <option value="Dead">Dead</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100">
                      {lead.interested || "Not Set"}
                    </span>
                  )}
                </div>

                {/* Remark */}
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                    Remark
                  </p>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.remark}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          remark: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs"
                    />
                  ) : (
                    <p className="text-xs bg-gray-50 border rounded-xl p-3">
                      {lead.remark || "No remarks"}
                    </p>
                  )}
                </div>
              </div>

              {expandedRow === lead._id && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <div className="flex gap-2">
                    <MapPin
                      size={14}
                      className="mt-1 text-gray-400"
                    />

                    <div className="text-xs">
                      <p>{lead.address || "—"}</p>
                      <p className="font-semibold">
                        {[lead.city, lead.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Mail
                      size={14}
                      className="mt-1 text-gray-400"
                    />

                    <p className="text-xs text-blue-600 break-all">
                      {lead.email || "—"}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 pt-4 border-t">
                {isEditing ? (
                  <div className="space-y-3">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                      <Upload size={16} />
                      Upload Photo

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {previewUrl && (
                      <div className="relative w-fit mx-auto">
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="h-20 w-20 object-cover rounded-xl border"
                        />

                        <button
                          onClick={removeSelectedFile}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveChanges(lead._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white"
                      >
                        <Save size={15} />
                        Save
                      </button>

                      <button
                        onClick={cancelEditing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 border"
                      >
                        <X size={15} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(lead)}
                    className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold tracking-wider"
                  >
                    APPROACHED
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="hidden xl:block overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_5px_30px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px] table-fixed divide-y divide-slate-100">
            <thead className="bg-slate-50/70 backdrop-blur-md sticky top-0 z-20">
              <tr>
                <th className="w-[160px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Enquiry ID</th>
                <th className="w-[200px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="w-[150px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Contact</th>
                <th className="w-[160px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Course</th>
                <th className="w-[160px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Pre-Demo</th>
                <th className="w-[120px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Sales Deck</th>
                <th className="w-[180px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Demo Date</th>
                <th className="w-[160px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="w-[240px] px-6 py-5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Remark</th>
                <th className="w-[200px] px-6 py-5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedData.map((lead) => {
                const isEditing = editingRow === lead._id;
                return (
                  <Fragment key={lead._id}>
                    <tr className={`transition-colors duration-200 hover:bg-slate-50/80 ${isEditing ? 'bg-orange-50/10' : ''}`}>
                      {/* Enquiry ID */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <button onClick={() => toggleRow(lead._id)}
                          className="flex items-center gap-2.5 text-blue-600 hover:text-blue-700 font-semibold group transition-all">
                          <div className="h-8 w-8 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            {expandedRow === lead._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </div>
                          <span className="text-sm tracking-wide font-mono">{lead.enquiryId}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4.5 truncate">
                        <span className="text-slate-800 text-sm font-semibold">{lead.eqName}</span>
                      </td>

                      <td className="px-6 py-4.5 text-slate-600 text-sm font-medium whitespace-nowrap">
                        {lead.contact}
                      </td>

                      <td className="px-6 py-4.5">
                        {isEditing ? (
                          <select
                            value={editForm.course}
                            onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none"
                          >
                            <option value="">Select Course</option>
                            {courses.map(c => (
                              <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 text-xs font-bold">
                            {lead.course || 'N/A'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4.5">
                        {isEditing ? (
                          <input 
                            type="date" 
                            value={editForm.preDemoDate}
                            onChange={(e) => setEditForm({ ...editForm, preDemoDate: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none" 
                          />
                        ) : (
                          <span className="text-slate-700 text-sm font-medium">
                            {lead.preDemoDate ? lead.preDemoDate.split('T')[0] : '—'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4.5">
                        {isEditing ? (
                          <select 
                            value={editForm.salesDeck}
                            onChange={(e) => setEditForm({ ...editForm, salesDeck: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${lead.salesDeck === 'Yes' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-100 text-slate-500'}`}>
                            {lead.salesDeck}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4.5">
                        {isEditing ? (
                          <input 
                            type="date" 
                            value={editForm.demoDate}
                            onChange={(e) => setEditForm({ ...editForm, demoDate: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none" 
                          />
                        ) : (
                          <span className="text-slate-700 text-sm font-medium">
                            {lead.demoDate ? lead.demoDate.split('T')[0] : '—'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4.5">
                        {isEditing ? (
                          <select 
                            value={editForm.interested}
                            onChange={(e) => setEditForm({ ...editForm, interested: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none"
                          >
                            <option value="Hot">Hot</option>
                            <option value="Cold">Cold</option>
                            <option value="Dead">Dead</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${lead.interested === 'Interested' ? 'bg-green-100/60 text-green-800' : 'bg-red-50 text-red-700'}`}>
                            {lead.interested || 'Not Set'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4.5">
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={editForm.remark}
                            onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                            placeholder="Add remark..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none" 
                          />
                        ) : (
                          <span className="text-slate-500 text-sm block truncate max-w-[220px]" title={lead.remark}>
                            {lead.remark || '—'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4.5 text-center whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex flex-col items-center gap-3">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-all border border-blue-200 w-full justify-center">
                              <Upload size={16} /> Upload Photo
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                            {previewUrl && (
                              <div className="relative">
                                <img src={previewUrl} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-gray-300" />
                                <button onClick={removeSelectedFile} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                            <div className="flex gap-2 w-full mt-3">
                              <button onClick={() => saveChanges(lead._id)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm">
                                <Save size={14} /> Save
                              </button>
                              <button onClick={cancelEditing}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold">
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => startEditing(lead)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold tracking-wider hover:opacity-90 shadow-sm transition-all">
                            APPROACHED
                          </button>
                        )}
                      </td>
                    </tr>

                    {expandedRow === lead._id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={10} className="px-8 py-6">
                          <div className="grid grid-cols-4 gap-6">
                            {[
                              { title: "CITY", value: lead.city },
                              { title: "STATE", value: lead.state },
                              { title: "ADDRESS", value: lead.address },
                              { title: "EMAIL", value: lead.email },
                            ].map((item) => (
                              <div key={item.title} className="p-4.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">{item.title}</p>
                                <h3 className="text-slate-700 text-sm font-semibold break-words">{item.value || '—'}</h3>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No leads found for your department.
        </div>
      ) : (
        /* Unified Pagination Control Interface */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 px-2">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredData.length}</span> leads
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all duration-200 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 text-xs font-bold rounded-xl transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all duration-200 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}