'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface Division {
  _id: string;
  divisionName: string;
  departmentName: string;
  roles: string[];
  isActive: boolean;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export default function AddDivisionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);

  const [formData, setFormData] = useState({
    divisionName: "",
    departmentName: "",     // Will store selected department name
    roles: [] as string[],
  });

  const [newRole, setNewRole] = useState("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch both Divisions and Departments
  useEffect(() => {
    if (open) {
      fetchDivisions();
      fetchDepartments();
    }
  }, [open]);

  const fetchDivisions = async () => {
    try {
      const res = await fetch('/api/division');
      const data = await res.json();
      if (data.success) setDivisions(data.data || []);
    } catch (error) {
      toast.error("Failed to load divisions");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data.filter((d: Department) => d.isActive) || []);
      }
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.divisionName || !formData.departmentName) {
      toast.error("Division Name and Department are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/division', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Division added successfully!");
        resetForm();
        fetchDivisions();
      } else {
        toast.error(data.message || "Failed to add division");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ divisionName: "", departmentName: "", roles: [] });
    setNewRole("");
  };

  const addRole = () => {
    if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, newRole.trim()]
      }));
      setNewRole("");
    }
  };

  const removeRole = (roleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role !== roleToRemove)
    }));
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/division/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Division ${!currentStatus ? 'Activated' : 'Deactivated'}`);
        fetchDivisions();
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const deleteDivision = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/division/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success("Division deleted successfully");
        fetchDivisions();
      }
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-black text-white">
          + Add Department
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Division</DialogTitle>
          <DialogDescription>
            Create and manage divisions with departments and roles
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Department Name *</Label>
              <Input
                placeholder="e.g., Technical"
                value={formData.divisionName}
                onChange={(e) => setFormData({ ...formData, divisionName: e.target.value })}
                required
              />
            </div>

            {/* Department Dropdown */}
            <div>
              <Label>Division *</Label>
              <select
                value={formData.departmentName}
                onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roles Section */}
          {/* <div>
            <Label>Roles</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add role (e.g., Trainer, Manager)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              />
              <Button type="button" onClick={addRole}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {formData.roles.map((role, idx) => (
                <div key={idx} className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm">
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="text-blue-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          {/* Divisions Table */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Registered Departments ({divisions.length})</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTable(!showTable)}
              >
                {showTable ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showTable ? "Hide Table" : "Show Table"}
              </Button>
            </div>

            {showTable && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Department Name</th>
                      <th className="px-4 py-3 text-left">Division</th>
                      {/* <th className="px-4 py-3 text-left">Roles</th> */}
                      {/* <th className="px-4 py-3 text-center">Status</th> */}
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {divisions.map((div) => (
                      <tr key={div._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{div.divisionName}</td>
                        <td className="px-4 py-3">{div.departmentName}</td>
                        {/* <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {div.roles?.map((role, i) => (
                              <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">
                                {role}
                              </span>
                            ))}
                          </div>
                        </td> */}
                        <td className="px-4 py-3 text-center">
                           <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDivision(div._id, div.divisionName)}
                            disabled={actionId === div._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(div._id, div.isActive)}
                            disabled={actionId === div._id}
                          >
                            {div.isActive ? (
                              <span className="text-green-600">🟢 Active</span>
                            ) : (
                              <span className="text-red-600">🔴 Inactive</span>
                            )}
                          </Button> */}
                        </td>
                        <td className="px-4 py-3 text-center">
                         
                        </td>
                      </tr>
                    ))}
                    {divisions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          No divisions registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Division"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}