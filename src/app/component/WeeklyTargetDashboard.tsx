'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../component/context/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, GraduationCap, TrendingUp, IndianRupee } from 'lucide-react';

export default function WeeklyTargetDashboard() {
  const { user } = useUser();
  const [targets, setTargets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const currentWeek = Math.ceil(currentDate.getDate() / 7);

  useEffect(() => {
    fetchWeeklyTarget();
  }, []);

  const fetchWeeklyTarget = async () => {
    try {
      const res = await fetch('/api/weekly-targets/current');
      const data = await res.json();
      if (data.success) {
        setTargets(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (achieved: number, target: number) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  };

  if (loading) {
    return <p className="text-center py-8 text-gray-500">Loading weekly targets...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Weekly Target</h2>
          <p className="text-gray-600">
            {currentMonthName} Week {currentWeek}, {currentYear}
          </p>
        </div>
        <button 
          onClick={fetchWeeklyTarget}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Calls Card */}
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">CALLS</CardTitle>
            <Phone className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {targets?.achievedCalls || 0} / {targets?.targetCalls || 0}
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${calculateProgress(targets?.achievedCalls || 0, targets?.targetCalls || 0)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {calculateProgress(targets?.achievedCalls || 0, targets?.targetCalls || 0)}% achieved
            </p>
          </CardContent>
        </Card>

        {/* Admissions Card */}
        <Card className="border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">ADMISSIONS</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {targets?.achievedAdmissions || 0} / {targets?.targetAdmissions || 10000}
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${calculateProgress(targets?.achievedAdmissions || 0, targets?.targetAdmissions || 10000)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {calculateProgress(targets?.achievedAdmissions || 0, targets?.targetAdmissions || 10000)}% achieved
            </p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">REVENUE</CardTitle>
            <IndianRupee className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ₹{(targets?.achievedRevenue || 0).toLocaleString('en-IN')} 
              <span className="text-xl text-gray-400"> / ₹{(targets?.targetRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${calculateProgress(targets?.achievedRevenue || 0, targets?.targetRevenue || 0)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {calculateProgress(targets?.achievedRevenue || 0, targets?.targetRevenue || 0)}% achieved
            </p>
          </CardContent>
        </Card>

        {/* COLLECTION CARD - NOW LIVE */}
        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">COLLECTION</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">
              ₹{(targets?.achievedCollection || 0).toLocaleString('en-IN')} 
              <span className="text-xl text-gray-400"> / ₹{(targets?.targetCollection || 100000).toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${calculateProgress(targets?.achievedCollection || 0, targets?.targetCollection || 100000)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {calculateProgress(targets?.achievedCollection || 0, targets?.targetCollection || 100000)}% achieved
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}