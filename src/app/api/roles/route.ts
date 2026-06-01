import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '../../../../model/Role';

export async function GET() {
  try {
    await dbConnect();
    const roles = await Role.find({ isActive: true }).sort({ roleName: 1 }).lean();
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { roleName } = await request.json();

    if (!roleName?.trim()) {
      return NextResponse.json({ success: false, message: "Role name is required" }, { status: 400 });
    }

    const newRole = await Role.create({ roleName: roleName.trim() });
    return NextResponse.json({ success: true, message: "Role created successfully", data: newRole });

  } catch (error: any) {
    const message = error.code === 11000 ? "Role already exists" : error.message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}