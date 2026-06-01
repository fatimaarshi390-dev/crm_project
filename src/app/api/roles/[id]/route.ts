// app/api/roles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Role from '../../../../../model/Role'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return NextResponse.json({
        success: false,
        message: "Role not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedRole = await Role.findByIdAndDelete(id);

    if (!deletedRole) {
      return NextResponse.json({
        success: false,
        message: "Role not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}