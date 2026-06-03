// app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Department from '../../../../model/Department';
import { getUserFromCookies } from '@/lib/helper';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Only Admin can add department" }, { status: 403 });
    }

    const { name, code, description } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ success: false, message: "Name and Code are required" }, { status: 400 });
    }

    const existingDept = await Department.findOne({ $or: [{ name }, { code }] });
    if (existingDept) {
      return NextResponse.json({ success: false, message: "Department with this name or code already exists" }, { status: 409 });
    }

    const newDept = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim(),
      createdBy: currentUser.employeeId,
    });

    return NextResponse.json({
      success: true,
      message: "Department added successfully",
      data: newDept
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const departments = await Department.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: departments
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch departments" 
    }, { status: 500 });
  }
}