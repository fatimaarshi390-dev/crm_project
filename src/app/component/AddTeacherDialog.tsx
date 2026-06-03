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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface Teacher {
  _id: string;
  name: string;
  department: string;
  specialization: string;
  isActive: boolean;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

export default function AddTeacherDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showTable, setShowTable] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    specialization: "",
  });

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchTeachers();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data.filter((d: any) => d.isActive !== false));
      }
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) {
        setTeachers(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load teachers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Teacher added successfully!");
        setFormData({ name: "", department: "", specialization: "" });
        fetchTeachers(); // Refresh table
      } else {
        toast.error(data.message || "Failed to add teacher");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id: string, name: string) => {
    if (!confirm(`Delete teacher "${name}" permanently?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success("Teacher deleted successfully");
        fetchTeachers();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          + Add Teacher
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Add a new faculty member to your institute
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Teacher Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Division <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Specialization <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g. Digital Marketing, Web Development, Data Science"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Teacher"}
            </Button>
          </DialogFooter>
        </form>

        {/* ==================== TEACHERS TABLE (Same as Department) ==================== */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Registered Teachers ({teachers.length})</h3>
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
                    <th className="px-4 py-3 text-left">Teacher Name</th>
                    <th className="px-4 py-3 text-left">Division</th>
                    <th className="px-4 py-3 text-left">Specialization</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{teacher.name}</td>
                      <td className="px-4 py-3">{teacher.department}</td>
                      <td className="px-4 py-3 text-gray-600">{teacher.specialization}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTeacher(teacher._id, teacher.name)}
                          disabled={deletingId === teacher._id}
                        >
                          {deletingId === teacher._id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        No teachers registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}