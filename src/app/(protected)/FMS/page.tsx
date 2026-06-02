'use client';

import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { toast } from 'sonner';

type Lead = {
  _id: string;
  eqId: string;
  eqName: string;
  contact: string;

  city?: string;
  state?: string;
  software?: string;

  preDemoExpectedDate?: string;
  preDemoActualDate?: string;
  preDemoDate?: string;

  demoDate?: string;
  demoDoneDate?: string;

  postDemoDate?: string;

  admissionStatus?: string;
  admissionDate?: string;

  demoDateGivenAt?: string;

  salesDeck?: string;
  salesDeckDate?: string;
  
  reminderDate?:string;
  reminder?: string;

  uploadedAt?: string;
  approachedAt?: string;
  createdAt?: string;
  isPreDemo: boolean;
  isPostDemo: boolean;
  status?: string;
};

export default function FMSDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ================= FETCH LEADS =================
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads?fms=true');
      const data = await res.json();

      if (data.success) {
        setLeads(data.data || []);
        setFilteredLeads(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH FILTER =================
  useEffect(() => {
    // Reset to page 1 whenever search filters alter results
    setCurrentPage(1);

    if (!searchTerm.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter((lead) => {
      const search = searchTerm.toLowerCase();

      return (
        lead.eqName?.toLowerCase().includes(search) ||
        lead.eqId?.toLowerCase().includes(search) ||
        lead.contact?.toLowerCase().includes(search)
      );
    });

    setFilteredLeads(filtered);
  }, [searchTerm, leads]);

  // ================= PAGINATION LOGIC =================
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // ================= DATE FORMAT =================
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';

    try {
      const date = new Date(dateStr);

      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // ================= DELAY CALC =================
  const calculateDelay = (expectedDate?: string, actualDate?: string) => {
    if (!expectedDate || !actualDate) return '—';

    try {
      const expected = new Date(expectedDate);
      const actual = new Date(actualDate);

      expected.setHours(0, 0, 0, 0);
      actual.setHours(0, 0, 0, 0);

      const diffTime = actual.getTime() - expected.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Same Day';

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} delay`;
      }

      return 'Before Time';
    } catch {
      return '—';
    }
  };

  const renderDelayBadge = (expected?: string, actual?: string) => {
    const delay = calculateDelay(expected, actual);

    if (delay === 'Same Day') {
      return (
        <div className="inline-flex w-fit rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">
          {delay}
        </div>
      );
    }

    if (delay === 'Before Time') {
      return (
        <div className="inline-flex w-fit rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">
          {delay}
        </div>
      );
    }

    if (delay === '—') return null;

    return (
      <div className="inline-flex w-fit rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
        {delay}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-lg font-semibold text-gray-600">
          Loading FMS Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            8-Step Lead Process Tracking
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Follow-up Management System
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-full border-0 font-semibold">
            Total Leads: {filteredLeads.length}
          </Badge>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-4">
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Search Lead
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search by Enquiry Name / EQ ID / Contact"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button className="w-full h-11 rounded-xl bg-black hover:bg-gray-800 transition-colors">
                <Filter className="mr-2" size={18} />
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= TABLE ================= */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b bg-white p-6">
          <CardTitle className="text-xl font-bold text-gray-900">
            Leads Process Tracking
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1700px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50/50">
                  <th className="p-5 text-left text-sm text-gray-700 font-bold border-b border-gray-200 sticky left-0 bg-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    Lead Details
                  </th>
                  {[
                    'Lead Assignment',
                    'Initial Call',
                    'Sales Deck',
                    'Pre-Demo',
                    'Reminder',
                    'Centre Visit',
                    'Feedback',
                    'Conversion'
                  ].map((step, index) => (
                    <th
                      key={step}
                      className="p-5 text-sm text-gray-700 text-center font-bold border-b border-gray-200 min-w-[220px]"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
                          Step {index + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-20">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="text-gray-300 mb-3" size={40} />
                        <p className="text-gray-500 font-medium">
                          No Leads Found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="bg-white even:bg-gray-50/30 hover:bg-blue-50/20 transition-all duration-200"
                    >
                      {/* ================= LEAD INFO ================= */}
                      <td className="p-4 min-w-[240px] border-b border-gray-100 sticky left-0 bg-white group-hover:bg-blue-50/20 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 text-sm">
                            {lead.eqName}
                          </div>
                          <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            {lead.eqId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lead.contact}
                          </div>
                        </div>
                      </td>

                      {/* ================= STEP 1 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-center">
                          {lead.uploadedAt ? (
                            <>
                              <span className="text-xs text-gray-500 mb-2 block">
                                Assigned On
                              </span>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 w-fit border-0 font-medium">
                                {formatDate(lead.uploadedAt)}
                              </Badge>
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ================= STEP 2 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-between space-y-2">
                          <div>
                            <p className="text-[11px] text-gray-400">Upload Date</p>
                            <p className="text-sm font-medium">
                              {formatDate(lead.uploadedAt || lead.createdAt)}
                            </p>
                          </div>
                          {lead.preDemoActualDate || lead.demoDateGivenAt ? (
                            <>
                              <div>
                                <p className="text-[11px] text-gray-400">First Call</p>
                                <p className="text-sm font-medium">
                                  {formatDate(lead.preDemoActualDate || lead.demoDateGivenAt)}
                                </p>
                              </div>
                              {renderDelayBadge(
                                lead.uploadedAt || lead.createdAt,
                                lead.preDemoActualDate || lead.demoDateGivenAt
                              )}
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Call Pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ================= STEP 3 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-between space-y-2">
                          {lead.salesDeck === 'Yes' ? (
                            <>
                              <div>
                                <p className="text-[11px] text-gray-400">Expected</p>
                                <p className="text-sm font-medium">
                                  {formatDate(lead.approachedAt || lead.createdAt)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-400">Sent</p>
                                <p className="text-sm font-medium">
                                  {formatDate(lead.salesDeckDate)}
                                </p>
                              </div>
                              {renderDelayBadge(
                                lead.approachedAt || lead.createdAt,
                                lead.salesDeckDate
                              )}
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>
{/* ================= STEP 4 - PRE-DEMO ================= */}
<td className="p-4 border-b border-gray-100">
  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-between space-y-2">
    {lead.isPreDemo ? (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 w-fit border-0">
        Skipped Step
      </Badge>
    ) : lead.preDemoExpectedDate || lead.preDemoDate || lead.preDemoActualDate ? (
      <>
        <div>
          <p className="text-[11px] text-gray-400">Expected</p>
          <p className="text-sm font-medium">
            {formatDate(lead.preDemoExpectedDate || lead.preDemoDate)}
          </p>
        </div>

        {lead.demoDateGivenAt || lead.preDemoActualDate ? (
          <>
            <div>
              <p className="text-[11px] text-gray-400">Actual</p>
              <p className="text-sm font-medium">
                {formatDate(lead.demoDateGivenAt || lead.preDemoActualDate)}
              </p>
            </div>
            {renderDelayBadge(
              lead.preDemoExpectedDate || lead.preDemoDate,
              lead.demoDateGivenAt || lead.preDemoActualDate
            )}
          </>
        ) : (
          <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
            Pending
          </div>
        )}
      </>
    ) : (
      <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
        Pending
      </div>
    )}
  </div>
</td>

                      {/* ================= STEP 5 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-between space-y-2">
                          {lead.reminder === 'Yes' ? (
                            <>
                              <div>
                                <p className="text-[11px] text-gray-400">Expected</p>
                                <p className="text-sm font-medium">
                                  {formatDate(lead.approachedAt || lead.createdAt)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-gray-400">Sent</p>
                                <p className="text-sm font-medium">
                                  {formatDate(lead.reminderDate)}
                                </p>
                              </div>
                              {renderDelayBadge(
                                lead.approachedAt || lead.createdAt,
                                lead.reminderDate
                              )}
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ================= STEP 6 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-between space-y-2">
                          {lead.demoDate ? (
                            <>
                              <div>
                                <p className="text-[11px] text-gray-400">Expected Visit</p>
                                <p className="text-sm font-medium">{formatDate(lead.demoDate)}</p>
                              </div>
                              {lead.demoDoneDate ? (
                                <>
                                  <div>
                                    <p className="text-[11px] text-gray-400">Actual Visit</p>
                                    <p className="text-sm font-medium">{formatDate(lead.demoDoneDate)}</p>
                                  </div>
                                  {renderDelayBadge(lead.demoDate, lead.demoDoneDate)}
                                </>
                              ) : (
                                <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                  Visit Pending
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ================= STEP 7 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-between space-y-2">
                          {lead.isPostDemo ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 w-fit border-0">
                              Skipped Step
                            </Badge>
                          ) : lead.postDemoDate ? (
                            <>
                              <div>
                                <p className="text-[11px] text-gray-400">Expected Feedback</p>
                                <p className="text-sm font-medium">{formatDate(lead.postDemoDate)}</p>
                              </div>
                              {lead.admissionDate ? (
                                <>
                                  <div>
                                    <p className="text-[11px] text-gray-400">Actual Feedback</p>
                                    <p className="text-sm font-medium">{formatDate(lead.admissionDate)}</p>
                                  </div>
                                  {renderDelayBadge(lead.postDemoDate, lead.admissionDate)}
                                </>
                              ) : (
                                <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                                  Feedback Pending
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Pending
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ================= STEP 8 ================= */}
                      <td className="p-4 border-b border-gray-100">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 min-h-[140px] flex flex-col justify-center items-start gap-2">
                          {lead.admissionStatus === 'Confirmed' || lead.admissionStatus === 'Admitted' ? (
                            <>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 rounded-full border-0 font-semibold">
                                Admitted
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(lead.admissionDate)}
                              </span>
                            </>
                          ) : (
                            <div className="inline-flex w-fit rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700">
                              Not Converted
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* ================= PAGINATION CONTROLS ================= */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t p-6 bg-white">
            <p className="text-sm text-gray-600 font-medium">
              Showing{' '}
              <span className="font-bold text-gray-950">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-gray-950">
                {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
              </span>{' '}
              of <span className="font-bold text-gray-950">{filteredLeads.length}</span> entries
            </p>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 rounded-lg border-gray-200"
              >
                <ChevronLeft size={16} />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                      currentPage === page 
                        ? 'bg-black text-white hover:bg-black/90' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 rounded-lg border-gray-200"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}