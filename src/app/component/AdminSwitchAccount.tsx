'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, LogOut } from 'lucide-react';

export default function AdminSwitchAccount() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/admin/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const switchAccount = async (employeeId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Switched to ${data.user.name}`);
        setIsImpersonating(true);
        
        // Auto Route to Employee Dashboard
        router.push('/dashboard/sales');           // Main dashboard (role-based rendering)
        router.refresh();           // Force refresh to load new user context
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to switch account");
    } finally {
      setLoading(false);
    }
  };

  const exitImpersonation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "exit" }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Exited impersonation mode");
        setIsImpersonating(false);
        router.push('/');           // Back to Admin Dashboard
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to exit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isImpersonating && (
        <Button 
          onClick={exitImpersonation} 
          variant="destructive" 
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Exit Impersonation
        </Button>
      )}

      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <Select onValueChange={switchAccount} disabled={loading}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Switch to Employee Dashboard" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId}) — {emp.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}