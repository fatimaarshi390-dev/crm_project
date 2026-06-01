// app/api/leads/route.ts
import { NextResponse } from 'next/server';
import Lead from '../../../../model/Leads';
import dbConnect from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/helper';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employeeId = currentUser.employeeId || currentUser.id;

    // ── Build query ──
    const query: any = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Only show logged-in user's leads (except fresh leads)
    if (status !== 'fresh' && status !== null && currentUser.role !== 'admin') {
      query.empId = employeeId;
    }

    // ── NEW: Search filter (name / phone / email) ──
    if (search) {
      query.$or = [
        { eqName:  { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query)
      .sort({ updatedAt: -1 })
      .limit(search ? 20 : 0) // limit 20 for search, no limit otherwise
      .lean();

    return NextResponse.json({
      success: true,
      data: leads
    });

  } catch (error: any) {
    console.error("❌ Leads API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}