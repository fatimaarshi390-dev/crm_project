'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

export default function MecaInvest() {
  const monthOptions = getMonthOptions();

  const [selectedMonth, setSelectedMonth]     = useState(monthOptions[0].value);
  const [weeklyData, setWeeklyData]           = useState<any[]>([]);
  const [weeklyRoiData, setWeeklyRoiData]     = useState<any[]>([]);
  const [summary, setSummary]                 = useState<any>(null);
  const [spend, setSpend]                     = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [noData, setNoData]                   = useState(false);
  const [courseGraphData, setCourseGraphData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    setNoData(false);
    try {
      const res    = await fetch(`/api/meca/invest?month=${selectedMonth}`);
      const result = await res.json();

      if (result.success) {
        setWeeklyData(result.weeklyData           || []);
        setWeeklyRoiData(result.weeklyRoiData     || []);
        setSummary(result.summary                 || null);
        setSpend(result.spend                     || null);
        setCourseGraphData(result.courseGraphData || []);
        if (!result.spend?.totalInvestment) setNoData(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Investment MeCA</h1>

      {/* Month Filter */}
      <div>
        <label className="block text-sm mb-1 font-medium">Select Month</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-center py-16">Loading...</p>
      ) : noData ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No investment data found for {selectedMonth}</p>
          <p className="text-sm mt-1">Please add monthly investment first.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Investment</p>
                  <p className="text-2xl font-bold text-red-500">
                    ₹{summary.totalInvestment.toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{summary.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Collection</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{summary.totalCollection.toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Not Collected</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{summary.totalNotCollected.toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {summary.roi}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Admissions</p>
                  <p className="text-2xl font-bold text-violet-600">
                    {summary.totalAdmissions ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Cost Per Admission</p>
                  <p className="text-2xl font-bold text-pink-600">
                    ₹{(summary.totalCostPerAdmission ?? 0).toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── All 4 Graphs in flex wrap ── */}
          <div  className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Graph 1: Weekly Investment vs Revenue vs Collection */}
            <Card className="flex-1 min-w-[320px]">
              <CardHeader>
                <CardTitle>Weekly Investment vs Revenue vs Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="week" />
                    <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border rounded-xl shadow-lg p-4 space-y-1 min-w-[260px]">
                            <p className="font-semibold mb-2">{label}</p>
                            <p className="text-red-600">Investment: ₹{d.investment.toLocaleString('en-IN')}</p>
                            <p className="text-blue-600">Revenue: ₹{d.revenue.toLocaleString('en-IN')}</p>
                            <p className="text-emerald-600">Collection: ₹{d.collection.toLocaleString('en-IN')}</p>
                            <p className="text-orange-600">Not Collected: ₹{d.notCollected.toLocaleString('en-IN')}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar dataKey="investment" fill="#ef4444" name="Investment" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="revenue"    fill="#3b82f6" name="Revenue"    radius={[8, 8, 0, 0]} />
                    <Bar dataKey="collection" fill="#22c55e" name="Collection" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graph 2: Weekly ROI % */}
            <Card className="flex-1 min-w-[320px]">
              <CardHeader>
                <CardTitle>ROI % Trend - {selectedMonth}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={weeklyRoiData}>
                    <XAxis dataKey="week" />
                    <YAxis
                      domain={[-100, 100]}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border rounded-xl shadow-lg p-4">
                            <p className="font-semibold mb-2">{label}</p>
                            <p className={`font-bold ${d.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              ROI: {d.roi}%
                            </p>
                            <p>Investment: ₹{d.investment.toLocaleString('en-IN')}</p>
                            <p>Collection: ₹{d.collection.toLocaleString('en-IN')}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      stroke="#3b82f6"
                      strokeWidth={5}
                      dot={{ r: 7, fill: '#3b82f6' }}
                      name="ROI %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graph 3: Cost Per Admission */}
            <Card className="flex-1 min-w-[320px]">
              <CardHeader>
                <CardTitle>Cost Per Admission (Week-wise)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <XAxis dataKey="week" />
                    <YAxis
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                      label={{ value: '₹ per Admission', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border rounded-xl shadow-lg p-4 space-y-1">
                            <p className="font-semibold mb-2">{label}</p>
                            <p className="text-gray-600">Investment: ₹{d.investment.toLocaleString('en-IN')}</p>
                            <p className="text-blue-600">Admissions: {d.admissionsCount}</p>
                            <p className="text-violet-600 font-bold">
                              Cost Per Admission: ₹{(d.costPerAdmission || 0).toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              *Less cost per admission = Better Performance
                              <br />
                              (Note: if admission != 0)
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="costPerAdmission"
                      fill="#8b5cf6"
                      name="Cost Per Admission"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graph 4: Course-wise Revenue */}
            <Card className="flex-1 min-w-[320px]">
              <CardHeader>
                <CardTitle>Course-wise Revenue - {selectedMonth}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart
                    data={courseGraphData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis dataKey="course" />
                    <YAxis
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                      label={{ value: '₹ Amount', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border rounded-xl shadow-lg p-4 space-y-1">
                            <p className="font-semibold mb-2">{label}</p>
                            <p className="text-blue-600">Revenue: ₹{d.revenue.toLocaleString('en-IN')}</p>
                            <p className="text-emerald-600">Collection: ₹{d.collection.toLocaleString('en-IN')}</p>
                            <p className="text-violet-600">Admissions: {d.admissions}</p>
                            <p className="text-pink-600 font-semibold">
                              Cost Per Admission: ₹{(d.costPerAdmission || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue"    fill="#3b82f6" name="Revenue"    radius={[8, 8, 0, 0]} />
                    <Bar dataKey="collection" fill="#22c55e" name="Collection" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}