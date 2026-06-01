import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '../../../../../../model/User';
import { getUserFromCookies } from '@/lib/helper';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || currentUser.department;

    const employees = await User.find({
  department,
  isActive: true,
  employeeId: { $ne: currentUser.employeeId },
  role: { $nin: ['marketing', 'admin'] }  // ← exclude marketing and admin
})
.select('employeeId name department role')
.lean();

    return NextResponse.json({ success: true, data: employees });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}