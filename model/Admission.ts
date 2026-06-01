import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  eqId: string;
  eqName: string;
  course: string;

  baseFee: number;
  discountPercent: number;
  afterDiscount: number;

  noOfInstallments: number;
  installmentAmounts: number[];        // [9000, 9000, 9000, ...]
  installmentPaid: boolean[];          // [true, false, true, ...]
  paidDates: string[];                 // ["2026-05-19", "", "2026-05-18", ...]

  totalPaid: number;
  nextDueInstallment?: number;         // Next unpaid installment number (1-based)

  feeStatus: 'Pending' | 'Partially Paid' | 'Fully Paid';
  addedBy: string;                     // Employee ID of logged-in user
  revenueCredited: number;           // Amount already added to revenue
  revenueCreditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    eqId: { type: String, required: true, unique: true, trim: true },
    eqName: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },

    baseFee: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    afterDiscount: { type: Number, required: true },

    noOfInstallments: { type: Number, required: true },
    installmentAmounts: [{ type: Number }],
    installmentPaid: [{ type: Boolean, default: false }],
    paidDates: [{ type: String }],

    totalPaid: { type: Number, default: 0 },
    nextDueInstallment: { type: Number },

    feeStatus: { 
      type: String, 
      enum: ['Pending', 'Partially Paid', 'Fully Paid'], 
      default: 'Pending' 
    },
    revenueCredited: { type: Number, default: 0 },
    revenueCreditedAt: { type: Date },
    addedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Admission || mongoose.model<IAdmission>('Admission', AdmissionSchema);