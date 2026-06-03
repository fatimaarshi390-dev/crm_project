import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeeklyTarget from '../../../../../model/WeeklyTarget';
import Lead from '../../../../../model/Leads';
import { getUserFromCookies } from '@/lib/helper';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year       = parseInt(searchParams.get('year')   || String(new Date().getFullYear()));
    const month      = searchParams.get('month')  || '';
    const weekNumber = parseInt(searchParams.get('week')   || '1');

    if (!month) {
      return NextResponse.json({ success: false, message: "Month is required" }, { status: 400 });
    }

    // ── WeeklyTarget fetch ──
    const targetRecord = await WeeklyTarget.findOne({
      employeeId: user.employeeId,
      year,
      month,
      weekNumber,
    }).lean();

    // ── Week date range calculate ──
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

   const weekRanges: Record<number, { start: Date; end: Date }> = {
  1: { start: new Date(year, monthIndex, 1),  end: new Date(year, monthIndex, 7,  23, 59, 59, 999) },
  2: { start: new Date(year, monthIndex, 8),  end: new Date(year, monthIndex, 14, 23, 59, 59, 999) },
  3: { start: new Date(year, monthIndex, 15), end: new Date(year, monthIndex, 21, 23, 59, 59, 999) },
  4: { start: new Date(year, monthIndex, 22), end: new Date(year, monthIndex, 28, 23, 59, 59, 999) },
  5: { start: new Date(year, monthIndex, 29), end: new Date(year, monthIndex + 1, 0, 23, 59, 59, 999) },
};

    const range = weekRanges[weekNumber] || weekRanges[1];
    const { start, end } = range;

    // ── Leads fetch for this week ──
    const leads = await Lead.find({
      empId: user.employeeId,
      $or: [
        { preDemoActualDate: { $gte: start, $lte: end } },
        { demoDoneDate:      { $gte: start, $lte: end } },
        { postDemoDate:      { $gte: start, $lte: end } },
        { admissionDate:     { $gte: start, $lte: end } },
      ]
    }).lean();

    // ── Count per activity ──
    const preDemoLeads  = leads.filter((l: any) =>
      l.preDemoActualDate &&
      new Date(l.preDemoActualDate) >= start &&
      new Date(l.preDemoActualDate) <= end
    );

    const demoLeads = leads.filter((l: any) =>
      l.demoDoneDate &&
      new Date(l.demoDoneDate) >= start &&
      new Date(l.demoDoneDate) <= end
    );

    const postDemoLeads = leads.filter((l: any) =>
      l.postDemoDate &&
      new Date(l.postDemoDate) >= start &&
      new Date(l.postDemoDate) <= end
    );

    const admissionLeads = leads.filter((l: any) =>
      l.admissionDate &&
      new Date(l.admissionDate) >= start &&
      new Date(l.admissionDate) <= end
    );

    const t = (targetRecord as any) || {};

    return NextResponse.json({
      success: true,
      data: {
        weekNumber,
        year,
        month,
        weekRange: `${start.toDateString()} → ${end.toDateString()}`,
        targets: {
          calls:      t.targetCalls      || 0,
          admissions: t.targetAdmissions || 0,
          revenue:    t.targetRevenue    || 0,
          collection: t.targetCollection || 0,
        },
        achieved: {
          calls:      t.achievedCalls      || 0,
          admissions: t.achievedAdmissions || 0,
          revenue:    t.achievedRevenue    || 0,
          collection: t.achievedCollection || 0,
        },
        thisWeek: {
          preDemoCount:   preDemoLeads.length,
          demoCount:      demoLeads.length,
          postDemoCount:  postDemoLeads.length,
          admissionCount: admissionLeads.length,
          preDemoLeads:   JSON.parse(JSON.stringify(preDemoLeads)),
          demoLeads:      JSON.parse(JSON.stringify(demoLeads)),
          postDemoLeads:  JSON.parse(JSON.stringify(postDemoLeads)),
          admissionLeads: JSON.parse(JSON.stringify(admissionLeads)),
        }
      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}