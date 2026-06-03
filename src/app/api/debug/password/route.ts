// app/api/debug/password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../model/User';

import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  const employeeId = request.nextUrl.searchParams.get('employeeId');
  
  if (!employeeId) {
    return NextResponse.json({ error: "employeeId required" });
  }

  const user = await User.findOne({ employeeId }).select('+password');
  
  return NextResponse.json({
    employeeId,
    name: user?.name,
    hasPassword: !!user?.password,
    // Note: Hum actual hashed password nahi dikhayenge security ke liye
  });
}