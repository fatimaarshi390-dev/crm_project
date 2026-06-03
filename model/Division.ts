import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDivision extends Document {
  divisionName: string;
  departmentName: string;
  isActive: boolean;
}

const DivisionSchema = new Schema<IDivision>(
  {
    divisionName: { type: String, required: true, trim: true },
    departmentName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


const Division: Model<IDivision> =
  mongoose.models.Division || mongoose.model<IDivision>('Division', DivisionSchema);

export default Division;