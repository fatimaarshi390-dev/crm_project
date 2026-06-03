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
import { Trash2, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export default function AddDepartmentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [showTable, setShowTable] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Fetch departments when dialog opens
  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Department added successfully!");
        setFormData({ name: "", code: "", description: "" });
        fetchDepartments(); // Refresh table
      } else {
        toast.error(data.message || "Failed to add department");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Department ${!currentStatus ? 'Activated' : 'Deactivated'}`);
        fetchDepartments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const deleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success("Department deleted successfully");
        fetchDepartments();
      } else {
        toast.error(data.message || "Failed to delete department");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-black text-white">
          + Add Division
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Division</DialogTitle>
          <DialogDescription>
            Create a new division for your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Division Name *</Label>
              <Input
                placeholder=""
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Division Code *</Label>
              <Input
                placeholder=""
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Departments Table */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Registered Division ({departments.length})</h3>
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
                      <th className="px-4 py-3 text-left">Division Name</th>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {departments.map((dept) => (
                      <tr key={dept._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{dept.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{dept.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{dept.description || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatus(dept._id, dept.isActive)}
                            disabled={actionId === dept._id}
                          >
                            {dept.isActive ? (
                              <span className="text-green-600">🟢 Active</span>
                            ) : (
                              <span className="text-red-600">🔴 Inactive</span>
                            )}
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDepartment(dept._id, dept.name)}
                            disabled={actionId === dept._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          No division registered yet
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