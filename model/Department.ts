import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;           // e.g., SALES, MKT, HR
  description?: string;
  isActive: boolean;
  createdBy: string;      // Admin employeeId
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: String,
  },
  { timestamps: true }
);

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);