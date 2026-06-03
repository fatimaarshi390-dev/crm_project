import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '../../../../../model/Leads';
import { getUserFromCookies } from '@/lib/helper';

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { leadId, toEmpId, toEmpName } = await request.json();

    if (!leadId || !toEmpId || !toEmpName) {
      return NextResponse.json(
        { success: false, message: "leadId, toEmpId and toEmpName are required" },
        { status: 400 }
      );
    }

    const updated = await Lead.findByIdAndUpdate(
      leadId,
      {
        empId: toEmpId,
        empName: toEmpName,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lead transferred to ${toEmpName}`,
      data: updated
    });

  } catch (error: any) {
    console.error("Transfer Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}