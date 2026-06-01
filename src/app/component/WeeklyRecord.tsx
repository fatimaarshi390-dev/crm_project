'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, CalendarCheck, TrendingUp, Wallet, UserCheck, Users } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function getYearOptions() {
  const years = [];
  for (let y = 2024; y <= new Date().getFullYear(); y++) {
    years.push(y);
  }
  return years;
}

export default function WeeklyRecord() {
  const now = new Date();

  const [year,   setYear]   = useState(now.getFullYear());
  const [month,  setMonth]  = useState(MONTHS[now.getMonth()]);
  const [week,   setWeek]   = useState(1);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [noData,  setNoData]  = useState(false);

  useEffect(() => {
    fetchRecord();
  }, [year, month, week]);

  const fetchRecord = async () => {
    setLoading(true);
    setNoData(false);
    try {
      const res    = await fetch(`/api/records/weekly?year=${year}&month=${month}&week=${week}`);
      const result = await res.json();
      if (result.success) {
        setRecord(result.data);
        if (!result.data) setNoData(true);
      } else {
        setNoData(true);
      }
    } catch (err) {
      console.error(err);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  const progressBar = (achieved: number, target: number) => {
    const pct = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
    return (
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Weekly Record</h1>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-4 items-end">

        {/* Year */}
        <div>
          <label className="block text-sm mb-1 font-medium">Year</label>
          <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {getYearOptions().map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month */}
        <div>
          <label className="block text-sm mb-1 font-medium">Month</label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Week */}
        {/* Week */}
<div>
  <label className="block text-sm mb-1 font-medium">Week</label>
  <Select value={String(week)} onValueChange={v => setWeek(parseInt(v))}>
    <SelectTrigger className="w-28">
      <SelectValue placeholder="Week" />
    </SelectTrigger>
    <SelectContent>
      {[1, 2, 3, 4, 5].map(w => (
        <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

      </div>

      {loading ? (
        <p className="text-center py-16 text-gray-400">Loading...</p>
      ) : noData || !record ? (
        <p className="text-center py-16 text-gray-400">No record found for this week.</p>
      ) : (
        <>
          {/* Week Range */}
          <p className="text-sm text-gray-500 font-medium">
            📅 {record.weekRange}
          </p>

          {/* ── Target vs Achieved Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Calls */}
            <Card>
              <CardContent className="pt-6 space-y-1">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Phone size={18} />
                  <p className="font-semibold">Calls</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target</span>
                  <span className="font-bold">{record.targets.calls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Achieved</span>
                  <span className="font-bold text-blue-600">{record.achieved.calls}</span>
                </div>
                {progressBar(record.achieved.calls, record.targets.calls)}
              </CardContent>
            </Card>

            {/* Admissions */}
            <Card>
              <CardContent className="pt-6 space-y-1">
                <div className="flex items-center gap-2 text-violet-600 mb-2">
                  <UserCheck size={18} />
                  <p className="font-semibold">Admissions</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target</span>
                  <span className="font-bold">{record.targets.admissions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Achieved</span>
                  <span className="font-bold text-violet-600">{record.achieved.admissions}</span>
                </div>
                {progressBar(record.achieved.admissions, record.targets.admissions)}
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card>
              <CardContent className="pt-6 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <TrendingUp size={18} />
                  <p className="font-semibold">Revenue</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target</span>
                  <span className="font-bold">₹{record.targets.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Achieved</span>
                  <span className="font-bold text-emerald-600">₹{record.achieved.revenue.toLocaleString('en-IN')}</span>
                </div>
                {progressBar(record.achieved.revenue, record.targets.revenue)}
              </CardContent>
            </Card>

            {/* Collection */}
            <Card>
              <CardContent className="pt-6 space-y-1">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Wallet size={18} />
                  <p className="font-semibold">Collection</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target</span>
                  <span className="font-bold">₹{record.targets.collection.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Achieved</span>
                  <span className="font-bold text-amber-600">₹{record.achieved.collection.toLocaleString('en-IN')}</span>
                </div>
                {progressBar(record.achieved.collection, record.targets.collection)}
              </CardContent>
            </Card>

          </div>

          {/* ── This Week Activity ── */}
          <h2 className="text-xl font-bold mt-4">This Week Activity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Pre-Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-blue-600">
                  📞 Pre-Demo ({record.thisWeek.preDemoCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {record.thisWeek.preDemoLeads.length === 0 ? (
                  <p className="text-sm text-gray-400">No pre-demos this week</p>
                ) : (
                  record.thisWeek.preDemoLeads.map((l: any) => (
                    <div key={l._id} className="bg-blue-50 rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold">{l.eqName}</p>
                      <p className="text-xs text-gray-500">{l.contact}</p>
                      <p className="text-xs text-blue-600">
                        {new Date(l.preDemoActualDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-violet-600">
                  🎯 Demo ({record.thisWeek.demoCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {record.thisWeek.demoLeads.length === 0 ? (
                  <p className="text-sm text-gray-400">No demos this week</p>
                ) : (
                  record.thisWeek.demoLeads.map((l: any) => (
                    <div key={l._id} className="bg-violet-50 rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold">{l.eqName}</p>
                      <p className="text-xs text-gray-500">{l.contact}</p>
                      <p className="text-xs text-violet-600">
                        {new Date(l.demoDoneDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Post-Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-emerald-600">
                  📋 Post-Demo ({record.thisWeek.postDemoCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {record.thisWeek.postDemoLeads.length === 0 ? (
                  <p className="text-sm text-gray-400">No post-demos this week</p>
                ) : (
                  record.thisWeek.postDemoLeads.map((l: any) => (
                    <div key={l._id} className="bg-emerald-50 rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold">{l.eqName}</p>
                      <p className="text-xs text-gray-500">{l.contact}</p>
                      <p className="text-xs text-emerald-600">
                        {new Date(l.postDemoDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Admissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-amber-600">
                  ✅ Admissions ({record.thisWeek.admissionCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {record.thisWeek.admissionLeads.length === 0 ? (
                  <p className="text-sm text-gray-400">No admissions this week</p>
                ) : (
                  record.thisWeek.admissionLeads.map((l: any) => (
                    <div key={l._id} className="bg-amber-50 rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold">{l.eqName}</p>
                      <p className="text-xs text-gray-500">{l.contact}</p>
                      <p className="text-xs text-amber-600">
                        {new Date(l.admissionDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}