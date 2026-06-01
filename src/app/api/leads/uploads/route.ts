import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Lead from '../../../../../model/Leads';
import Course from '../../../../../model/Course';
import { getUserFromCookies } from '@/lib/helper';
import dbConnect from '@/lib/mongodb';
import Counter from '../../../../../model/Counter';

// ─── Sanitize Contact ─────────────────────────────────────
function sanitizeContact(contact: any): string {
  if (!contact) return '';
  const digits = String(contact).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

// ─── Course & Department ──────────────────────────────────
async function getCourseAndDepartment(adName: string): Promise<{ course: string; department: string }> {
  if (!adName) return { course: "General Course", department: "Digifootprints" };

  const nameLower = String(adName).toLowerCase().trim();

  try {
    const courseDoc = await Course.findOne({
      isActive: true,
      $or: [
        { name: { $regex: nameLower, $options: 'i' } },
        { name: { $regex: adName,   $options: 'i' } }
      ]
    });
    if (courseDoc) {
      return { course: courseDoc.name, department: courseDoc.department };
    }
  } catch (e) {}

  const cleaned = String(adName)
    .replace(/ad|campaign|new|202[0-9]|feb|may|jun|jul|aug|sep|oct|nov|dec/gi, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { course: cleaned || "General Course", department: "Digifootprints" };
}

// ─── Sequential Enquiry ID (atomic) ──────────────────────
async function generateEnquiryId(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'enquiryId' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `LD${String(counter.seq).padStart(3, '0')}`;
}

// ─── POST ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const user = await getUserFromCookies();
    if (!user || user.role !== 'marketing') {
      return NextResponse.json(
        { success: false, message: "Only Marketing can upload" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer   = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    let allLeads: any[] = [];
    let skipped = 0;

    // ── Parse all sheets ──
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData  = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      for (const row of jsonData as any[]) {
        const adName  = row['ad_name'] || row['Ad Name'] || row['campaign_name'] || row['adset_name'] || '';
        const { course, department } = await getCourseAndDepartment(adName);

        const rawEqId = String(row['id'] || row['lead_id'] || '').trim();
        const contact = sanitizeContact(row['phone_number'] || row['Phone Number'] || row['phone']);
        const eqName  = String(row['full_name'] || row['Full Name'] || row['name'] || '').trim();

        // Skip if no name or contact
        if (!eqName || !contact) {
          skipped++;
          continue;
        }

        allLeads.push({
          eqId:       rawEqId || `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          eqName,
          contact,
          course,
          department,
          city:       row['city']   || row['City']   || '',
          state:      row['state']  || row['State']  || '',
          email:      row['email']  || row['Email']  || '',
          source:     "marketing-upload",
          uploadedBy: user.employeeId,
          uploadedAt: new Date(),
          status:     "fresh",
          remark:     row['Remark'] || row['remark'] || '',
          priority:   'cold',
        });
      }
    }

    if (allLeads.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No valid leads found. Skipped: ${skipped}`
      }, { status: 400 });
    }

    // ── Duplicate check by eqId ──
    const incomingEqIds   = allLeads.map(l => l.eqId).filter(Boolean);
    const existingInDB    = await Lead.find(
      { eqId: { $in: incomingEqIds } },
      { eqId: 1 }
    ).lean();
    const existingEqIdSet = new Set(existingInDB.map((l: any) => String(l.eqId)));

    const newLeads      = allLeads.filter(l => !existingEqIdSet.has(String(l.eqId)));
    const duplicateCount = allLeads.length - newLeads.length;

    // All duplicates — block
    if (newLeads.length === 0) {
      return NextResponse.json({
        success: false,
        message: `All ${duplicateCount} leads already exist. No new leads uploaded.`,
        duplicates: duplicateCount,
      }, { status: 400 });
    }

    // ── Assign sequential enquiryId only to new leads ──
    for (const lead of newLeads) {
      lead.enquiryId = await generateEnquiryId();
    }

    // ── Insert new leads ──
    const result = await Lead.insertMany(newLeads, { ordered: false });

    return NextResponse.json({
      success: true,
      message: `${result.length} new leads uploaded${duplicateCount > 0 ? `, ${duplicateCount} duplicates skipped` : ''}.`,
      inserted:   result.length,
      duplicates: duplicateCount,
      skipped,
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Upload failed"
    }, { status: 500 });
  }
}