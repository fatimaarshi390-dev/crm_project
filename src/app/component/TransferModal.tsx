'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

type Employee = {
  employeeId: string;
  name: string;
  role: string;
  department?: string;
};

type Props = {
  lead: { _id: string; eqName: string; department?: string } | null;
  onClose: () => void;
  onTransferred: () => void;
};

export default function TransferModal({ lead, onClose, onTransferred }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (!lead) return;
    fetchEmployees();
  }, [lead]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const deptParam = lead?.department
        ? `?department=${encodeURIComponent(lead.department)}`
        : '';
      const res = await fetch(`/api/admin/employees/by-department${deptParam}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data || []);
      } else {
        toast.error('Failed to load employees');
      }
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedEmp) {
      toast.error('Please select an employee');
      return;
    }

    const emp = employees.find(e => e.employeeId === selectedEmp);
    if (!emp) return;

    setTransferring(true);
    try {
      const res = await fetch('/api/leads/transfer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?._id,
          toEmpId: emp.employeeId,
          toEmpName: emp.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Lead transferred to ${emp.name}!`);
        onTransferred();
        onClose();
      } else {
        toast.error(data.message || 'Transfer failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setTransferring(false);
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Transfer Lead</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lead Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-blue-600 font-medium">Transferring Lead</p>
          <p className="text-base font-semibold text-blue-900">{lead.eqName}</p>
          {lead.department && (
            <p className="text-xs text-blue-400 mt-0.5">
              Department: {lead.department}
            </p>
          )}
        </div>

        {/* Employee Select */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer To
          </label>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
              <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <p className="text-sm text-red-400 py-2">
              No other employees found in this department.
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {employees.map((emp) => (
                <label
                  key={emp.employeeId}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedEmp === emp.employeeId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="employee"
                    value={emp.employeeId}
                    checked={selectedEmp === emp.employeeId}
                    onChange={() => setSelectedEmp(emp.employeeId)}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-400">
                      {emp.employeeId} • {emp.role}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedEmp || transferring}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {transferring ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft size={15} />
                Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}