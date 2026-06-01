// app/api/weekly-targets/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/helper';
import dbConnect from '@/lib/mongodb';
import WeeklyTarget from '../../../../../model/WeeklyTarget';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromCookies();
    if (!user || !user.employeeId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const currentMonth = today.toLocaleString('default', {
  month: 'long',
});
    const currentWeek = Math.ceil(today.getDate() / 7);

    console.log(`🔍 Searching: employeeId=${user.employeeId}, month=${currentMonth}, week=${currentWeek}`);

    let target = await WeeklyTarget.findOne({
      employeeId: user.employeeId,
      month: currentMonth,
      weekNumber: currentWeek,
    });

    if (!target) {
      console.log("🆕 Creating new weekly target");
      target = await WeeklyTarget.create({
        employeeId: user.employeeId,
        employeeName: user.name || "Unknown",
        month: currentMonth,
        weekNumber: currentWeek,
        targetCalls: 0,
        targetAdmissions: 0,
        targetRevenue: 0,
        targetCollection: 0,
        achievedCalls: 0,
        achievedAdmissions: 0,
        achievedRevenue: 0,
        achievedCollection: 0,
        isApproved: false,
      });
    } else {
      console.log("✅ Found existing target");
    }

    return NextResponse.json({
      success: true,
      data: target,
      weekInfo: {
        monthName: today.toLocaleString('default', { month: 'long' }), // "May"
        month: currentMonth,
        weekNumber: currentWeek,
        year: today.getFullYear()
      }
    });

  } catch (error: any) {
    console.error("Weekly Target Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}