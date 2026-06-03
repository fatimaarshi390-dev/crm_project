import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  duration: string;           // e.g., "6 Months", "1 Year"
  department: string;
  division:string;
  syllabus: string;
  faculty: string;
  isActive: boolean;
  createdBy: string;
  fee:string;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    department: { type: String, required: true },
    division: { type: String, required: true },
    syllabus: { type: String, required: true },
    faculty: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    fee:{type:String,required:true},
    createdBy: String,
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);