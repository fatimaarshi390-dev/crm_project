import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MarketingSpend from '../../../../../model/MarketingSpend';
import Admission from '../../../../../model/Admission';
import Lead from '../../../../../model/Leads';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || '';

    if (!month) {
      return NextResponse.json({ success: false, message: "Month is required" }, { status: 400 });
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const mon  = parseInt(monthStr);

    // ── Marketing Spend ──
    const spendData = await MarketingSpend.findOne({ month }).lean();
    const spend = spendData || {};

    const totalInvestment  = (spend as any).totalInvestment || 0;
    const weeklyInvestment = Math.round(totalInvestment / 4);

    // ── Weeks ──
    const weeks = [
      { week: 'Week 1', start: new Date(year, mon - 1, 1),  end: new Date(year, mon - 1, 7,  23, 59, 59, 999) },
      { week: 'Week 2', start: new Date(year, mon - 1, 8),  end: new Date(year, mon - 1, 14, 23, 59, 59, 999) },
      { week: 'Week 3', start: new Date(year, mon - 1, 15), end: new Date(year, mon - 1, 21, 23, 59, 59, 999) },
      { week: 'Week 4', start: new Date(year, mon - 1, 22), end: new Date(year, mon,      0, 23, 59, 59, 999) },
    ];

    const weeklyData = await Promise.all(
      weeks.map(async ({ week, start, end }) => {

        // ── Revenue + Collection from Admission model ──
        const admissions = await Admission.find({
          createdAt: { $gte: start, $lte: end }
        }).lean();

        let revenue    = 0;
        let collection = 0;
        const collectionDates: string[] = [];

        for (const a of admissions as any[]) {
          revenue += Number(a.afterDiscount) || Number(a.fee) || 0;

          if (a.installmentAmounts && a.paidDates) {
            a.installmentAmounts.forEach((amt: number, i: number) => {
              if (a.installmentPaid?.[i] && a.paidDates?.[i]) {
                const paidDateStr = a.paidDates[i];
                if (paidDateStr) {
                  const paidDate = new Date(paidDateStr);
                  if (paidDate >= start && paidDate <= end) {
                    collection += Number(amt) || 0;
                    collectionDates.push(paidDateStr);
                  }
                }
              }
            });
          }
        }

        // ── Admissions count from Leads (for cost per admission) ──
        const admittedLeadsCount = await Lead.countDocuments({
          admissionStatus: { $regex: /^admitted$/i },
          admissionDate: { $gte: start, $lte: end }
        });

        // ── Cost Per Admission ──
        const costPerAdmission = admittedLeadsCount > 0
          ? Math.round(weeklyInvestment / admittedLeadsCount)
          : 0;

        const notCollected = revenue - collection;

        return {
          week,
          investment:        weeklyInvestment,
          revenue,
          collection,
          notCollected,
          profit:            revenue - weeklyInvestment,
          admissionsCount:   admittedLeadsCount,
          costPerAdmission,
          collectionDates:   [...new Set(collectionDates)],
        };
      })
    );

    // ── Weekly ROI ──
    const weeklyRoiData = weeklyData.map(w => ({
      week:       w.week,
      roi:        w.investment > 0
        ? parseFloat(((w.collection - w.investment) / w.investment * 100).toFixed(1))
        : 0,
      investment: w.investment,
      collection: w.collection,
    }));

    // ── Monthly Summary ──
    const totalRevenue          = weeklyData.reduce((sum, w) => sum + w.revenue, 0);
    const totalCollection       = weeklyData.reduce((sum, w) => sum + w.collection, 0);
    const totalNotCollected     = totalRevenue - totalCollection;
    const totalProfit           = totalCollection - totalInvestment;
    const totalAdmissions       = weeklyData.reduce((sum, w) => sum + w.admissionsCount, 0);
    const totalCostPerAdmission = totalAdmissions > 0
      ? Math.round(totalInvestment / totalAdmissions)
      : 0;
    const roi = totalInvestment > 0
      ? parseFloat(((totalProfit / totalInvestment) * 100).toFixed(2))
      : 0;
    // ── Course-wise Revenue ──
const courseWiseData = await Admission.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59, 999)
      }
    }
  },
  {
    $group: {
      _id: "$course",
      totalRevenue:    { $sum: "$afterDiscount" },
      totalCollection: { $sum: "$totalPaid" },
      totalAdmissions: { $sum: 1 }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);

const courseGraphData = courseWiseData.map((item: any) => ({
  course:          item._id || "Unknown",
  revenue:         item.totalRevenue    || 0,
  collection:      item.totalCollection || 0,
  admissions:      item.totalAdmissions || 0,
  costPerAdmission: item.totalAdmissions > 0
    ? Math.round(totalInvestment / item.totalAdmissions)
    : 0,
}));
    return NextResponse.json({
      success: true,
      month,
      spend,
      weeklyData,
      weeklyRoiData,
      courseGraphData,
      summary: {
        totalInvestment,
        totalRevenue,
        totalCollection,
        totalNotCollected,
        totalProfit,
        roi,
        totalAdmissions,
        totalCostPerAdmission,

      }
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}