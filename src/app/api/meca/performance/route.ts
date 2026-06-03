// app/api/meca/performance/route.ts

import { NextResponse } from 'next/server';
import Lead from '../../../../../model/Leads';
import WeeklyTarget from '../../../../../model/WeeklyTarget';
import dbConnect from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employeeId');
    const filterType = searchParams.get('filterType') || 'daily';
    const selectedDate = searchParams.get('selectedDate') || '';
    const selectedMonth = searchParams.get('selectedMonth') || '';
    const selectedYear = searchParams.get('selectedYear') || '';
    const weekStart = searchParams.get('weekStart') || '';
    const weekEnd = searchParams.get('weekEnd') || '';

    // ================= EMPLOYEES from Leads =================
    const employees = await Lead.aggregate([
      { $match: { empId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$empId",
          employeeName: { $first: "$empName" }
        }
      },
      {
        $project: { _id: 0, employeeId: "$_id", employeeName: 1 }
      }
    ]);

    // =========================================================
    // HELPER: Build date range from filter
    // =========================================================
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (filterType === 'daily' && selectedDate) {
      rangeStart = new Date(`${selectedDate}T00:00:00.000Z`);
      rangeEnd = new Date(`${selectedDate}T23:59:59.999Z`);
    } else if (filterType === 'week') {
      if (weekStart && weekEnd) {
        rangeStart = new Date(weekStart);
        rangeEnd = new Date(weekEnd);
        rangeEnd.setHours(23, 59, 59, 999);
      }
    } else if (filterType === 'month' && selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      rangeStart = new Date(`${yearStr}-${monthStr}-01T00:00:00.000Z`);
      rangeEnd = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);
    } else if (filterType === 'year' && selectedYear) {
      rangeStart = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
      rangeEnd = new Date(`${selectedYear}-12-31T23:59:59.999Z`);
    }

    // =========================================================
    // HELPER: X-axis grouping
    // =========================================================
    const getDateGroup = (dateField: string) => {
      if (filterType === 'year') {
        return { $dateToString: { format: "%m-%Y", date: `$${dateField}` } };
      }
      if (filterType === 'month') {
        return { $week: `$${dateField}` };
      }
      return { $dateToString: { format: "%d-%m-%Y", date: `$${dateField}` } };
    };

    const formatLabel = (key: string | number): string => {
      if (filterType === 'month') return `Week ${key}`;
      if (filterType === 'year') return formatMonthLabel(String(key));
      return String(key);
    };

    // =========================================================
    // GRAPH 1 -> LEADS UPLOADED vs CALLS MADE
    // =========================================================

    // --- Leads Uploaded (no emp filter — marketing uploads all) ---
    const leadUploadMatch: any = {
      source: "marketing-upload",
      uploadedAt: { $exists: true, $ne: null }
    };
    if (rangeStart && rangeEnd) {
      leadUploadMatch.uploadedAt = { $gte: rangeStart, $lte: rangeEnd };
    }

    const leadsUploadedData = await Lead.aggregate([
      { $match: leadUploadMatch },
      {
        $group: {
          _id: getDateGroup('uploadedAt'),
          totalLeads: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // --- Calls Made ---
    // Rule: preDemoActualDate preferred → fallback to demoDateGivenAt
    // 1 lead = 1 call (no duplicate)
    // empId filter applied
    const callsData = await Lead.aggregate([
      {
        $match: {
          source: "marketing-upload",
          ...(employeeId && employeeId !== 'all' ? { empId: employeeId } : {}),
          $or: [
            { preDemoActualDate: { $exists: true, $ne: null } },
            { demoDateGivenAt: { $exists: true, $ne: null } }
          ]
        }
      },
      {
        $addFields: {
          effectiveCallDate: {
            $ifNull: ["$preDemoActualDate", "$demoDateGivenAt"]
          }
        }
      },
      ...(rangeStart && rangeEnd ? [{
        $match: {
          effectiveCallDate: { $gte: rangeStart, $lte: rangeEnd }
        }
      }] : []),
      {
        $group: {
          _id: getDateGroup('effectiveCallDate'),
          totalCalls: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // --- Merge leads + calls ---
    const allGraph1Keys = Array.from(new Set([
      ...leadsUploadedData.map(d => String(d._id)),
      ...callsData.map(d => String(d._id))
    ])).sort();

    const graph1Data = allGraph1Keys.map((key) => {
      const lead = leadsUploadedData.find(d => String(d._id) === key);
      const call = callsData.find(d => String(d._id) === key);
      return {
        date: formatLabel(key),
        totalLeads: lead?.totalLeads || 0,
        totalCalls: call?.totalCalls || 0
      };
    });

    const totalMarketingLeads = await Lead.countDocuments({ source: "marketing-upload" });

    // =========================================================
    // GRAPH 2 -> ADMISSIONS
    // =========================================================
 // =========================================================
// GRAPH 2 -> ADMISSIONS (Marketing + Organic separate)
// =========================================================
const admissionsMatch: any = {
  admissionStatus: { $regex: /^admitted$/i },
  admissionDate: { $exists: true, $ne: null }
};
if (rangeStart && rangeEnd) {
  admissionsMatch.admissionDate = { $gte: rangeStart, $lte: rangeEnd };
}
if (employeeId && employeeId !== 'all') {
  admissionsMatch.empId = employeeId;
}

const admissionsData = await Lead.aggregate([
  { $match: admissionsMatch },
  {
    $group: {
      _id: getDateGroup('admissionDate'),
      marketingAdmissions: {
        $sum: {
          $cond: [{ $eq: ["$source", "marketing-upload"] }, 1, 0]
        }
      },
      organicAdmissions: {
        $sum: {
          $cond: [{ $ne: ["$source", "marketing-upload"] }, 1, 0]
        }
      },
      totalAdmissions: { $sum: 1 }
    }
  },
  { $sort: { "_id": 1 } }
]);

const mergedAdmissions = admissionsData.map((item) => ({
  date: formatLabel(item._id),
  marketingAdmissions: item.marketingAdmissions,
  organicAdmissions: item.organicAdmissions,
  totalAdmissions: item.totalAdmissions
}));
    // =========================================================
    // GRAPH 3 -> ORGANIC LEADS VS ADMISSIONS
    // =========================================================
    const organicMatch: any = {
      source: { $ne: "marketing-upload" },
      uploadedAt: { $exists: true, $ne: null }
    };
    if (rangeStart && rangeEnd) {
      organicMatch.uploadedAt = { $gte: rangeStart, $lte: rangeEnd };
    }
    if (employeeId && employeeId !== 'all') {
      organicMatch.uploadedBy = employeeId;
    }

    const organicRawData = await Lead.aggregate([
      { $match: organicMatch },
      {
        $group: {
          _id: getDateGroup('uploadedAt'),
          totalOrganicLeads: { $sum: 1 },
          totalAdmissions: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$admissionStatus", regex: /admitted/i } },
                1, 0
              ]
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const organicGraphData = organicRawData.map((item) => ({
      date: formatLabel(item._id),
      totalOrganicLeads: item.totalOrganicLeads,
      totalAdmissions: item.totalAdmissions
    }));

    const totalOrganicLeads = organicRawData.reduce(
      (sum, item) => sum + item.totalOrganicLeads, 0
    );

    // =========================================================
    // GRAPH 4 -> LEADS/ADMISSIONS RATIO
    // =========================================================
   // ==================== GRAPH 4 - LEADS/ADMISSIONS RATIO ====================
// =========================================================
// GRAPH 4 - LEADS/ADMISSIONS RATIO + TOTAL LEADS UPLOADED
// =========================================================
// =========================================================
// GRAPH 4 - LEADS/ADMISSIONS RATIO + TOTAL LEADS UPLOADED
// =========================================================
const graph4Match: any = {
  uploadedAt: { $exists: true, $ne: null }   // ← All leads (no status filter)
};

if (rangeStart && rangeEnd) {
  graph4Match.uploadedAt = { $gte: rangeStart, $lte: rangeEnd };
}
if (employeeId && employeeId !== 'all') {
  graph4Match.empId = employeeId;
}

const weeklyAdmissionsData = await Lead.aggregate([
  { $match: graph4Match },
  {
    $group: {
      _id: getDateGroup('uploadedAt'),
      totalLeads: { $sum: 1 },                    // ← ALL uploaded leads
      marketingLeads: {
        $sum: { $cond: [{ $eq: ["$source", "marketing-upload"] }, 1, 0] }
      },
      organicLeads: {
        $sum: { $cond: [{ $ne: ["$source", "marketing-upload"] }, 1, 0] }
      },
      marketingAdmissions: {
        $sum: {
          $cond: [
            { $and: [
              { $eq: ["$source", "marketing-upload"] },
              { $regexMatch: { input: "$admissionStatus", regex: /admitted/i } }
            ]},
            1, 0
          ]
        }
      },
      organicAdmissions: {
        $sum: {
          $cond: [
            { $and: [
              { $ne: ["$source", "marketing-upload"] },
              { $regexMatch: { input: "$admissionStatus", regex: /admitted/i } }
            ]},
            1, 0
          ]
        }
      }
    }
  },
  { $sort: { "_id": 1 } }
]);

const formattedWeeklyAdmissions = weeklyAdmissionsData.map((item) => ({
  dateRange: formatLabel(item._id),
  totalLeads: item.totalLeads,                     // ← This is now correct
  marketingLeads: item.marketingLeads,
  organicLeads: item.organicLeads,
  marketingAdmissions: item.marketingAdmissions,
  organicAdmissions: item.organicAdmissions,
  marketingRatio: item.marketingAdmissions > 0 
    ? parseFloat((item.marketingLeads / item.marketingAdmissions).toFixed(2)) 
    : 0,
  organicRatio: item.organicAdmissions > 0 
    ? parseFloat((item.organicLeads / item.organicAdmissions).toFixed(2)) 
    : 0,
}));
    const totalAdmissionsCount = formattedWeeklyAdmissions.reduce(
      (sum, item) => sum + item.marketingAdmissions + item.organicAdmissions, 0
    );

    // =========================================================
    // DEMO DATA
    // =========================================================
    const demoMatch: any = {
      demoDate: { $exists: true, $ne: null },
      admissionDate: { $exists: true, $ne: null },
      admissionStatus: { $regex: /^admitted$/i }
    };
    if (rangeStart && rangeEnd) {
      demoMatch.admissionDate = { $gte: rangeStart, $lte: rangeEnd };
    }
    if (employeeId && employeeId !== 'all') {
      demoMatch.empId = employeeId;
    }

    const demoLeadsCount = await Lead.countDocuments({
      demoDate: { $exists: true, $ne: null }
    });

    const rawDemoAdmissionData = await Lead.aggregate([
      { $match: demoMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$admissionDate" } },
          totalAdmissions: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const demoAdmissionData = rawDemoAdmissionData.map((item) => ({
      date: item._id,
      totalAdmissions: item.totalAdmissions
    }));
  // =========================================================
// GRAPH 5 - DELAY ANALYSIS (New)
// =========================================================
// =========================================================
// GRAPH 5 - DELAY ANALYSIS (New)
// =========================================================
// =========================================================
// GRAPH 5 - DELAY ANALYSIS (New)
// =========================================================
// =========================================================
// GRAPH 5 - DELAY ANALYSIS (New)
// =========================================================
let delayGraphData: any[] = [];

if (filterType === 'daily' && selectedDate) {
  const targetDate = new Date(`${selectedDate}T00:00:00.000Z`);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const delayData = await Lead.aggregate([
    {
      $match: {
        uploadedAt: { $gte: targetDate, $lt: nextDay },
        source: "marketing-upload"
      }
    },
    {
      $group: {
        _id: null,
        totalLeads: { $sum: 1 },
        notCalled: {
          $sum: { $cond: [{ $eq: ["$status", "fresh"] }, 1, 0] }
        },
        calledLeads: {
          $sum: { $cond: [{ $ne: ["$status", "fresh"] }, 1, 0] }
        },
        totalDelayDays: {
          $sum: {
            $cond: [
              { $ne: ["$status", "fresh"] },
              {
                $divide: [
                  {
                    $subtract: [
                      { $ifNull: ["$preDemoActualDate", "$demoDateGivenAt"] },
                      "$uploadedAt"
                    ]
                  },
                  1000 * 60 * 60 * 24   // ← Changed to DAYS
                ]
              },
              0
            ]
          }
        }
      }
    }
  ]);

const d = delayData[0] || { 
  totalLeads: 0, 
  notCalled: 0, 
  calledLeads: 0, 
  totalDelayDays: 0 
};

const avgDelayDays = d.calledLeads > 0 
  ? parseFloat((d.totalDelayDays / d.calledLeads).toFixed(1)) 
  : 0;

  delayGraphData = [{
    date: selectedDate,
    totalLeads: d.totalLeads,
    notCalled: d.notCalled,
    avgDelayHours: avgDelayDays   // Renamed for clarity but value is now in days
  }];
}// =========================================================
    // RESPONSE
    // =========================================================
    return NextResponse.json({
      success: true,
      employees,
      filterType,
      graphData: graph1Data,
      totalMarketingLeads,
      admissionGraphData: mergedAdmissions,
      demoAdmissionData,
      demoLeadsCount,
      weeklyAdmissions: formattedWeeklyAdmissions,
      totalAdmissionsCount,
      organicGraphData,
      totalOrganicLeads,
      delayGraphData
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ─── Helper ───────────────────────────────────────────────
function formatMonthLabel(key: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [mm, yyyy] = key.split('-');
  const idx = parseInt(mm) - 1;
  return `${months[idx]} ${yyyy}`;
}