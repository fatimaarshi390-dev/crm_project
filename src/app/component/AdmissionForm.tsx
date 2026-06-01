'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit3, AlertCircle } from 'lucide-react';
import { useUser } from '@/app/component/context/user-context';   // ← Required for Admin Check

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

  // ── Search state ──
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

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Debounced search ──
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
    // Changed: Removed strict status=admission to get better results
    const res = await fetch(
      `/api/leads?search=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    
    if (data.success) {
      // Filter only admitted leads on frontend for better UX
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
  // ── Load existing admission ──
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

  // ── Select lead from search results ──
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

  // ── Handle top fields with Auto Cap (Admin Bypass) ──
  const handleChange = (field: string, value: string) => {
    let updated = { ...formData, [field]: value };

    const isAdmin = user?.role === 'admin';

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

    // Recalculate After Discount
    if (field === 'fee' || field === 'discountPercent') {
      const fee = parseFloat(updated.fee) || 0;
      const discountPercent = parseFloat(updated.discountPercent) || 0;
      updated.discountAmount = (fee - (fee * discountPercent) / 100).toFixed(2);
    }

    setFormData(updated);
  };

  // ── Auto generate installments ──
  useEffect(() => {
    if (isExistingRecord) return;

    const totalAmount = parseFloat(formData.discountAmount) || 0;
    let count = parseInt(formData.noOfInstallments) || 0;

    const isAdmin = user?.role === 'admin';
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
    if (
      installmentPaid[index] ||
      (index === installments.length - 1 && isMoreThanHalfPaid)
    ) {
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
      const equalAmount = Number(
        (remainingAmount / editableIndexes.length).toFixed(2)
      );
      editableIndexes.forEach(i => {
        updatedInstallments[i].amount = equalAmount;
      });

      const finalTotal = updatedInstallments.reduce(
        (sum, item) => sum + item.amount, 0
      );
      const diff = Number((totalAmount - finalTotal).toFixed(2));
      updatedInstallments[editableIndexes[editableIndexes.length - 1]].amount += diff;
    }

    setInstallments(updatedInstallments);
  };

  // ── Submit ──
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
        toast.success(
          isExistingRecord
            ? 'Admission Updated!'
            : 'Admission Saved Successfully!'
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  return (
    <Card className="max-w-5xl mx-auto my-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Admission Form</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Search Bar */}
          <div className="relative" ref={dropdownRef}>
            <Label>Search by Name or Phone *</Label>
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
                placeholder="Type name or phone number (min 2 chars)..."
                className="pr-10"
              />

              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {(searchQuery || selectedLead) && !searchLoading && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-lg leading-none"
                >
                  ✕
                </button>
              )}
            </div>

            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((lead) => (
                    <button
                      key={lead._id}
                      type="button"
                      onClick={() => handleLeadSelect(lead)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                    >
                      <p className="font-medium text-gray-800">{lead.eqName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {lead.contact && (
                          <span className="text-sm text-gray-500">
                            📞 {lead.contact}
                          </span>
                        )}
                        {(lead.course || lead.software) && (
                          <span className="text-xs text-blue-500">
                            {lead.course || lead.software}
                          </span>
                        )}
                        <span className="text-xs text-gray-300 ml-auto">
                          {lead.eqId}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No admitted leads found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {selectedLead && (
              <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-green-500 text-base">✓</span>
                <span className="text-sm font-semibold text-green-700">
                  {selectedLead.eqName}
                </span>
                {selectedLead.contact && (
                  <span className="text-xs text-green-500">
                    {selectedLead.contact}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {selectedLead.eqId}
                </span>
                {isExistingRecord && (
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                    Existing Record
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Main Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Course / Software</Label>
              <Input
                value={formData.courseOrSoftware}
                onChange={(e) => handleChange('courseOrSoftware', e.target.value)}
                className="mt-1"
                placeholder="Course or Software Name"
              />
            </div>
            <div>
              <Label>Fee (₹)</Label>
              <Input
                type="number"
                value={formData.fee}
                onChange={(e) => handleChange('fee', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Discount % {user?.role !== 'admin' && <span className="text-red-500">(Max 10%)</span>}</Label>
              <Input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => handleChange('discountPercent', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>After Discount</Label>
              <Input
                value={formData.discountAmount}
                readOnly
                className="mt-1 bg-gray-100 font-bold"
              />
            </div>
            <div>
              <Label>No. Of Installments {user?.role !== 'admin' && <span className="text-red-500">(Max 5)</span>}</Label>
              <Input
                type="number"
                min="1"
                value={formData.noOfInstallments}
                onChange={(e) => handleChange('noOfInstallments', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Installments Section */}
          {installments.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Installments</h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Editing Enabled' : 'Modify'}
                </Button>
              </div>

              <div className="space-y-4">
                {installments.map((item, index) => {
                  const isLast = index === installments.length - 1;
                  const isPaid = installmentPaid[index];
                  const shouldDisable = isPaid || (isLast && isMoreThanHalfPaid);

                  return (
                    <div
                      key={index}
                      className="border rounded-xl p-5 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Checkbox
                          checked={isPaid}
                          onCheckedChange={() => togglePaid(index)}
                        />
                        <span className="text-sm font-medium">Mark as Paid</span>
                        {paidDates[index] && (
                          <span className="ml-auto text-green-600 text-xs">
                            Paid: {paidDates[index]}
                          </span>
                        )}
                      </div>

                      <Label>Installment {index + 1}</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        disabled={!isEditing || shouldDisable}
                        onChange={(e) =>
                          handleInstallmentChange(index, e.target.value)
                        }
                        className={`mt-2 ${
                          !isEditing || shouldDisable
                            ? 'bg-gray-200 cursor-not-allowed'
                            : ''
                        }`}
                      />

                      {isPaid && (
                        <p className="text-xs text-green-600 mt-2">
                          Installment Paid
                        </p>
                      )}
                      {!isPaid && shouldDisable && (
                        <p className="text-xs text-red-500 mt-2">
                          Last installment locked (50%+ paid)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
          >
            {isExistingRecord
              ? 'Update Admission Record'
              : 'Save New Admission Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}