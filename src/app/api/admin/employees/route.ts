import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/helper';
import User from '../../../../../model/User';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const admin = await getUserFromCookies();
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const employees = await User.find({ 
      role: { $in: ['sales', 'marketing'] },
      isActive: true 
    }).select('name employeeId role department email');

    return NextResponse.json({
      success: true,
      employees
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}