import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../../../model/User';
import dbConnect from '@/lib/mongodb';
import { createToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/helper';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { credentialID } = await request.json();

    if (!credentialID) {
      return NextResponse.json({ success: false, message: "Credential ID is required" }, { status: 400 });
    }

    const user = await User.findOne({ 
      "credentials.credentialID": credentialID 
    }).select('+credentials');

    if (!user || !user.passkeyEnabled) {
      return NextResponse.json({ success: false, message: "Passkey not registered" }, { status: 401 });
    }

    const credential = user.credentials.find((c: any) => c.credentialID === credentialID);
    if (!credential) {
      return NextResponse.json({ success: false, message: "Credential not found" }, { status: 401 });
    }

    // Security counter
    credential.counter += 1;
    await user.save();

    // Create Token
    const token = createToken({
      userId: user._id.toString(),
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "✅ Fingerprint Login Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
      }
    });

   await setAuthCookie(token);

    return response;

  } catch (error: any) {
    console.error("Passkey Login Error:", error);
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}