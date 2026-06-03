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

type Division = {
  _id: string;
  divisionName: string;
  departmentName: string;
};

type Role = {
  _id: string;
  roleName: string;
};

type Props = {
  lead: { _id: string; eqName: string; department?: string } | null;
  onClose: () => void;
  onTransferred: () => void;
};

export default function TransferModal({ lead, onClose, onTransferred }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // Filter state
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedDept, setSelectedDept] = useState('');   // departmentName from division API
  const [selectedDiv, setSelectedDiv] = useState('');     // divisionName from division API
  const [selectedRole, setSelectedRole] = useState('');

  // Derived: unique dept list from divisions
  const deptOptions = Array.from(
    new Set(divisions.map(d => d.departmentName))
  );

  // Derived: divisions filtered by selected dept
  const divisionOptions = divisions.filter(
    d => !selectedDept || d.departmentName === selectedDept
  );

  useEffect(() => {
    if (!lead) return;
    fetchDivisions();
    fetchRoles();
  }, [lead]);

  // Fetch employees whenever any filter changes
  useEffect(() => {
    if (!lead) return;
    fetchEmployees();
  }, [selectedDept, selectedDiv, selectedRole]);

  const fetchDivisions = async () => {
    try {
      const res = await fetch('/api/division');
      const data = await res.json();
      if (data.success) setDivisions(data.data || []);
    } catch {
      toast.error('Failed to load divisions');
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success) setRoles(data.data || []);
    } catch {
      toast.error('Failed to load roles');
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.set('department', selectedDept);
      if (selectedDiv) params.set('division', selectedDiv);
      if (selectedRole) params.set('role', selectedRole);

      const res = await fetch(
        `/api/admin/employees/by-department?${params.toString()}`
      );
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
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        {/* Lead Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm text-blue-600 font-medium">Transferring Lead</p>
          <p className="text-base font-semibold text-blue-900">{lead.eqName}</p>
        </div>

        {/* ── Filters ── */}
        <div className="space-y-3 mb-5">

          {/* Department filter — data from division API */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Divison
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedDiv('');
                setSelectedEmp('');
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">All Divisions</option>
              {deptOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Division filter — data from division API, filtered by dept */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Department
            </label>
            <select
              value={selectedDiv}
              onChange={(e) => { setSelectedDiv(e.target.value); setSelectedEmp(''); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">All Departments</option>
              {divisionOptions.map((div) => (
                <option key={div._id} value={div.divisionName}>
                  {div.divisionName}
                </option>
              ))}
            </select>
          </div>

          {/* Role filter — data from role API */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setSelectedEmp(''); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r._id} value={r.roleName}>{r.roleName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee List */}
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
            <p className="text-sm text-gray-400 py-2">
              No employees found for selected filters.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedEmp || transferring}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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