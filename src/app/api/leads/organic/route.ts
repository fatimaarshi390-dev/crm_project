// app/api/leads/organic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '../../../../../model/Leads';
import WeeklyTarget from '../../../../../model/WeeklyTarget';
import { getUserFromCookies } from '@/lib/helper';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const preDemoDateStr = formData.get('preDemoDate') as string | null;
    const demoDateStr = formData.get('demoDate') as string | null;
    const admissionStatus = formData.get('admissionStatus') as string | null;
    const salesDeck = formData.get('salesDeck') as string | null;
    const reminder = formData.get('reminder') as string | null;

    let status = 'fresh';
    let admissionDate = null;
    let preDemoActualDate = null;
    let demoDateGivenAt = null;
    let salesDeckDate = null;
    let reminderDate = null;

    if (admissionStatus === 'Admitted') {
      status = 'admission';
      admissionDate = new Date();
    } else if (demoDateStr) {
      status = 'demo-day';
      demoDateGivenAt = new Date();
    } else if (preDemoDateStr) {
      status = 'pre-demo';
      preDemoActualDate = new Date();
    }

    if (salesDeck === 'Yes') salesDeckDate = new Date();
    if (reminder === 'Yes') reminderDate = new Date();

    const photoFiles = formData.getAll('photo') as File[];
    const photoUrls: string[] = [];
    photoFiles.forEach((file, index) => {
      if (file && file.size > 0) {
        photoUrls.push(`uploads/${Date.now()}-${index}-${file.name}`);
      }
    });

    const leadData: any = {
      eqId: `ORG${Date.now()}`,
      eqName: formData.get('eqName'),
      contact: formData.get('contact'),
      city: formData.get('city'),
      state: formData.get('state'),
      address: formData.get('address'),
      email: formData.get('email'),
      software: formData.get('software'),
      fee: formData.get('fee') ? Number(formData.get('fee')) : null,
      admissionStatus: admissionStatus || 'Pending',
      admissionDate,
      preDemoDate: preDemoDateStr ? new Date(preDemoDateStr) : null,
      preDemoActualDate,
      isPreDemo: !!preDemoDateStr,
      demoDate: demoDateStr ? new Date(demoDateStr) : null,
      demoDateGivenAt,
      salesDeck: salesDeck || 'No',
      salesDeckDate,
      reminder: reminder || 'No',
      reminderDate,
      sourceReference: formData.get('sourceReference'),
      source: 'organic',
      uploadedBy: currentUser.employeeId,
      empId: currentUser.employeeId,
      empName: currentUser.name,
      status,
      isPostDemo: false,
      photoUrl: photoUrls,
    };

    const newLead = await Lead.create(leadData);

    // ============================================================
    // INCREMENT WeeklyTarget achievedAdmissions if Admitted
    // ============================================================
    if (admissionStatus === 'Admitted') {
      const now = new Date();

      // Find the current week's target for this employee
      // Week = Mon to Sun containing today
      const dayOfWeek = now.getDay() || 7; // 1=Mon, 7=Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const updatedTarget = await WeeklyTarget.findOneAndUpdate(
        {
          employeeId: currentUser.employeeId,
          createdAt: { $gte: monday, $lte: sunday }
        },
        {
          $inc: { achievedAdmissions: 1 }
        },
        {
          new: true
        }
      );

      // If no weekly target exists for this week, create one
      if (!updatedTarget) {
        await WeeklyTarget.create({
          employeeId: currentUser.employeeId,
          employeeName: currentUser.name,
          achievedAdmissions: 1,
          achievedCalls: 0,
          targetCalls: 0,
          targetAdmissions: 0,
          createdAt: now,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Organic Lead Added Successfully!",
      data: newLead
    });

  } catch (error: any) {
    console.error("Organic Lead API Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to add organic lead"
    }, { status: 500 });
  }
}