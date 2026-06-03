import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyTarget extends Document {
  employeeId: string;
  employeeName: string;

  year: number;            // Auto-filled from system
  month: string;
  weekNumber: number;

  targetCalls: number;
  targetAdmissions: number;
  targetRevenue: number;
  targetCollection: number;

  achievedCalls: number;
  achievedAdmissions: number;
  achievedRevenue: number;
  achievedCollection: number;

  callsProgress: number;
  admissionsProgress: number;
  revenueProgress: number;
  collectionProgress: number;

  isApproved: boolean;
}

const WeeklyTargetSchema = new Schema<IWeeklyTarget>(
  {
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },

    year: { 
      type: Number, 
      required: true,
      default: () => new Date().getFullYear()   // ← Automatic Current Year
    },

    month: { type: String, required: true },
    weekNumber: { type: Number, required: true, min: 1, max: 5 },

    targetCalls: { type: Number, default: 0 },
    targetAdmissions: { type: Number, default: 0 },
    targetRevenue: { type: Number, default: 0 },
    targetCollection: { type: Number, default: 0 },

    achievedCalls: { type: Number, default: 0 },
    achievedAdmissions: { type: Number, default: 0 },
    achievedRevenue: { type: Number, default: 0 },
    achievedCollection: { type: Number, default: 0 },

    callsProgress: { type: Number, default: 0 },
    admissionsProgress: { type: Number, default: 0 },
    revenueProgress: { type: Number, default: 0 },
    collectionProgress: { type: Number, default: 0 },

    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique constraint
WeeklyTargetSchema.index({ employeeId: 1, year: 1, month: 1, weekNumber: 1 }, { unique: true });

export default mongoose.models.WeeklyTarget || mongoose.model<IWeeklyTarget>('WeeklyTarget', WeeklyTargetSchema);