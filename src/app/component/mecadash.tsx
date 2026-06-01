'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useUser } from '@/app/component/context/user-context';

// ─── Helpers ───────────────────────────────────────────────
function getWeekRangeOfMonth(year: number, month: number, weekNum: number) {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay() || 7;
  const startOfWeek1 = new Date(firstDay);
  startOfWeek1.setDate(firstDay.getDate() - (firstDayOfWeek - 1));
  const weekStart = new Date(startOfWeek1);
  weekStart.setDate(startOfWeek1.getDate() + (weekNum - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { weekStart, weekEnd };
}

function fmt(d: Date) {
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
    .toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function getYearOptions() {
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = startYear; y <= currentYear; y++) years.push(y.toString());
  return years;
}

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
];

export default function MECADashboard() {
  const { user } = useUser();
  const yearOptions = getYearOptions();

  // ── Chart data state ──
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissionGraphData, setAdmissionGraphData] = useState<any[]>([]);
  const [organicGraphData, setOrganicGraphData] = useState<any[]>([]);
  const [weeklyAdmissions, setWeeklyAdmissions] = useState<any[]>([]);
  const [totalOrganicLeads, setTotalOrganicLeads] = useState(0);
  const [totalAdmissionsCount, setTotalAdmissionsCount] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);

  // ── Filter state ──
  const [filterType, setFilterType] = useState<'daily' | 'week' | 'month' | 'year'>('daily');
  const [selectedDate, setSelectedDate] = useState('');
  const [weekYear, setWeekYear] = useState('');
  const [weekMonth, setWeekMonth] = useState('');
  const [weekNum, setWeekNum] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [monthMonth, setMonthMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [delayGraphData, setDelayGraphData] = useState<any[]>([]);
  // ── Use logged in emp's employeeId directly ──
  const employeeId = user?.employeeId || 'all';

  useEffect(() => {
    fetchData();
  }, [
    filterType, selectedDate,
    weekYear, weekMonth, weekNum,
    monthYear, monthMonth, selectedYear,
    employeeId,
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ employeeId, filterType });

      if (filterType === 'daily') params.set('selectedDate', selectedDate);

      if (filterType === 'week' && weekYear && weekMonth && weekNum) {
        const { weekStart, weekEnd } = getWeekRangeOfMonth(
          parseInt(weekYear), parseInt(weekMonth), parseInt(weekNum)
        );
        params.set('weekStart', weekStart.toISOString());
        params.set('weekEnd', weekEnd.toISOString());
      }

      if (filterType === 'month' && monthYear && monthMonth) {
        params.set('selectedMonth', `${monthYear}-${monthMonth}`);
      }

      if (filterType === 'year' && selectedYear) {
        params.set('selectedYear', selectedYear);
      }

      const res = await fetch(`/api/meca/performance?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setGraphData(result.graphData || []);
        setTotalLeads(result.totalMarketingLeads || 0);
        setAdmissionGraphData(result.admissionGraphData || []);
        setWeeklyAdmissions(result.weeklyAdmissions || []);
        setTotalAdmissionsCount(result.totalAdmissionsCount || 0);
        setOrganicGraphData(result.organicGraphData || []);
        setTotalOrganicLeads(result.totalOrganicLeads || 0);
        setDelayGraphData(result.delayGraphData || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const weekDropdownOptions = weekYear && weekMonth
    ? [1, 2, 3, 4, 5, 6].reduce<{ value: string; label: string }[]>((acc, w) => {
        const { weekStart, weekEnd } = getWeekRangeOfMonth(
          parseInt(weekYear), parseInt(weekMonth), w
        );
        const monthStart = new Date(parseInt(weekYear), parseInt(weekMonth) - 1, 1);
        const monthEnd = new Date(parseInt(weekYear), parseInt(weekMonth), 0);
        if (weekEnd >= monthStart && weekStart <= monthEnd) {
          acc.push({ value: String(w), label: `Week ${w} (${fmt(weekStart)} to ${fmt(weekEnd)})` });
        }
        return acc;
      }, [])
    : [];

  const titles = {
    graph1: {
      daily: 'Leads Uploaded vs Calls Made',
      week: 'Leads Uploaded vs Calls Made (This Week)',
      month: 'Total Leads vs Calls per Week (This Month)',
      year: 'Total Leads vs Calls per Month (This Year)',
    },
    graph2: {
      daily: 'Admissions',
      week: 'Admissions (This Week)',
      month: 'Admissions per Week (This Month)',
      year: 'Admissions per Month (This Year)',
    },
    graph3: {
      daily: 'Organic Leads vs Admissions',
      week: 'Organic Leads vs Admissions (This Week)',
      month: 'Organic Leads vs Admissions per Week',
      year: 'Organic Leads vs Admissions per Month',
    },
    graph4: {
      daily: 'Leads : Admissions Ratio',
      week: 'Leads : Admissions Ratio (This Week)',
      month: 'Leads : Admissions Ratio per Week',
      year: 'Leads : Admissions Ratio per Month',
    },
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">
        MeCA - Meeting Calls & Admission
      </h1>

      {/* ── Logged In Employee Info ── */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 w-fit">
        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
          {user?.name?.charAt(0) || 'E'}
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800">{user?.name || 'Employee'}</p>
          <p className="text-xs text-blue-500">{user?.employeeId || ''} • {user?.department || user?.role || ''}</p>
        </div>
        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
          Viewing your data
        </span>
      </div>

      {/* ── Filter Type Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {(['daily', 'week', 'month', 'year'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterType(type);
              setSelectedDate('');
              setWeekYear(''); setWeekMonth(''); setWeekNum('');
              setMonthYear(''); setMonthMonth('');
              setSelectedYear('');
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              filterType === type
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ── Filter Inputs ── */}
      <div className="flex flex-wrap gap-4 items-end">
        {filterType === 'daily' && (
          <div>
            <label className="block text-sm mb-1 font-medium">Select Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-52"
            />
          </div>
        )}

        {filterType === 'week' && (
          <>
            <div>
              <label className="block text-sm mb-1 font-medium">Year</label>
              <Select value={weekYear} onValueChange={(y) => { setWeekYear(y); setWeekMonth(''); setWeekNum(''); }}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className={`block text-sm mb-1 font-medium ${!weekYear ? 'text-gray-400' : ''}`}>Month</label>
              <Select value={weekMonth} onValueChange={(m) => { setWeekMonth(m); setWeekNum(''); }} disabled={!weekYear}>
                <SelectTrigger className="w-44 disabled:opacity-50 disabled:cursor-not-allowed"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className={`block text-sm mb-1 font-medium ${!weekMonth ? 'text-gray-400' : ''}`}>Week</label>
              <Select value={weekNum} onValueChange={setWeekNum} disabled={!weekYear || !weekMonth}>
                <SelectTrigger className="w-72 disabled:opacity-50 disabled:cursor-not-allowed"><SelectValue placeholder="Select Week" /></SelectTrigger>
                <SelectContent>{weekDropdownOptions.map(w => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>
        )}

        {filterType === 'month' && (
          <>
            <div>
              <label className="block text-sm mb-1 font-medium">Year</label>
              <Select value={monthYear} onValueChange={(y) => { setMonthYear(y); setMonthMonth(''); }}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className={`block text-sm mb-1 font-medium ${!monthYear ? 'text-gray-400' : ''}`}>Month</label>
              <Select value={monthMonth} onValueChange={setMonthMonth} disabled={!monthYear}>
                <SelectTrigger className="w-44 disabled:opacity-50 disabled:cursor-not-allowed"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>
        )}

        {filterType === 'year' && (
          <div>
            <label className="block text-sm mb-1 font-medium">Select Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Select Year" /></SelectTrigger>
              <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ── Charts ── */}
      {loading ? (
        <p className="text-center py-16">Loading chart...</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* GRAPH 1 */}
          <Card>
            <CardHeader><CardTitle>{titles.graph1[filterType]}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border rounded-xl shadow-lg p-4">
                        <p className="font-semibold mb-2">{label}</p>
                        <p className="text-emerald-600">Leads Uploaded: {d.totalLeads}</p>
                        <p className="text-blue-600">Calls Made: {d.totalCalls}</p>
                      </div>
                    );
                  }} />
                  <Legend />
                  <Bar dataKey="totalLeads" fill="#10b981" name="Leads Uploaded" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="totalCalls" fill="#3b82f6" name="Calls Made" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GRAPH 2 */}
          {/* GRAPH 2 - Admissions (Marketing + Organic) */}
<Card>
  <CardHeader><CardTitle>{titles.graph2[filterType]}</CardTitle></CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={admissionGraphData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
        <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
        <YAxis
          allowDecimals={false}
          label={{ value: 'Admissions', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border rounded-xl shadow-lg p-4 space-y-1">
                <p className="font-semibold mb-2">{label}</p>
                <p className="text-sky-600">Marketing Admissions: {d.marketingAdmissions}</p>
                <p className="text-emerald-600">Organic Admissions: {d.organicAdmissions}</p>
                <p className="text-gray-700 font-semibold">Total: {d.totalAdmissions}</p>
              </div>
            );
          }}
        />
        <Legend />
        <Bar dataKey="marketingAdmissions" fill="#0ea5e9" name="Marketing Admissions" radius={[8, 8, 0, 0]} />
        <Bar dataKey="organicAdmissions" fill="#22c55e" name="Organic Admissions" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
          {/* GRAPH 3 */}
          <Card>
            <CardHeader><CardTitle>Total Organic Leads per day</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={organicGraphData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} label={{ value: 'Organic Leads', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border rounded-xl shadow-lg p-4">
                        <p className="font-semibold mb-2">{label}</p>
                        <p className="text-emerald-600">Organic Leads: {d.totalOrganicLeads}</p>
                        {/* <p className="text-green-800">Admissions: {d.totalAdmissions}</p> */}
                      </div>
                    );
                  }} />
                  <Legend />
                  <Bar dataKey="totalOrganicLeads" fill="#86efac" name="Organic Leads" radius={[8, 8, 0, 0]} />
                  {/* <Bar dataKey="totalAdmissions" fill="#22c55e" name="Admissions" radius={[8, 8, 0, 0]} /> */}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GRAPH 4 */}
         {/* GRAPH 4 - LEADS / ADMISSIONS RATIO + TOTAL LEADS BAR */}
<Card>
  <CardHeader>
    <CardTitle>{titles.graph4[filterType]}</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={weeklyAdmissions} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
        <XAxis 
          dataKey="dateRange" 
          angle={-45} 
          textAnchor="end" 
          height={80} 
        />
        <YAxis 
          allowDecimals={true} 
          tickFormatter={(val) => `${val}`} 
          label={{ 
            value: 'Leads / Ratio', 
            angle: -90, 
            position: 'insideLeft' 
          }} 
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border rounded-xl shadow-lg p-4 space-y-2 min-w-[220px]">
                <p className="font-semibold mb-2 border-b pb-1">{label}</p>
                
                <div>
                  <p className="text-gray-700 font-medium">Total Leads Approched: <span className="font-bold">{d.totalLeads}</span></p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sky-600 font-medium">Marketing</p>
                  <p>Leads Approched: {d.marketingLeads} | Admissions: {d.marketingAdmissions}</p>
                  <p className="font-semibold">Ratio: {d.marketingRatio}x</p>
                </div>

                <div>
                  <p className="text-emerald-600 font-medium">Organic</p>
                  <p>Leads: {d.organicLeads} | Admissions: {d.organicAdmissions}</p>
                  <p className="font-semibold">Ratio: {d.organicRatio}x</p>
                </div>
              </div>
            );
          }} 
        />
        <Legend />

        {/* New Bar - Total Leads Uploaded */}
        <Bar 
          dataKey="totalLeads" 
          fill="#64748b" 
          name="Total Leads Uploaded" 
          radius={[8, 8, 0, 0]} 
        />

        <Bar 
          dataKey="marketingRatio" 
          fill="#0ea5e9" 
          name="Marketing Ratio" 
          radius={[8, 8, 0, 0]} 
        />

        <Bar 
          dataKey="organicRatio" 
          fill="#22c55e" 
          name="Organic Ratio" 
          radius={[8, 8, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
 {/* GRAPH 5 - DELAY ANALYSIS */}
<Card>
  <CardHeader>
    <CardTitle>Delay Analysis (Selected Date)</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={delayGraphData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip 
  content={({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border rounded-xl shadow-lg p-4 space-y-1">
        <p className="font-semibold mb-2">{label}</p>
        <p><strong>Total Leads:</strong> {d.totalLeads}</p>
        <p className="text-red-600"><strong>Not Called:</strong> {d.notCalled}</p>
       <p className="text-blue-600">
  <strong>Avg Delay:</strong> {d.avgDelayHours || 0} days
</p>
      </div>
    );
  }} 
/>
        <Legend />
        
        <Bar dataKey="totalLeads" fill="#64748b" name="Total Leads Uploaded" radius={[8, 8, 0, 0]} />
        <Bar dataKey="notCalled" fill="#ef4444" name="Not Called Leads" radius={[8, 8, 0, 0]} />
        <Bar dataKey="avgDelayHours" fill="#3b82f6" name="Avg Delay (Days)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
        </div>
      )}
    </div>
  );
}