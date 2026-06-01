import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '../../../../../model/Leads';
import { getUserFromCookies } from '@/lib/helper';

export async function GET() {
  try {
    await dbConnect();
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ── 3 alag queries — har ek apne date field se ──

    // Pre-Demo aaj ka
    const preDemoLeads = await Lead.find({
      empId: user.employeeId,
      preDemoExpectedDate: { $gte: today, $lt: tomorrow }
    })
    .select('eqId eqName contact course preDemoExpectedDate')
    .lean();

    // Demo aaj ka
    const demoLeads = await Lead.find({
      empId: user.employeeId,
      demoDate: { $gte: today, $lt: tomorrow }
    })
    .select('eqId eqName contact course demoDate')
    .lean();

    // Post-Demo aaj ka
    const postDemoLeads = await Lead.find({
      empId: user.employeeId,
      postDemoDate: { $gte: today, $lt: tomorrow }
    })
    .select('eqId eqName contact course postDemoDate')
    .lean();

    const total = preDemoLeads.length + demoLeads.length + postDemoLeads.length;

    return NextResponse.json({
      success: true,
      data: {
        preDemoLeads: JSON.parse(JSON.stringify(preDemoLeads)),
        demoLeads:    JSON.parse(JSON.stringify(demoLeads)),
        postDemoLeads:JSON.parse(JSON.stringify(postDemoLeads)),
        preDemo:  preDemoLeads.length,
        demo:     demoLeads.length,
        postDemo: postDemoLeads.length,
        total
      }
    });

  } catch (error: any) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}