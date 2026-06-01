import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  employeeId: string;

  role: string;
  department?: string;
  division?:string;
  avatar?: string;
  isActive: boolean;

  // CRM Specific
  target?: number;
  joiningDate: Date;
  lastLogin?: Date;

  // ==================== Salary Field ====================
  salary?: number;                    // ← Monthly Salary
  salaryUpdatedAt?: Date;

  // Security
  permissions: string[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;

  // Passkey / WebAuthn
  credentials: Array<{
    credentialID: string;
    publicKey: string;
    counter: number;
    deviceName?: string;
    registeredAt: Date;
  }>;

  passkeyEnabled: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    phone: { type: String, trim: true },
    password: { 
      type: String, 
      required: true, 
      minlength: 6, 
      select: false 
    },
    employeeId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    role: { 
      type: String, 
      required:true,
      trim:true,
    },
    department: String,
    division:String,
    avatar: String,
    isActive: { type: Boolean, default: true },

    target: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    lastLogin: Date,

    // ==================== New Salary Fields ====================
    salary: { 
      type: Number, 
      default: 0 
    },
    salaryUpdatedAt: { 
      type: Date 
    },

    permissions: { type: [String], default: [] },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    credentials: [{
      credentialID: { type: String, required: true },
      publicKey: { type: String, required: true },
      counter: { type: Number, default: 0 },
      deviceName: String,
      registeredAt: { type: Date, default: Date.now },
    }],

    passkeyEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);