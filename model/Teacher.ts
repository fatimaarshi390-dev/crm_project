import mongoose, { Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  department: string;
  specialization: string;
  isActive: boolean;
  createdBy: string;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    specialization: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: String,
  },
  { timestamps: true }
);

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);