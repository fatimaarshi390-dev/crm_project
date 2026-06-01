// app/api/divisions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Division from '../../../../../model/Division'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updated = await Division.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Division not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deleted = await Division.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Division not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Division deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}