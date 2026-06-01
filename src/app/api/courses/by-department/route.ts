import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '../../../../../model/Course';
import { getUserFromCookies } from '@/lib/helper';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || user.department || '';

    const courses = await Course.find({
      isActive: true,
      department: { $regex: department, $options: 'i' }
    })
    .select('name fee duration')
    .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(courses))
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}