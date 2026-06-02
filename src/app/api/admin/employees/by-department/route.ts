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
    const department = searchParams.get('department') || '';
    const division = searchParams.get('division') || '';
    const role = searchParams.get('role') || '';

    const query: any = {
      isActive: true,
      employeeId: { $ne: currentUser.employeeId },
      role: { $nin: ['marketing', 'admin'] }
    };

    if (department) query.department = { $regex: department, $options: 'i' };
    if (role) query.role = { $regex: role, $options: 'i' };

    // division is stored on user? If yes add:
    // if (division) query.division = { $regex: division, $options: 'i' };

    const employees = await User.find(query)
      .select('employeeId name department role')
      .lean();

    return NextResponse.json({ success: true, data: employees });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}