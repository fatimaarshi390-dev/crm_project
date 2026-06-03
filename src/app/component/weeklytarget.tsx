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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function WeeklyTargetDialog() {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    month: "",
    weekNumber: "",
    targetCalls: "",
    targetAdmissions: "",
    targetRevenue: "",
    targetCollection: "",
  });

  const [targets, setTargets] = useState<any[]>([]);
  const [filteredTargets, setFilteredTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTable, setShowTable] = useState(true);

  // Filter States
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterMonth, setFilterMonth] = useState("");
  const [filterWeek, setFilterWeek] = useState("");

  const years = [currentYear, currentYear - 1, currentYear - 2];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // Fetch previous targets
  const fetchPreviousTargets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weekly-targets');
      const data = await res.json();
      if (data.success) {
        setTargets(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch targets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousTargets();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...targets];

    if (filterYear) result = result.filter(t => t.year.toString() === filterYear);
    if (filterMonth) result = result.filter(t => t.month === filterMonth);
    if (filterWeek) result = result.filter(t => t.weekNumber.toString() === filterWeek);

    setFilteredTargets(result);
  }, [targets, filterYear, filterMonth, filterWeek]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/weekly-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, year: currentYear }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Weekly Target Added Successfully!");
        setFormData({ month: "", weekNumber: "", targetCalls: "", targetAdmissions: "", targetRevenue: "", targetCollection: "" });
        fetchPreviousTargets();
      } else {
        toast.error(data.message || "Failed to add target");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Weekly Target</Button>
      </DialogTrigger>

      <DialogContent
  className="overflow-y-auto p-6"
  style={{
    width: "80vw",
    maxWidth: "80vw",
    height: "80vh",
  }}
>
        <DialogHeader>
          <DialogTitle className="text-2xl">Set Weekly Target</DialogTitle>
          <DialogDescription>
            {currentYear} - Set and manage your weekly targets
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        

        {/* Toggle Button */}
        

        {/* Table */}
       

        {/* Add New Target Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Year</Label>
              <Input value={currentYear} disabled className="bg-gray-100" />
            </div>

            <div>
              <Label htmlFor="month">Month <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => setFormData({ ...formData, month: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weekNumber">Week <span className="text-red-500">*</span></Label>
              <Select onValueChange={(value) => setFormData({ ...formData, weekNumber: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Week" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(w => (
                    <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetCalls">Total Calls</Label>
              <Input type="number" placeholder="0" value={formData.targetCalls} onChange={(e) => setFormData({...formData, targetCalls: e.target.value})} />
            </div>

            <div>
              <Label htmlFor="targetAdmissions">Total Admissions</Label>
              <Input type="number" placeholder="0" value={formData.targetAdmissions} onChange={(e) => setFormData({...formData, targetAdmissions: e.target.value})} />
            </div>

            <div>
              <Label htmlFor="targetRevenue">Total Revenue (₹)</Label>
              <Input type="number" placeholder="0" value={formData.targetRevenue} onChange={(e) => setFormData({...formData, targetRevenue: e.target.value})} />
            </div>

            <div className="md:col-span-3">
              <Label htmlFor="targetCollection">Total Collection (₹)</Label>
              <Input type="number" placeholder="0" value={formData.targetCollection} onChange={(e) => setFormData({...formData, targetCollection: e.target.value})} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving Target..." : "Save Target"}
            </Button>
          </DialogFooter>
        </form>
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border">
          <div className="flex-1 min-w-[160px]">
            <Label>Year</Label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <Label>Month</Label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Months</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <Label>Week</Label>
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger>
                <SelectValue placeholder="All Weeks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Weeks</SelectItem>
                {[1, 2, 3, 4, 5].map((w) => (
                  <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
         <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Your Previous Targets</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2"
          >
            {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showTable ? "Hide Table" : "Show Table"}
          </Button>
        </div>
         {showTable && (
          <div className="mb-8">
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Week</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Admissions</TableHead>
                    <TableHead className="text-right">Revenue (₹)</TableHead>
                    <TableHead className="text-right">Collection (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">Loading targets...</TableCell>
                    </TableRow>
                  ) : filteredTargets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                        No targets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTargets.map((target, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{target.year}</TableCell>
                        <TableCell>{target.month}</TableCell>
                        <TableCell>Week {target.weekNumber}</TableCell>
                        <TableCell className="text-right font-medium">{target.targetCalls}</TableCell>
                        <TableCell className="text-right font-medium">{target.targetAdmissions}</TableCell>
                        <TableCell className="text-right font-medium">{target.targetRevenue}</TableCell>
                        <TableCell className="text-right font-medium">{target.targetCollection}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}