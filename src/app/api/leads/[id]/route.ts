// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Lead from '../../../../../model/Leads';
import WeeklyTarget from '../../../../../model/WeeklyTarget';
import dbConnect from '@/lib/mongodb';
import { getUserFromCookies } from '@/lib/helper';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromCookies();
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    let photoFile: File | null = null;

    // Handle FormData (for image upload) or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      photoFile = formData.get('photo') as File | null;

      body = {};
      formData.forEach((value, key) => {
        if (key !== 'photo') {
          body[key] = value;
        }
      });
    } else {
      body = await request.json();
    }

    console.log("📥 Received Payload:", body);
    console.log("📸 Photo Received:", photoFile ? photoFile.name : "No photo");

    const currentLead = await Lead.findById(id);
    if (!currentLead) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    const updateData: any = {};

    // ==================== AUTO SAVE EMPLOYEE INFO ====================
    if (
      currentLead.status === 'fresh' || 
      body.preDemoDate || 
      (body.status === 'pre-demo' && currentLead.status === 'fresh')
    ) {
      updateData.empId = currentUser.employeeId || currentUser.id;
      updateData.empName = currentUser.name || currentUser.employeeName;
    }

    // ==================== BASIC FIELDS ====================
    if (body.salesDeck !== undefined) updateData.salesDeck = body.salesDeck;
    if (body.reminder !== undefined) updateData.reminder = body.reminder;
    if (body.remark !== undefined) updateData.remark = body.remark;
    if (body.demoDoneBy !== undefined) updateData.demoDoneBy = body.demoDoneBy;   // ← ADD THIS}
    if (body.interested !== undefined) updateData.interested = body.interested;
    if (body.admissionStatus) updateData.admissionStatus = body.admissionStatus;

    // ==================== COURSE FIELD (NEW) ====================
    if (body.course !== undefined && body.course !== "") {
      updateData.course = body.course;
    }

    // ==================== DATES & HISTORY ====================
    if (body.preDemoDate) {
      const newDate = new Date(body.preDemoDate);
      if (currentLead.preDemoDate) {
        updateData.preDemoDateHistory = [...(currentLead.preDemoDateHistory || []), currentLead.preDemoDate];
      }
      updateData.preDemoExpectedDate = newDate;
      updateData.preDemoActualDate = new Date();
      updateData.preDemoDate = newDate;
      updateData.isPreDemo = true;
    }

    if (body.demoDate) {
      const newDate = new Date(body.demoDate);
      if (currentLead.demoDate) {
        updateData.demoDateHistory = [...(currentLead.demoDateHistory || []), currentLead.demoDate];
      }
      updateData.demoDate = newDate;
      updateData.demoDateGivenAt = new Date();
    }

    if (body.postDemoDate) {
      const newDate = new Date(body.postDemoDate);
      if (currentLead.postDemoDate) {
        updateData.postDemoDateHistory = [...(currentLead.postDemoDateHistory || []), currentLead.postDemoDate];
      }
      updateData.postDemoDate = newDate;
      updateData.isPostDemo = true;
    }

    // ==================== SALES DECK & REMINDER ====================
    if (body.salesDeck === 'Yes') {
      updateData.salesDeckDate = new Date();
    }
    if (body.reminder === 'Yes') {
      updateData.reminderDate = new Date();
    }

    // ==================== DEMO DONE & ADMISSION ====================
    if (body.demoDone === true) updateData.demoDoneDate = new Date();
    if (body.admissionStatus === 'Admitted') updateData.admissionDate = new Date();

    // ==================== STATUS LOGIC ====================
    if (body.status) {
      updateData.status = body.status;
    } else if (body.admissionStatus === 'Admitted') {
      updateData.status = 'admission';
    } else if (body.postDemoDate) {
      updateData.status = 'post-demo';
    } else if (body.demoDate) {
      updateData.status = 'demo-day';
    } else if (body.preDemoDate) {
      updateData.status = 'pre-demo';
    }

    // ==================== PHOTO UPLOAD ====================
    if (photoFile) {
      const newPhotoUrl = `uploads/${Date.now()}-${photoFile.name}`;
      updateData.photoUrl = [...(currentLead.photoUrl || []), newPhotoUrl];
      console.log("📸 New Photo Added:", newPhotoUrl);
    }

    console.log("💾 Updating with:", updateData);

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("✅ Final Updated Lead:", updatedLead);

    // ==================== WEEKLY TARGET ====================
    if (body.increaseCall === true) {
      const today = new Date();
      const currentMonth = today.toLocaleString('default', { month: 'long' });
      const currentWeek = Math.ceil(today.getDate() / 7);

      await WeeklyTarget.findOneAndUpdate(
        { employeeId: currentUser.employeeId, month: currentMonth, weekNumber: currentWeek },
        { $inc: { achievedCalls: 1 } },
        { upsert: true, new: true }
      );
    }

    if (body.admissionStatus === 'Admitted' && currentLead.admissionStatus !== 'Admitted') {
      const today = new Date();
      const currentMonth = today.toLocaleString('default', { month: 'long' });
      const currentWeek = Math.ceil(today.getDate() / 7);

      await WeeklyTarget.findOneAndUpdate(
        { employeeId: currentUser.employeeId, month: currentMonth, weekNumber: currentWeek },
        { $inc: { achievedAdmissions: 1 } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead Updated Successfully!",
      data: updatedLead
    });

  } catch (error: any) {
    console.error("❌ PATCH Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}