import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');   // Login ke time optional

    // Generate secure challenge
    const challenge = crypto.randomBytes(32).toString('base64');

    return NextResponse.json({
      success: true,
      challenge,
      userId: null,        // Login ke liye null bhi chalega
    });

  } catch (error: any) {
    console.error("Challenge API Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate challenge" 
    }, { status: 500 });
  }
}