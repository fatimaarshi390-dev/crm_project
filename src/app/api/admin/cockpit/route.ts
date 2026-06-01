import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/helper';
import User from '../../../../../model/User';
import WeeklyTarget from '../../../../../model/WeeklyTarget';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const admin = await getUserFromCookies();
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    const currentWeek = Math.ceil(today.getDate() / 7);

    // Get all Sales Employees
    const salesEmployees = await User.find({ 
      role: 'sales',
      isActive: true 
    }).select('name employeeId department target');

    const cockpitData = [];

    for (const emp of salesEmployees) {
      const target = await WeeklyTarget.findOne({
        employeeId: emp.employeeId,
        year: currentYear,
        month: currentMonth,
        weekNumber: currentWeek,
      });

      const achievedCalls = target?.achievedCalls || 0;
      const targetCalls = target?.targetCalls || 0;

      const achievedAdmissions = target?.achievedAdmissions || 0;
      const targetAdmissions = target?.targetAdmissions || 0;

      const achievedRevenue = target?.achievedRevenue || 0;
      const targetRevenue = target?.targetRevenue || 0;

      const achievedCollection = target?.achievedCollection || 0;
      const targetCollection = target?.targetCollection || 0;

      cockpitData.push({
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        target: emp.target,

        calls: { achieved: achievedCalls, target: targetCalls, progress: targetCalls ? Math.round((achievedCalls / targetCalls) * 100) : 0 },
        admissions: { achieved: achievedAdmissions, target: targetAdmissions, progress: targetAdmissions ? Math.round((achievedAdmissions / targetAdmissions) * 100) : 0 },
        revenue: { achieved: achievedRevenue, target: targetRevenue, progress: targetRevenue ? Math.round((achievedRevenue / targetRevenue) * 100) : 0 },
        collection: { achieved: achievedCollection, target: targetCollection, progress: targetCollection ? Math.round((achievedCollection / targetCollection) * 100) : 0 },
      });
    }

    return NextResponse.json({
      success: true,
      data: cockpitData,
      weekInfo: `${currentMonth} Week ${currentWeek}, ${currentYear}`
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to load cockpit" }, { status: 500 });
  }
}