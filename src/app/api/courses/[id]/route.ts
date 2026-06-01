import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '../../../../../model/Course';
import { getUserFromCookies } from '@/lib/helper';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const course = await Course.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromCookies();

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Admin only" }, { status: 403 });
    }

    await Course.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Course deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}