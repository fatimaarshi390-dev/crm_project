'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../component/context/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, GraduationCap, TrendingUp, IndianRupee, RefreshCw, Calendar } from 'lucide-react';

export default function WeeklyTargetDashboard() {
  const { user } = useUser();
  const [targets, setTargets] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();
  const currentWeek = Math.ceil(now.getDate() / 7);

  const timeString = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  useEffect(() => {
    fetchWeeklyTarget();
  }, []);

  const fetchWeeklyTarget = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/weekly-targets/current');
      const data = await res.json();
      if (data.success) setTargets(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateProgress = (achieved: number, target: number) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  };

  // Safe Fallback Values
  const metrics = {
    calls: {
      achieved: targets?.achievedCalls || 0,
      target: targets?.targetCalls || 0,
    },
    admissions: {
      achieved: targets?.achievedAdmissions || 0,
      target: targets?.targetAdmissions || 10000,
    },
    revenue: {
      achieved: targets?.achievedRevenue || 0,
      target: targets?.targetRevenue || 0,
    },
    collection: {
      achieved: targets?.achievedCollection || 0,
      target: targets?.targetCollection || 100000,
    },
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-500">Loading your performance metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{currentMonthName} · Week {currentWeek} · {currentYear}</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Weekly Performance</h2>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Glassmorphic Live Clock */}
          <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-800">
            <span className="text-sm font-semibold tracking-wider font-mono text-blue-400">
              {timeString}
            </span>
            <span className="text-xs text-gray-400 border-l border-gray-700 pl-3">
              {dateString}
            </span>
          </div>

          <button
            onClick={fetchWeeklyTarget}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 justify-center text-sm font-medium h-10 px-4 py-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all shadow-sm text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Calls Card */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-150">
          <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Calls Tracked</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <Phone className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-gray-900">{metrics.calls.achieved}</span>
              <span className="text-sm font-medium text-gray-400">/ {metrics.calls.target}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-500">Target Completion</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {calculateProgress(metrics.calls.achieved, metrics.calls.target)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress(metrics.calls.achieved, metrics.calls.target)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 font-medium">
              {Math.max(0, metrics.calls.target - metrics.calls.achieved)} more calls left to hit target
            </p>
          </CardContent>
        </Card>

        {/* Admissions Card */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-150">
          <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Sales</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
             <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-emerald-600">{metrics.admissions.achieved}</span>
              <span className="text-sm font-medium text-gray-400">/ {metrics.admissions.target}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-500">Target Completion</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {calculateProgress(metrics.admissions.achieved, metrics.admissions.target)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress(metrics.admissions.achieved, metrics.admissions.target)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 font-medium">
              {Math.max(0, metrics.admissions.target - metrics.admissions.achieved)} sales away
            </p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-150">
          <div className="absolute top-0 left-0 h-1 w-full bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Revenue Generated</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col justify-end">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                ₹{metrics.revenue.achieved.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-gray-400 mt-0.5">
                Target: ₹{metrics.revenue.target.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-500">Target Completion</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  {calculateProgress(metrics.revenue.achieved, metrics.revenue.target)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress(metrics.revenue.achieved, metrics.revenue.target)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 font-medium truncate">
              {metrics.revenue.achieved >= metrics.revenue.target ? '🎯 Target achieved!' : `₹${Math.max(0, metrics.revenue.target - metrics.revenue.achieved).toLocaleString('en-IN')} pending`}
            </p>
          </CardContent>
        </Card>

        {/* Collection Card */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-150">
          <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Collections</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col justify-end">
              <span className="text-2xl font-bold tracking-tight text-indigo-600">
                ₹{metrics.collection.achieved.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-gray-400 mt-0.5">
                Target: ₹{metrics.collection.target.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-500">Target Completion</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {calculateProgress(metrics.collection.achieved, metrics.collection.target)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress(metrics.collection.achieved, metrics.collection.target)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 font-medium truncate">
              {metrics.collection.achieved >= metrics.collection.target ? '🎯 Target achieved!' : `₹${Math.max(0, metrics.collection.target - metrics.collection.achieved).toLocaleString('en-IN')} pending`}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}