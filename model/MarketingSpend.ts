import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketingSpend extends Document {
  month: string;
  facebookAds: number;
  googleAds: number;
  instagramAds: number;
  otherSpend: number;
  totalSalary: number;
  totalMarketingSpend: number;
  totalInvestment: number;
  addedBy: string | null;
  updatedBy: string | null;
}

const MarketingSpendSchema = new Schema<IMarketingSpend>(
  {
    month:        { type: String, required: true, unique: true },
    facebookAds:  { type: Number, default: 0 },
    googleAds:    { type: Number, default: 0 },
    instagramAds: { type: Number, default: 0 },
    otherSpend:   { type: Number, default: 0 },
    totalSalary:  { type: Number, default: 0 },
    totalMarketingSpend: { type: Number, default: 0 },
    totalInvestment:     { type: Number, default: 0 },
    addedBy:   { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.MarketingSpend ||
  mongoose.model<IMarketingSpend>('MarketingSpend', MarketingSpendSchema);