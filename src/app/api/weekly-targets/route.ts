// app/api/weekly-targets/route.ts
import { NextRequest, NextResponse } from 'next/server';


import { getUserFromCookies } from '@/lib/helper';
import dbConnect from '@/lib/mongodb';
import WeeklyTarget from '../../../../model/WeeklyTarget';
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    const targets = await WeeklyTarget.find({ 
      employeeId: user.employeeId 
    })
    .sort({ year: -1, month: -1, weekNumber: -1 })   // Latest first
    .lean();

    return NextResponse.json({
      success: true,
      data: targets
    });

  } catch (error: any) {
    console.error("GET Weekly Targets Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch targets"
    }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    const {
      month,
      weekNumber,
      targetCalls,
      targetAdmissions,
      targetRevenue,
      targetCollection,
    } = await request.json();

    // Validation
    if (!month || !weekNumber) {
      return NextResponse.json(
        { success: false, message: "Month and Week Number are required" },
        { status: 400 }
      );
    }

    // Auto fill employee details
    const newTarget = await WeeklyTarget.create({
      employeeId: user.employeeId,
      employeeName: user.name,
      year: new Date().getFullYear(),           // Auto Current Year
      month,
      weekNumber: Number(weekNumber),

      targetCalls: Number(targetCalls) || 0,
      targetAdmissions: Number(targetAdmissions) || 0,
      targetRevenue: Number(targetRevenue) || 0,
      targetCollection: Number(targetCollection) || 0,

      achievedCalls: 0,
      achievedAdmissions: 0,
      achievedRevenue: 0,
      achievedCollection: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Weekly Target saved successfully",
      //data: newTarget
    });

  } catch (error: any) {
    console.error("Weekly Target Error:", error);

    // Handle duplicate entry error
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "Target for this week already exists"
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to save weekly target"
    }, { status: 500 });
  }
}