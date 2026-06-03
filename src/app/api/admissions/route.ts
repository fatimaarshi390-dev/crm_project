import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admission from '../../../../model/Admission';
import WeeklyTarget from '../../../../model/WeeklyTarget';
import { getUserFromCookies } from '@/lib/helper';

// ================= GET =================
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const eqId = searchParams.get('eqId');
    
    if (!eqId) return NextResponse.json({ success: false, message: "eqId required" }, { status: 400 });

    const admission = await Admission.findOne({ eqId });
    return NextResponse.json({ success: true, data: admission || null });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ================= POST =================


export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      eqId,
      name,
      course,
      baseFee,
      discountPercent,
      afterDiscount,
      noOfInstallments,
      installmentAmounts,
      installmentPaid,
      paidDates
    } = body;

    // Validation
    if (!eqId || !name || !course || !afterDiscount || !noOfInstallments) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    const admission = await Admission.create({
      eqId,
      eqName: name,
      course,
      baseFee: Number(baseFee),
      discountPercent: Number(discountPercent) || 0,
      afterDiscount: Number(afterDiscount),
      noOfInstallments: Number(noOfInstallments),
      installmentAmounts: installmentAmounts || [],
      installmentPaid: installmentPaid || [],
      paidDates: paidDates || [],
      totalPaid: (installmentAmounts || []).reduce((sum: number, amt: number, i: number) => 
        installmentPaid[i] ? sum + amt : sum, 0),
      addedBy: currentUser.employeeId,
      feeStatus: "Pending"
    });

    return NextResponse.json({
      success: true,
      message: "Admission record saved successfully",
      data: admission
    });

  } catch (error: any) {
    console.error("Admission POST Error:", error);
    return NextResponse.json({
      success: false,
      message: error.code === 11000 ? "This Enquiry ID already has an admission record" : "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}

// PATCH for updates
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromCookies();
    if (!currentUser) return NextResponse.json({ success: false }, { status: 401 });

    const body = await request.json();
    const { eqId } = body;

    const updated = await Admission.findOneAndUpdate(
      { eqId },
      {
        ...body,
        totalPaid: body.installmentAmounts?.reduce((sum: number, amt: number, i: number) => 
          body.installmentPaid?.[i] ? sum + amt : sum, 0) || 0,
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error("Admission PATCH Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ================= HELPER =================
async function updateAchievedRevenue(employeeId: string, amount: number) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.toLocaleString('default', { month: 'long' });
  const weekNumber = Math.ceil(today.getDate() / 7);

  await WeeklyTarget.findOneAndUpdate(
    { employeeId, year, month, weekNumber },
    { $inc: { achievedRevenue: amount } },
    { upsert: true, new: true }
  );

  console.log(`✅ Revenue Updated: +₹${amount} for ${employeeId}`);
}