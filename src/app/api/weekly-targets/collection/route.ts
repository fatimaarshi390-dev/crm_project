// app/api/weekly-targets/collection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeeklyTarget from '../../../../../model/WeeklyTarget';
import { getUserFromCookies } from '@/lib/helper';

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();

    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (typeof amount !== 'number') {
      return NextResponse.json({ success: false, message: "Amount is required" }, { status: 400 });
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleString('default', { month: 'long' });
    const weekNumber = Math.ceil(today.getDate() / 7);

    // Find or Create current week's target
    let target = await WeeklyTarget.findOne({
      employeeId: currentUser.employeeId,
      year: year,
      month: month,
      weekNumber: weekNumber,
    });

    if (!target) {
      target = await WeeklyTarget.create({
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name,
        year: year,
        month: month,
        weekNumber: weekNumber,
        targetCalls: 0,
        targetAdmissions: 0,
        targetRevenue: 0,
        targetCollection: 0,
        achievedCalls: 0,
        achievedAdmissions: 0,
        achievedRevenue: 0,
        achievedCollection: 0,
      });
    }

    // Update Achieved Collection
    const updatedTarget = await WeeklyTarget.findByIdAndUpdate(
      target._id,
      { 
        $inc: { achievedCollection: amount },
        $set: { lastUpdatedAt: new Date() }   // Optional
      },
      { new: true, runValidators: true }
    );

    // Auto-calculate progress
    if (updatedTarget.targetCollection > 0) {
      updatedTarget.collectionProgress = 
        Math.min(Math.round((updatedTarget.achievedCollection / updatedTarget.targetCollection) * 100), 100);
      await updatedTarget.save();
    }

    return NextResponse.json({
      success: true,
      message: `₹${amount} added to Achieved Collection`,
      data: {
        achievedCollection: updatedTarget.achievedCollection,
        collectionProgress: updatedTarget.collectionProgress,
        week: `${month} Week ${weekNumber}, ${year}`
      }
    });

  } catch (error: any) {
    console.error("Weekly Target Collection Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update collection" 
    }, { status: 500 });
  }
}