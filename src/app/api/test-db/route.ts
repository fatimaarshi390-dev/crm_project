import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "✅ MongoDB Connected Successfully!",
      timestamp: new Date().toISOString(),
      status: "OK"
    });

  } catch (error: any) {
    console.error("MongoDB Connection Error:", error);

    return NextResponse.json({
      success: false,
      message: "❌ MongoDB Connection Failed",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}