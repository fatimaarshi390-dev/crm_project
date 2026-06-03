// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '../../../../model/User';

import { createToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { employeeId, password } = await request.json();

    console.log("🔍 Login Attempt - Employee ID:", employeeId);

    if (!employeeId || !password) {
      return NextResponse.json({ success: false, message: 'Employee ID and Password required' }, { status: 400 });
    }

    const user = await User.findOne({ employeeId }).select('+password');

    if (!user) {
      console.log("❌ User not found with Employee ID:", employeeId);
      return NextResponse.json({ success: false, message: 'Invalid Employee ID or Password' }, { status: 401 });
    }

    console.log("✅ User Found:", user.name, "| Role:", user.role);

    const isMatch = await bcrypt.compare(password, user.password || '');

    console.log("🔑 Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does NOT match");
      return NextResponse.json({ success: false, message: 'Invalid Employee ID or Password' }, { status: 401 });
    }

    console.log("🎉 Login Successful!");

    // ... rest of your token and response code ...

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error: any) {
    console.error("💥 Login Error:", error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}