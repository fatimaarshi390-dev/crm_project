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
  contact: string;               // ← Already present
  course?: string;
  demoDoneBy?: string;
  department?: string;
  city?: string;
  state?: string;
  address?: string;
  email?: string;
  postDemoDate?: string;
  admissionStatus?: string;
  remark?: string;
  interested?: string;
  status: string;
  postDemoDateHistory?: string[];
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

export default function PostDemoLeadsTable() {
  const { user } = useUser();

  const [transferLead, setTransferLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      const res = await fetch('/api/leads?status=post-demo');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load Post-Demo leads");
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
      postDemoDate: lead.postDemoDate ? lead.postDemoDate.split('T')[0] : '',
      interested: lead.interested || 'Hot',
      admissionStatus: lead.admissionStatus || 'Pending',
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
      postDemoDate: editForm.postDemoDate,
      interested: editForm.interested || 'Hot',
      admissionStatus: editForm.admissionStatus,
      remark: editForm.remark,
      course: editForm.course || undefined,
    };

    const currentLead = leads.find(l => l._id === id);
    const postDemoHistoryCount = currentLead?.postDemoDateHistory?.length || 0;

    if (editForm.postDemoDate && postDemoHistoryCount >= 10) {
      toast.error("Maximum 10 Post-Demo date changes allowed!");
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

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500">
        Loading Post-Demo leads...
      </p>
    );

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[1700px] border-collapse">
        <thead className="sticky top-0 z-10 bg-gradient-to-r from-purple-900 to-indigo-700 text-white">
          <tr>
            <th className="px-5 py-4 text-left">ENQUIRY ID</th>
            <th className="px-5 py-4 text-left">NAME</th>
            <th className="px-5 py-4 text-left">COURSE</th>
            <th className="px-5 py-4 text-left">CONTACT</th>           {/* ← New Column */}
            <th className="px-5 py-4 text-left">DEMO DONE BY</th>
            <th className="px-5 py-4 text-left">POST-DEMO DATE HISTORY</th>
            <th className="px-5 py-4 text-left">STATUS</th>
            <th className="px-5 py-4 text-left">ADMISSION STATUS</th>
            <th className="px-5 py-4 text-left">REMARK</th>
            <th className="px-5 py-4 text-center">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const isEditing = editingRow === lead._id;
            const historyDates = lead.postDemoDateHistory ||
              (lead.postDemoDate ? [lead.postDemoDate] : []);

            return (
              <>
                <tr key={lead._id} className="border-b hover:bg-purple-50 transition-all">

                  <td className="px-5 py-4 font-semibold">{lead.enquiryId}</td>
                  <td className="px-5 py-4 font-semibold">{lead.eqName}</td>

                  {/* Course */}
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

                  {/* Contact Number - New */}
                  <td className="px-5 py-4 font-medium text-gray-800">
                    {lead.contact || '—'}
                  </td>

                  {/* Demo Done By */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {lead.demoDoneBy || '—'}
                    </span>
                  </td>

                  {/* Post-Demo Date + History */}
                  <td className="px-5 py-4 font-medium">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={editForm.postDemoDate}
                          onChange={(e) =>
                            setEditForm({ ...editForm, postDemoDate: e.target.value })
                          }
                          className="border rounded px-3 py-1 w-full"
                        />
                        {historyDates.length > 0 && (
                          <select
                            onChange={(e) =>
                              setEditForm({ ...editForm, postDemoDate: e.target.value })
                            }
                            className="border rounded px-3 py-1 w-full text-sm"
                          >
                            <option value="">Previous Post-Demo Dates</option>
                            {historyDates.map((date, idx) => (
                              <option key={idx} value={date?.split('T')[0] || ''}>
                                {formatDate(date)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      formatDate(lead.postDemoDate)
                    )}
                  </td>
                                      <td className="px-5 py-4">
            {/* <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Status
            </p> */}

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
          </td>
                  {/* Admission Status */}
                  <td className="px-5 py-4">
                    {isEditing ? (
                      <select
                        value={editForm.admissionStatus}
                        onChange={(e) =>
                          setEditForm({ ...editForm, admissionStatus: e.target.value })
                        }
                        className="border rounded px-3 py-1 w-full"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Not Admitted">Not Admitted</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        lead.admissionStatus === 'Admitted'
                          ? 'bg-green-100 text-green-700'
                          : lead.admissionStatus === 'Not Admitted'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lead.admissionStatus || 'Pending'}
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
                      lead.remark || '—'
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
                          <ArrowRightLeft size={14} />
                          Transfer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRow === lead._id && (
                  <tr className="bg-blue-50">
                    <td colSpan={9} className="p-6">   {/* Updated colSpan */}
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