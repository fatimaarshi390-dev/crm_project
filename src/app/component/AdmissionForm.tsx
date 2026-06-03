'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit3, Search, X, CheckCircle2, ShieldAlert, CreditCard, BookOpen, Phone, Calendar } from 'lucide-react';
import { useUser } from '@/app/component/context/user-context';

type Lead = {
  _id: string;
  eqId: string;
  eqName: string;
  contact?: string;
  course?: string;
  software?: string;
  fee?: number;
  remark?: string;
  city?: string;
  state?: string;
};

type Installment = {
  amount: number;
};

export default function AdmissionForm() {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isExistingRecord, setIsExistingRecord] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    courseOrSoftware: '',
    fee: '',
    discountPercent: '',
    discountAmount: '',
    noOfInstallments: '',
    remark: '',
  });

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentPaid, setInstallmentPaid] = useState<boolean[]>([]);
  const [paidDates, setPaidDates] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(() => searchLeads(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchLeads = async (query: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/leads?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.success) {
        const admittedLeads = (data.data || []).filter((lead: any) => 
          lead.status === 'admission' || lead.admissionStatus === 'Admitted'
        );
        setSearchResults(admittedLeads);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error(error);
      toast.error('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadExistingAdmission = async (eqId: string) => {
    try {
      const res = await fetch(`/api/admissions?eqId=${eqId}`);
      const result = await res.json();

      if (result.success && result.data) {
        const data = result.data;

        setFormData({
          id: data.eqId,
          name: data.eqName || '',
          courseOrSoftware: data.course || data.software || '',
          fee: data.fee?.toString() || data.baseFee?.toString() || '',
          discountPercent: data.discountPercent?.toString() || '',
          discountAmount: data.afterDiscount?.toString() || '',
          noOfInstallments: data.noOfInstallments?.toString() || '',
          remark: data.remark || '',
        });

        setInstallments(
          data.installmentAmounts?.map((amt: number) => ({ amount: amt })) || []
        );
        setInstallmentPaid(data.installmentPaid || []);
        setPaidDates(data.paidDates || []);
        setIsExistingRecord(true);
        toast.success('Existing admission record loaded!');
      } else {
        setIsExistingRecord(false);
        resetInstallments();
      }
    } catch (error) {
      toast.error('Failed to load existing record');
      setIsExistingRecord(false);
    }
  };

  const resetInstallments = () => {
    setInstallments([]);
    setInstallmentPaid([]);
    setPaidDates([]);
  };

  const resetForm = () => {
    setFormData({
      id: '', name: '', courseOrSoftware: '',
      fee: '', discountPercent: '', discountAmount: '',
      noOfInstallments: '', remark: '',
    });
    resetInstallments();
    setIsExistingRecord(false);
    setIsEditing(false);
  };

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setSearchQuery(`${lead.eqName}${lead.contact ? ' - ' + lead.contact : ''}`);
    setShowDropdown(false);
    setFormData(prev => ({
      ...prev,
      id: lead.eqId,
      name: lead.eqName || '',
      courseOrSoftware: lead.course || lead.software || '',
      fee: lead.remark?.toString() || '',
      remark: lead.remark || '',
    }));
    loadExistingAdmission(lead.eqId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLead(null);
    setShowDropdown(false);
    setSearchResults([]);
    resetForm();
  };

  const handleChange = (field: string, value: string) => {
    let updated = { ...formData, [field]: value };

    if (field === 'discountPercent' && !isAdmin) {
      let discount = parseFloat(value) || 0;
      if (discount > 10) {
        discount = 10;
        toast.info("Maximum 10% discount allowed (Non-Admin). Value capped at 10%.");
      }
      updated.discountPercent = discount.toString();
    }

    if (field === 'noOfInstallments' && !isAdmin) {
      let count = parseInt(value) || 0;
      if (count > 5) {
        count = 5;
        toast.info("Maximum 5 installments allowed (Non-Admin). Value capped at 5.");
      }
      updated.noOfInstallments = count.toString();
    }

    if (field === 'fee' || field === 'discountPercent') {
      const fee = parseFloat(updated.fee) || 0;
      const discountPercent = parseFloat(updated.discountPercent) || 0;
      updated.discountAmount = (fee - (fee * discountPercent) / 100).toFixed(2);
    }

    setFormData(updated);
  };

  useEffect(() => {
    if (isExistingRecord) return;

    const totalAmount = parseFloat(formData.discountAmount) || 0;
    let count = parseInt(formData.noOfInstallments) || 0;

    if (!isAdmin && count > 5) count = 5;

    if (count > 0 && totalAmount > 0) {
      const equalAmount = Math.floor((totalAmount * 100) / count) / 100;
      const generated = Array(count).fill(0).map(() => ({ amount: equalAmount }));

      const diff = Number((totalAmount - equalAmount * count).toFixed(2));
      if (generated.length > 0) generated[generated.length - 1].amount += diff;

      setInstallments(generated);
      setInstallmentPaid(Array(count).fill(false));
      setPaidDates(Array(count).fill(''));
    } else {
      resetInstallments();
    }
  }, [formData.discountAmount, formData.noOfInstallments, isExistingRecord, user]);

  const isMoreThanHalfPaid =
    installmentPaid.filter(Boolean).length >= Math.ceil(installments.length / 2);

  const togglePaid = async (index: number) => {
    const newPaid = [...installmentPaid];
    const newDates = [...paidDates];

    const wasPaid = newPaid[index];
    newPaid[index] = !wasPaid;
    newDates[index] = !wasPaid ? new Date().toISOString().split('T')[0] : '';

    setInstallmentPaid(newPaid);
    setPaidDates(newDates);

    const amount = installments[index].amount;
    const change = wasPaid ? -amount : amount;

    try {
      await fetch('/api/weekly-targets/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: change }),
      });
    } catch (e) {
      console.error('Failed to update weekly target');
    }
  };

  const handleInstallmentChange = (index: number, value: string) => {
    if (installmentPaid[index] || (index === installments.length - 1 && isMoreThanHalfPaid)) {
      return;
    }

    const updatedInstallments = [...installments];
    const newValue = parseFloat(value) || 0;
    updatedInstallments[index].amount = newValue;

    const totalAmount = parseFloat(formData.discountAmount) || 0;
    let fixedAmount = 0;

    updatedInstallments.forEach((item, i) => {
      if (i <= index || installmentPaid[i]) {
        fixedAmount += item.amount;
      }
    });

    const remainingAmount = totalAmount - fixedAmount;
    const editableIndexes: number[] = [];

    for (let i = index + 1; i < updatedInstallments.length; i++) {
      if (!installmentPaid[i]) editableIndexes.push(i);
    }

    if (editableIndexes.length > 0) {
      const equalAmount = Number((remainingAmount / editableIndexes.length).toFixed(2));
      editableIndexes.forEach(i => {
        updatedInstallments[i].amount = equalAmount;
      });

      const finalTotal = updatedInstallments.reduce((sum, item) => sum + item.amount, 0);
      const diff = Number((totalAmount - finalTotal).toFixed(2));
      updatedInstallments[editableIndexes[editableIndexes.length - 1]].amount += diff;
    }

    setInstallments(updatedInstallments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) {
      toast.error('Please select a lead first');
      return;
    }

    const payload = {
      eqId: formData.id,
      name: formData.name,
      course: formData.courseOrSoftware,
      fee: Number(formData.fee),
      baseFee: Number(formData.fee),
      discountPercent: Number(formData.discountPercent),
      afterDiscount: Number(formData.discountAmount),
      noOfInstallments: Number(formData.noOfInstallments),
      installmentAmounts: installments.map(i => i.amount),
      installmentPaid,
      paidDates,
      remark: formData.remark,
    };

    try {
      const method = isExistingRecord ? 'PATCH' : 'POST';
      const res = await fetch('/api/admissions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isExistingRecord ? 'Admission Updated!' : 'Admission Saved Successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <Card className="shadow-xl border border-gray-150/80 overflow-hidden bg-white rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Sales Ledger
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Process leads details, configure active discounts, and schedule dynamic installments.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ── Search Bar Section ── */}
            <div className="relative space-y-2 bg-slate-50/50 p-4 rounded-xl border border-dashed border-gray-200" ref={dropdownRef}>
              <Label className="text-xs font-bold tracking-wider text-gray-500 uppercase flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-blue-500" />
                Find Admitted Lead *
              </Label>
              <div className="relative mt-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (selectedLead) {
                      setSelectedLead(null);
                      resetForm();
                    }
                  }}
                  placeholder="Type student name or phone number..."
                  className="pr-10 h-11 rounded-xl shadow-sm border-gray-200 focus-visible:ring-blue-500"
                />

                {searchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {(searchQuery || selectedLead) && !searchLoading && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-gray-100 p-1 rounded-full transition-colors duration-150"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200/90 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((lead) => (
                      <button
                        key={lead._id}
                        type="button"
                        onClick={() => handleLeadSelect(lead)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50/60 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800 text-sm">{lead.eqName}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            {lead.contact && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {lead.contact}
                              </span>
                            )}
                            {(lead.course || lead.software) && (
                              <span className="flex items-center gap-1 text-blue-600 font-medium">
                                <BookOpen className="h-3 w-3" /> {lead.course || lead.software}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-400 shrink-0">
                          ID: {lead.eqId}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-gray-300" />
                      No admitted leads matched "{searchQuery}"
                    </div>
                  )}
                </div>
              )}

              {/* Selected Badge Showcase */}
              {selectedLead && (
                <div className="mt-2 flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-bold text-emerald-800">
                    {selectedLead.eqName}
                  </span>
                  {selectedLead.contact && (
                    <span className="text-xs text-emerald-600 font-medium">
                      ({selectedLead.contact})
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded">
                      {selectedLead.eqId}
                    </span>
                    {isExistingRecord && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Existing Record
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Core Ledger Fields ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700"> Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Course / Software Specified</Label>
                <Input
                  value={formData.courseOrSoftware}
                  onChange={(e) => handleChange('courseOrSoftware', e.target.value)}
                  placeholder="Course or platform scope"
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Base Cost (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <Input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => handleChange('fee', e.target.value)}
                    className="pl-7 rounded-xl border-gray-200 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-gray-700">Discount Cap (%)</Label>
                  {!isAdmin && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Max 10%</span>}
                </div>
                <Input
                  type="number"
                  value={formData.discountPercent}
                  onChange={(e) => handleChange('discountPercent', e.target.value)}
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Net Cost (After Discount)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <Input
                    value={formData.discountAmount}
                    readOnly
                    className="pl-7 rounded-xl bg-gray-50 border-gray-200 font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-gray-700">Installment Count</Label>
                  {!isAdmin && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Max 5 Parts</span>}
                </div>
                <Input
                  type="number"
                  min="1"
                  value={formData.noOfInstallments}
                  onChange={(e) => handleChange('noOfInstallments', e.target.value)}
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            {/* ── Installment Management Grid ── */}
            {installments.length > 0 && (
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-indigo-500" />
                      Structured Schedules
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Manage transaction receipts and dynamic amount balancing panels.</p>
                  </div>
                  <Button
                    type="button"
                    variant={isEditing ? 'default' : 'outline'}
                    onClick={() => setIsEditing(!isEditing)}
                    className={`rounded-xl h-9 text-xs font-semibold shadow-sm transition-all duration-200 ${
                      isEditing ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    {isEditing ? 'Lock Structural Modifications' : 'Unlock Custom Modifiers'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {installments.map((item, index) => {
                    const isLast = index === installments.length - 1;
                    const isPaid = installmentPaid[index];
                    const shouldDisable = isPaid || (isLast && isMoreThanHalfPaid);

                    return (
                      <div
                        key={index}
                        className={`group relative border rounded-xl p-4 transition-all duration-200 bg-white ${
                          isPaid 
                            ? 'border-emerald-200 bg-emerald-50/10 shadow-sm' 
                            : shouldDisable 
                            ? 'border-gray-200 bg-gray-50/50 opacity-80' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Card Upper Actions Row */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100/80 pb-2.5 mb-3">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <Checkbox
                              checked={isPaid}
                              onCheckedChange={() => togglePaid(index)}
                              className="rounded border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <span className={`text-xs font-semibold ${isPaid ? 'text-emerald-700' : 'text-gray-500'}`}>
                              {isPaid ? 'Payment Received' : 'Pending Receipt'}
                            </span>
                          </label>

                          {paidDates[index] && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              <Calendar className="h-2.5 w-2.5" /> {paidDates[index]}
                            </span>
                          )}
                        </div>

                        {/* Amount Configuration Input */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Installment #{index + 1}
                          </span>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                            <Input
                              type="number"
                              value={item.amount}
                              disabled={!isEditing || shouldDisable}
                              onChange={(e) => handleInstallmentChange(index, e.target.value)}
                              className={`pl-6 rounded-lg text-sm h-9 border-gray-200 font-mono font-bold ${
                                !isEditing || shouldDisable
                                  ? 'bg-slate-100/80 text-gray-500 cursor-not-allowed border-gray-100 shadow-none'
                                  : 'text-gray-800 focus:ring-indigo-500 focus:border-indigo-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Status Notice Badges */}
                        {isPaid && (
                          <p className="text-[10px] font-semibold text-emerald-600 mt-2 flex items-center gap-1">
                            ✓ Balance cleared safely.
                          </p>
                        )}
                        {!isPaid && shouldDisable && (
                          <p className="text-[10px] font-medium text-amber-600 mt-2 bg-amber-50 p-1 rounded border border-amber-100/60">
                            ⚠️ Automated Lock (Over 50% paid).
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Submission Dispatch Grid Row ── */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                className={`w-full py-6 rounded-xl font-bold text-base shadow-md transform active:scale-[0.99] transition-all duration-150 ${
                  isExistingRecord
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isExistingRecord ? 'Update Sales Ledger Record' : 'Commit New Sales Ledger Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}