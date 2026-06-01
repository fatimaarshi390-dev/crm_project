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
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface Role {
  _id: string;
  roleName: string;
}

interface Division {
  _id: string;
  divisionName: string;
}

export default function AddMemberDialog() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    password: "",
    role: "",
    division: "",
    department: "",
    joiningDate: "",
    salary: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [addingRole, setAddingRole] = useState(false);

  // Fetch all required data
  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchDivisions();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data.filter((d: Department) => d.isActive !== false));
      }
    } catch (error) {
      toast.error("Failed to load departments");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success) setRoles(data.data || []);
    } catch (error) {
      toast.error("Failed to load roles");
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await fetch('/api/division');
      const data = await res.json();
      if (data.success) setDivisions(data.data || []);
    } catch (error) {
      toast.error("Failed to load divisions");
    }
  };

  // Quick Add Role
//  const addQuickRole = async () => {
//   if (!newRoleName.trim()) {
//     toast.error("Role name is required");
//     return;
//   }

//   // Get first division if none selected
//   const selectedDivision = formData.division || divisions[0]?._id;

//   if (!selectedDivision) {
//     toast.error("Please select a Division first or create one");
//     return;
//   }

//   setAddingRole(true);
//   try {
//     const res = await fetch('/api/roles', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         roleName: newRoleName.trim(),
//         division: selectedDivision,           // ← Fixed
//         departmentName: "General",
//         description: "Added via quick add",
//       }),
//     });

//     const data = await res.json();
//     if (data.success) {
//       toast.success("New Role Added Successfully!");
//       setNewRoleName("");
//       setShowRoleModal(false);
//       fetchRoles();           // Refresh dropdown
//     } else {
//       toast.error(data.message || "Failed to add role");
//     }
//   } catch (error) {
//     toast.error("Something went wrong");
//   } finally {
//     setAddingRole(false);
//   }
// };
// Quick Add Role (Division Check Removed)
const addQuickRole = async () => {
  if (!newRoleName.trim()) {
    toast.error("Role name is required");
    return;
  }

  setAddingRole(true);
  try {
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roleName: newRoleName.trim(),
        division: formData.division || null,        // Can be empty now
        departmentName: "General",
        description: "Added via quick add from member form",
      }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("New Role Added Successfully!");
      setNewRoleName("");
      setShowRoleModal(false);
      fetchRoles();        // Refresh roles list
    } else {
      toast.error(data.message || "Failed to add role");
    }
  } catch (error) {
    toast.error("Something went wrong");
  } finally {
    setAddingRole(false);
  }
};
const deleteRole = async (id: string, roleName: string) => {
  if (!confirm(`Delete role "${roleName}"?`)) return;

  try {
    const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      toast.success(`Role "${roleName}" deleted`);
      fetchRoles();        // Refresh list
    } else {
      toast.error(data.message || "Failed to delete role");
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Member added successfully!");
        // Reset form
        setFormData({
          name: "", email: "", phone: "", employeeId: "", password: "",
          role: "", division: "", department: "", joiningDate: "", salary: ""
        });
      } else {
        toast.error(data.message || "Failed to add member");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Member</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Add a new team member to your CRM system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="col-span-2">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="col-span-2">
              <Label>Email Address <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                placeholder="member@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Phone & Employee ID */}
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Employee ID <span className="text-red-500">*</span></Label>
              <Input
                placeholder="EMP001"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
              />
            </div>

            {/* Salary */}
            <div className="col-span-2">
              <Label>Monthly Salary (₹)</Label>
              <Input
                type="number"
                placeholder="25000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="col-span-2">
              <Label>Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Role with Quick Add */}
          {/* Role Section with Delete Option */}
<div className="col-span-2">
  <Label>Role <span className="text-red-500">*</span></Label>
  
  <div className="flex gap-2 mb-3">
    {/* Role Dropdown */}
    <Select 
      value={formData.role} 
      onValueChange={(value) => setFormData({ ...formData, role: value })}
      required
    >
      <SelectTrigger className="flex-1">
        <SelectValue placeholder="Select Role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role._id} value={role.roleName}>
            {role.roleName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Quick Add Button */}
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setShowRoleModal(true)}
    >
      <Plus size={20} />
    </Button>
  </div>

  {/* Roles List with Delete Button */}
  <div className="flex flex-wrap gap-2">
    {roles.map((role) => (
      <div
        key={role._id}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-sm px-3 py-1.5 rounded-full group"
      >
        <span>{role.roleName}</span>
        <button
          type="button"
          onClick={() => deleteRole(role._id, role.roleName)}
          className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
</div>
            {/* Division */}
            <div className="col-span-2 md:col-span-1">
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
                  {divisions.map((div) => (
                    <SelectItem key={div._id} value={div.divisionName}>
                      {div.divisionName} ({div.departmentName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="col-span-2">
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

            {/* Joining Date */}
            <div className="col-span-2">
              <Label>Joining Date</Label>
              <Input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Quick Add Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>Quickly add a new role</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Role Name *</Label>
            <Input
              placeholder="e.g., Senior Counsellor"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addQuickRole()}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button onClick={addQuickRole} disabled={addingRole}>
              {addingRole ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}