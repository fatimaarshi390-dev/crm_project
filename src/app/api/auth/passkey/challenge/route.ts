import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/helper';
import dbConnect from '@/lib/mongodb';
import User from '../../../../../../model/User';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get('userId');

    let employeeId: string | null = null;
    let name: string | null = null;
    let email: string | null = null;

    // Case 1: Registration (User already logged in hai)
    const currentUser = await getUserFromCookies();
    if (currentUser) {
      employeeId = currentUser.employeeId;
      name = currentUser.name;
      email = currentUser.email;
    } 
    // Case 2: Login (Frontend se userId bhej sakte ho)
    else if (userIdFromQuery) {
      employeeId = userIdFromQuery;
      
      const user = await User.findOne({ employeeId: userIdFromQuery });
      if (user) {
        name = user.name;
        email = user.email;
      }
    } 
    else {
      return NextResponse.json({ 
        success: false, 
        message: "Please login first for registration" 
      }, { status: 401 });
    }

    if (!employeeId) {
      return NextResponse.json({ 
        success: false, 
        message: "User ID not found" 
      }, { status: 400 });
    }

    const challenge = crypto.randomBytes(32).toString('base64');

    return NextResponse.json({
      success: true,
      challenge,
      userId: employeeId,
      name,
      email,
    });

  } catch (error: any) {
    console.error("Challenge API Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate challenge" 
    }, { status: 500 });
  }
}