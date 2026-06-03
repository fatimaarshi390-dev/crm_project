'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Phone, GraduationCap, TrendingUp, IndianRupee, Users, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCockpitView() {
  const [cockpitData, setCockpitData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekInfo, setWeekInfo] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentWeek, setCurrentWeek] = useState('');

  useEffect(() => {
    fetchCockpit();
  }, []);

  const fetchCockpit = async () => {
    try {
      const res = await fetch('/api/admin/cockpit');
      const data = await res.json();
      if (data.success) {
        setCockpitData(data.data);
        setWeekInfo(data.weekInfo);

        const match = data.weekInfo?.match(/(\w+)\s+Week\s+(\d+)/);
        if (match) {
          setCurrentMonth(match[1]);
          setCurrentWeek(match[2]);
        }
      }
    } catch (err) {
      toast.error("Failed to load cockpit view");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading Cockpit View...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            Admin Cockpit View
            <Calendar className="w-8 h-8 text-blue-600" />
          </h2>
          <p className="text-gray-600 text-lg">
            {currentMonth} • Week {currentWeek}
          </p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {cockpitData.length} Sales Employees
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cockpitData.map((emp) => {
          const avgCallsPerDay = emp.calls.target > 0 
            ? (emp.calls.achieved / 7).toFixed(1) 
            : '0.0';

          return (
            <Card key={emp.employeeId} className="shadow-md hover:shadow-lg transition-all border-t-4 border-t-blue-600">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <div className="text-xl">{emp.name}</div>
                    <p className="text-sm text-gray-500 font-normal">{emp.employeeId}</p>
                  </div>
                  <Target className="w-6 h-6 text-blue-600" />
                </CardTitle>
                <p className="text-xs text-gray-500">
                  {currentMonth} • Week {currentWeek}
                </p>
              </CardHeader>

              <CardContent className="space-y-6 pt-2">
                {/* Avg Calls Per Day - New Feature */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-700">
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-medium">Avg. Calls / Day</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">{avgCallsPerDay}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">This week (7 days)</p>
                </div>

                {/* Calls */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Calls
                    </span>
                    <span className="font-medium">
                      {emp.calls.achieved} / {emp.calls.target}
                    </span>
                  </div>
                  <Progress value={emp.calls.progress} className="h-2.5" />
                  <p className="text-xs text-right text-gray-500 mt-1 font-medium">{emp.calls.progress}% Complete</p>
                </div>

                {/* Admissions */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Admissions
                    </span>
                    <span className="font-medium">
                      {emp.admissions.achieved} / {emp.admissions.target}
                    </span>
                  </div>
                  <Progress value={emp.admissions.progress} className="h-2.5" />
                  <p className="text-xs text-right text-gray-500 mt-1 font-medium">{emp.admissions.progress}% Complete</p>
                </div>

                {/* Revenue */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Revenue
                    </span>
                    <span className="font-medium">
                      ₹{emp.revenue.achieved.toLocaleString()} / ₹{emp.revenue.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={emp.revenue.progress} className="h-2.5" />
                  <p className="text-xs text-right text-gray-500 mt-1 font-medium">{emp.revenue.progress}% Complete</p>
                </div>

                {/* Collection */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" /> Collection
                    </span>
                    <span className="font-medium">
                      ₹{emp.collection.achieved.toLocaleString()} / ₹{emp.collection.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={emp.collection.progress} className="h-2.5" />
                  <p className="text-xs text-right text-gray-500 mt-1 font-medium">{emp.collection.progress}% Complete</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cockpitData.length === 0 && (
        <p className="text-center text-gray-500 py-10">No sales employees found for this week</p>
      )}
    </div>
  );
}