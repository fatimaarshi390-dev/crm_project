import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Division from '../../../../model/Division';

export async function GET() {
  try {
    await dbConnect();
    const divisions = await Division.find({ isActive: true })
      .sort({ divisionName: 1 })
      .lean();
    return NextResponse.json({ success: true, data: divisions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { divisionName, departmentName } = body;

    if (!divisionName?.trim() || !departmentName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Division name and Department are required" },
        { status: 400 }
      );
    }

    const newDivision = await Division.create({
      divisionName: divisionName.trim(),
      departmentName: departmentName.trim(),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Division created successfully",
      data: newDivision
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}