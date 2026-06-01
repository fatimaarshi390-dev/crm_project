'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Upload, ArrowRightLeft } from 'lucide-react';
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

  // ── Courses state ──
  const [courses, setCourses] = useState<Course[]>([]);

  // ── Fetch courses when user department is available ──
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
      interested: lead.interested || 'Interested',
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
        toast.success("✅ Pre-Demo Lead Updated!");
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

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500">
        Loading {tabType} leads...
      </p>
    );

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[2000px] border-collapse">
        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
          <tr>
            <th className="px-5 py-4 text-left">ENQUIRY ID</th>
            <th className="px-5 py-4 text-left">NAME</th>
            <th className="px-5 py-4 text-left">CONTACT</th>
            <th className="px-5 py-4 text-left">COURSE</th>
            <th className="px-5 py-4 text-left">FOLLOW-UP DATE HISTORY</th>
            <th className="px-5 py-4 text-left">DEMO DATE HISTORY</th>
            <th className="px-5 py-4 text-left">STATUS</th>
            <th className="px-5 py-4 text-left">REMARK</th>
            <th className="px-5 py-4 text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isEditing = editingRow === lead._id;

            const preDemoHistory = lead.preDemoDateHistory ||
              [lead.preDemoExpectedDate, lead.preDemoActualDate, lead.preDemoDate].filter(Boolean);

            const demoHistory = lead.demoDateHistory ||
              (lead.demoDate ? [lead.demoDate] : []);

            return (
              <>
                <tr key={lead._id} className="border-b hover:bg-blue-50 transition-all">

                  {/* Enquiry ID */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleRow(lead._id)}
                      className="flex items-center gap-2 font-semibold text-blue-700"
                    >
                      {expandedRow === lead._id
                        ? <ChevronUp size={18} />
                        : <ChevronDown size={18} />}
                      {lead.enquiryId}
                    </button>
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4 font-semibold">{lead.eqName}</td>

                  {/* Contact */}
                  <td className="px-5 py-4">{lead.contact}</td>

                  {/* Course Dropdown */}
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        value={editForm.course}
                        onChange={(e) =>
                          setEditForm({ ...editForm, course: e.target.value })
                        }
                        className="border rounded px-3 py-1 w-full"
                      >
                        <option value="">Select Course</option>
                        {courses.map((c) => (
                          <option key={c._id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                        {lead.course || '—'}
                      </span>
                    )}
                  </td>

                  {/* Pre-Demo Date */}
                  <td className="px-5 py-4 font-medium">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={editForm.preDemoDate}
                          onChange={(e) =>
                            setEditForm({ ...editForm, preDemoDate: e.target.value })
                          }
                          className="border rounded px-3 py-1 w-full"
                        />
                        {preDemoHistory.length > 0 && (
                          <select
                            onChange={(e) =>
                              setEditForm({ ...editForm, preDemoDate: e.target.value })
                            }
                            className="border rounded px-3 py-1 w-full text-sm"
                          >
                            <option value="">Previous Pre-Demo Dates</option>
                            {preDemoHistory.map((date, idx) => (
                              <option key={idx} value={date?.split('T')[0] || ''}>
                                {formatDate(date)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      formatDate(
                        lead.preDemoExpectedDate ||
                        lead.preDemoActualDate ||
                        lead.preDemoDate
                      )
                    )}
                  </td>

                  {/* Demo Date */}
                  <td className="px-5 py-4 font-medium">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={editForm.demoDate}
                          onChange={(e) =>
                            setEditForm({ ...editForm, demoDate: e.target.value })
                          }
                          className="border rounded px-3 py-1 w-full"
                        />
                        {demoHistory.length > 0 && (
                          <select
                            onChange={(e) =>
                              setEditForm({ ...editForm, demoDate: e.target.value })
                            }
                            className="border rounded px-3 py-1 w-full text-sm"
                          >
                            <option value="">Previous Demo Dates</option>
                            {demoHistory.map((date, idx) => (
                              <option key={idx} value={date?.split('T')[0] || ''}>
                                {formatDate(date)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      formatDate(lead.demoDate)
                    )}
                  </td>

                  {/* Status / Interested */}
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        value={editForm.interested}
                        onChange={(e) =>
                          setEditForm({ ...editForm, interested: e.target.value })
                        }
                        className="border rounded px-3 py-1 w-full"
                      >
                        <option value="Hot">Hot</option>
                        <option value="Cold">Cold</option>
                        <option value="Dead">Dead</option>
                      </select>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100">
                        {lead.interested || 'Not Set'}
                      </span>
                    )}
                  </td>

                  {/* Remark */}
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.remark}
                        onChange={(e) =>
                          setEditForm({ ...editForm, remark: e.target.value })
                        }
                        placeholder="Add remark..."
                        className="border rounded px-3 py-1 w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        {lead.remark || '—'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-center">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-3">
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-all border border-blue-200">
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
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="preview"
                              className="h-20 w-20 object-cover rounded-xl border border-gray-300"
                            />
                            <button
                              onClick={removeSelectedFile}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}

                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => saveChanges(lead._id)}
                            className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-5 py-2 rounded-xl text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 items-center">
                        <button
                          onClick={() => startEditing(lead)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-medium w-full"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setTransferLead(lead)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-xl text-sm font-medium w-full flex items-center justify-center gap-1"
                        >
                          <ArrowRightLeft size={14} /> Transfer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRow === lead._id && (
                  <tr className="bg-blue-50">
                    <td colSpan={9} className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-6 rounded-2xl border">
                        <div><strong>City:</strong> {lead.city || '—'}</div>
                        <div><strong>State:</strong> {lead.state || '—'}</div>
                        <div><strong>Address:</strong> {lead.address || '—'}</div>
                        <div><strong>Email:</strong> {lead.email || '—'}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>

      <TransferModal
        lead={transferLead}
        onClose={() => setTransferLead(null)}
        onTransferred={fetchLeads}
      />
    </div>
  );
}