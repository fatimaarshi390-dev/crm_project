// app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Department from '../../../../../model/Department';
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
        message: "Only Admin can update department" 
      }, { status: 403 });
    }

    const { isActive } = await request.json();

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!department) {
      return NextResponse.json({ 
        success: false, 
        message: "Department not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Department status updated successfully",
      data: department
    });

  } catch (error: any) {
    console.error("PATCH Error:", error);
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
        message: "Only Admin can delete department" 
      }, { status: 403 });
    }

    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json({ 
        success: false, 
        message: "Department not found" 
      }, { status: 404 });
    }

    await Department.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully"
    });

  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error" 
    }, { status: 500 });
  }
}