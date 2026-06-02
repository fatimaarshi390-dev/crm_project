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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Pencil } from "lucide-react";

interface Course {
  _id: string;
  name: string;
  duration: string;
  division?: string;
  department: string;
  syllabus: string;
  faculty: string;
  fee: string;
  isActive: boolean;
}

interface Division {
  _id: string;
  divisionName: string;
  departmentName: string;
  isActive: boolean;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  isActive?: boolean;
}

interface Teacher {
  _id: string;
  name: string;
  department: string;
  specialization: string;
}

export default function AddCourseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    division: "",
    department: "",
    syllabus: "",
    faculty: "",
    fee: "",
  });

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      fetchDepartments();
      fetchDivisions();
      fetchTeachers();
      fetchCourses();
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

  const fetchDivisions = async () => {
    try {
      const res = await fetch('/api/division');
      const data = await res.json();
      if (data.success) setDivisions(data.data || []);
    } catch (error) {
      toast.error("Failed to load division");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) setTeachers(data.data || []);
    } catch (error) {
      toast.error("Failed to load teachers");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.data || []);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  // Cascading Logic: Department → Division
  useEffect(() => {
    if (formData.department) {
      const matchedDivisions = divisions.filter(
        (div) => div.departmentName === formData.department
      );
      setFilteredDivisions(matchedDivisions);

      // Auto select first division if only one
      if (matchedDivisions.length === 1) {
        setFormData((prev) => ({
          ...prev,
          division: matchedDivisions[0].divisionName,
        }));
      } else {
        setFormData((prev) => ({ ...prev, division: "" }));
      }
    } else {
      setFilteredDivisions([]);
      setFormData((prev) => ({ ...prev, division: "" }));
    }
  }, [formData.department, divisions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editingCourse ? 'PATCH' : 'POST';
      const url = editingCourse 
        ? `/api/courses/${editingCourse._id}` 
        : '/api/courses';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingCourse ? "Course updated successfully!" : "Course added successfully!");
        resetForm();
        fetchCourses();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      duration: "",
      division: "",
      department: "",
      syllabus: "",
      faculty: "",
      fee: "",
    });
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      duration: course.duration,
      division: course.division || "",
      department: course.department,
      syllabus: course.syllabus,
      faculty: course.faculty,
      fee: course.fee,
    });
  };

  const deleteCourse = async (id: string, name: string) => {
    if (!confirm(`Delete course "${name}"?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success("Course deleted successfully");
        fetchCourses();
      } else {
        toast.error(data.message);
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
        <Button variant="outline" className="flex items-center gap-2">
          + Add Course
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
          <DialogDescription>
            {editingCourse ? "Update course details" : "Create a new course"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Course Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Digital Marketing Mastery"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Duration <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. 6 Months"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Fee <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. 15000"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Dropdown (Main) */}
            <div>
              <Label>Department <span className="text-red-500">*</span></Label>
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

            {/* Division Dropdown (Cascading from Department) */}
            <div>
              <Label>Division <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.division} 
                onValueChange={(value) => setFormData({ ...formData, division: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDivisions.length > 0 ? (
                    filteredDivisions.map((div) => (
                      <SelectItem key={div._id} value={div.divisionName}>
                        {div.divisionName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>Select Department first</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Faculty / Trainer */}
            <div>
              <Label>Faculty / Trainer <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.faculty} 
                onValueChange={(value) => setFormData({ ...formData, faculty: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher.name}>
                      {teacher.name} ({teacher.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Syllabus <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Enter detailed syllabus..."
              value={formData.syllabus}
              onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
              rows={5}
              required
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setOpen(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </DialogFooter>
        </form>

        {/* Table Section */}
        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">All Courses ({courses.length})</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTable(!showTable)}
            >
              {showTable ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showTable ? "Hide" : "Show"} Table
            </Button>
          </div>

          {showTable && (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Course Name</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Division</th>
                    <th className="px-4 py-3 text-left">Faculty</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{course.name}</td>
                      <td className="px-4 py-3">{course.duration}</td>
                      <td className="px-4 py-3">{course.department}</td>
                      <td className="px-4 py-3">{course.division || '—'}</td>
                      <td className="px-4 py-3">{course.faculty}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteCourse(course._id, course.name)} disabled={actionId === course._id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No courses found
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