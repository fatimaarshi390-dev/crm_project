// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '../../../../model/Course';
import { getUserFromCookies } from '@/lib/helper';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Only Admin can add courses" 
      }, { status: 403 });
    }

    const { name, duration, department, division, syllabus, faculty,fee } = await request.json();

    if (!name || !duration || !department || !division || !syllabus || !faculty||!fee) {
      return NextResponse.json({ 
        success: false, 
        message: "All fields are required" 
      }, { status: 400 });
    }

    const newCourse = await Course.create({
      name: name.trim(),
      duration: duration.trim(),
      department: department.trim(),
      division: division.trim(),
      syllabus: syllabus.trim(),
      faculty: faculty.trim(),
      fee:fee.trim(),
      createdBy: currentUser.employeeId,
    });

    return NextResponse.json({
      success: true,
      message: "Course added successfully",
      data: newCourse
    });

  } catch (error: any) {
    console.error("Course API Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}

// Optional: GET all courses
export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: courses
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch courses" }, { status: 500 });
  }
}