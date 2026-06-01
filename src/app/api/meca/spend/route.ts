import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MarketingSpend from '../../../../../model/MarketingSpend';
import { getUserFromCookies } from '@/lib/helper';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { month, facebookAds, googleAds, instagramAds, otherSpend, totalSalary } = body;

    if (!month) {
      return NextResponse.json({ success: false, message: "Month is required" }, { status: 400 });
    }

    const facebook  = Number(facebookAds  || 0);
    const google    = Number(googleAds    || 0);
    const instagram = Number(instagramAds || 0);
    const other     = Number(otherSpend   || 0);
    const salary    = Number(totalSalary  || 0);

    const totalMarketingSpend = facebook + google + instagram + other;
    const totalInvestment     = totalMarketingSpend + salary;

    const result = await MarketingSpend.findOneAndUpdate(
      { month },
      {
        month,
        facebookAds:  facebook,
        googleAds:    google,
        instagramAds: instagram,
        otherSpend:   other,
        totalSalary:  salary,
        totalMarketingSpend,
        totalInvestment,
        addedBy:   currentUser.employeeId || null,
        updatedBy: currentUser.employeeId || null,
      },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json({
      success: true,
      message: "Saved successfully",
      data: JSON.parse(JSON.stringify(result)),
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    const query = month ? { month } : {};

    const data = await MarketingSpend.find(query)
      .sort({ month: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(data)),
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}