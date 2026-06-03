import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  roleName: string;
  isActive: boolean;
}

const RoleSchema = new Schema<IRole>(
  {
    roleName: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);