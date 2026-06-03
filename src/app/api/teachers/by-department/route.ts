import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Teacher from '../../../../../model/Teacher';
import { getUserFromCookies } from '@/lib/helper';
import User from '../../../../../model/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get department from DB
    const userDoc = await User.findOne({
      employeeId: currentUser.employeeId
    }).select('department').lean() as any;

    const department = userDoc?.department;

    if (!department) {
      return NextResponse.json({ success: false, message: "Department not found" }, { status: 400 });
    }

    const teachers = await Teacher.find({
      department: { $regex: department, $options: 'i' },
      isActive: true
    })
    .select('name specialization')
    .lean();

    return NextResponse.json({ success: true, data: teachers });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}