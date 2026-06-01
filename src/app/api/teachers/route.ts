// app/api/teachers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Teacher from '../../../../model/Teacher';
import { getUserFromCookies } from '@/lib/helper';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Only Admin can add teachers" 
      }, { status: 403 });
    }

    const { name, department, specialization } = await request.json();

    if (!name || !department || !specialization) {
      return NextResponse.json({ 
        success: false, 
        message: "Name, Department and Specialization are required" 
      }, { status: 400 });
    }

    const newTeacher = await Teacher.create({
      name: name.trim(),
      department: department.trim(),
      specialization: specialization.trim(),
      createdBy: currentUser.employeeId,
    });

    return NextResponse.json({
      success: true,
      message: "Teacher added successfully",
      data: newTeacher
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const teachers = await Teacher.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch teachers" 
    }, { status: 500 });
  }
}