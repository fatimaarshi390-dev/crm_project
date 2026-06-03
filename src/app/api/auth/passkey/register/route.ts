import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/helper';
import User from '../../../../../../model/User';
import dbConnect from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    const { credentialID, publicKey, deviceName } = await request.json();

    await User.findByIdAndUpdate(user._id, {
      $push: {
        credentials: {
          credentialID,
          publicKey,
          deviceName: deviceName || 'Unknown Device',
          registeredAt: new Date()
        }
      },
      passkeyEnabled: true
    });
    

    return NextResponse.json({ success: true, message: "Fingerprint/Passkey Registered Successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}