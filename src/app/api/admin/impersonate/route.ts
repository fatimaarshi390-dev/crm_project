import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/helper';
import { setAuthCookie } from '@/lib/helper';
import { createToken } from '@/lib/jwt';
import User from '../../../../../model/User';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { employeeId, action } = await request.json();

    // ==================== EXIT IMPERSONATION ====================
    if (action === "exit") {
      // Allow exit if user is admin OR if they are currently impersonating
      const isAdmin = currentUser.role === 'admin';
      const isImpersonating = (currentUser as any).impersonatingBy; // Flag from token

      if (!isAdmin && !isImpersonating) {
        return NextResponse.json({ success: false, message: "Only admin can exit impersonation" }, { status: 403 });
      }

      // Restore original admin session
      const adminUser = await User.findOne({ 
        employeeId: isImpersonating || currentUser.employeeId 
      });

      if (!adminUser) {
        return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 });
      }

      const token = createToken({
        userId: adminUser._id.toString(),
        employeeId: adminUser.employeeId,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
      });

      const response = NextResponse.json({
        success: true,
        message: "Exited impersonation mode",
        user: adminUser
      });

      setAuthCookie(token);
      return response;
    }

    // ==================== SWITCH TO EMPLOYEE ====================
    if (!employeeId) {
      return NextResponse.json({ success: false, message: "Employee ID required" }, { status: 400 });
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const targetUser = await User.findOne({ employeeId });
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    const token = createToken({
      userId: targetUser._id.toString(),
      employeeId: targetUser.employeeId,
      email: targetUser.email,
      role: targetUser.role,
      name: targetUser.name,
      impersonatingBy: currentUser.employeeId   // Flag for exit
    });

    const response = NextResponse.json({
      success: true,
      message: `Switched to ${targetUser.name}`,
      user: {
        name: targetUser.name,
        employeeId: targetUser.employeeId,
        role: targetUser.role,
      }
    });

    setAuthCookie(token);
    return response;

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Operation failed" }, { status: 500 });
  }
}