// app/api/teachers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Teacher from '../../../../../model/Teacher';
import { getUserFromCookies } from '@/lib/helper';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Only Admin can update teacher" 
      }, { status: 403 });
    }

    const body = await request.json();
    const teacher = await Teacher.findByIdAndUpdate(id, body, { new: true });

    if (!teacher) {
      return NextResponse.json({ 
        success: false, 
        message: "Teacher not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: "Only Admin can delete teacher" 
      }, { status: 403 });
    }

    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return NextResponse.json({ 
        success: false, 
        message: "Teacher not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Teacher deleted successfully"
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}