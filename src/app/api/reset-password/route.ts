// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '../../../../model/User';

import { getUserFromCookies } from '@/lib/helper';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const currentUserPayload = await getUserFromCookies();
    if (!currentUserPayload) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Old password and New password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 4 characters long" },
        { status: 400 }
      );
    }

    // Fetch user with password
    const user = await User.findById(currentUserPayload.userId).select('+password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}