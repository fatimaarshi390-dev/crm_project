import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  eqId: string;
  eqName: string;
  contact: string;
  course?: string;
  department?: string;  
  division?: string;         // ← NEW FIELD
  city?: string;
  state?: string;
  address?: string;
  email?: string;
  enquiryId: string;
  demoDoneBy?: string;

  // Employee who worked on this lead
  empId?: string;
  empName?: string;

  // Priority Field
  priority: 'hot' | 'cold' | 'dead';

  // Organic Lead Fields
  software?: string;
  fee?: number;
  admissionStatus?: 'Admitted' | 'Not Admitted' | 'Pending';
  sourceReference?: string;
  source: 'organic' | 'marketing-upload' | 'referral' | 'walk-in';
  photoUrl?: string[];
 
  // Pre-Demo Fields
  preDemoExpectedDate?: Date;
  preDemoActualDate?: Date;
  preDemoDate?: Date;
  preDemoDateHistory?: Date[];
  isPreDemo: boolean;

  // Demo Day Fields
  demoDate?: Date;
  demoDoneDate?: Date;
  demoDateGivenAt?: Date;
  demoDateHistory?: Date[];

  // Post-Demo Fields
  postDemoDate?: Date;
  postDemoDateHistory?: Date[];
  isPostDemo: boolean;

  // Admission Fields
  admissionDate?: Date;

  // Other Fields
  salesDeck: string;
  salesDeckDate?: Date;
  reminder: string;
  reminderDate?: Date;
  remark?: string;
  interested?: 'Hot' | 'Cold'|'Dead';

  status: 'fresh' | 'approached' | 'pre-demo' | 'demo-day' | 'post-demo' | 'admission';

  uploadedBy?: string;
  uploadedAt: Date;
  approachedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    eqId: { type: String, required: true, unique: true, trim: true },
    enquiryId: { 
      type: String, 
      unique: true, 
      index: true 
    },
    eqName: { type: String, required: true, trim: true },
    contact: { type: String, required: true },
    course: String,
    department: String,   
    division: String,         // ← NEW FIELD ADDED
    city: String,
    state: String,
    address: String,
    email: String,
    demoDoneBy: { type: String },
    // Employee Fields
    empId: { type: String, index: true },
    empName: { type: String, index: true },

    // Priority Field
    priority: {
      type: String,
      enum: ['hot', 'cold', 'dead'],
      default: 'cold',
      index: true
    },

    // Organic Lead Fields
    software: String,
    fee: Number,
    admissionStatus: { 
      type: String, 
      enum: ['Admitted', 'Not Admitted', 'Pending'], 
      default: 'Pending' 
    },
    sourceReference: String,
    source: { 
      type: String, 
      enum: ['organic', 'marketing-upload', 'referral', 'walk-in'], 
      default: 'organic' 
    },
    photoUrl: { 
      type: [String], 
      default: [] 
    },

    // Pre-Demo Fields
    preDemoExpectedDate: Date,
    preDemoActualDate: Date,
    preDemoDate: Date,
    preDemoDateHistory: [Date],
    isPreDemo: { type: Boolean, default: false },

    // Demo Day Fields
    demoDate: Date,
    demoDoneDate: Date,
    demoDateGivenAt: Date,
    demoDateHistory: [Date],

    // Post-Demo Fields
    postDemoDate: Date,
    postDemoDateHistory: [Date],
    isPostDemo: { type: Boolean, default: false },

    // Admission Fields
    admissionDate: Date,

    salesDeck: { type: String, enum: ['Yes', 'No'], default: 'No' },
    salesDeckDate: Date,

    reminder: { type: String, enum: ['Yes', 'No'], default: 'No' },
    reminderDate: Date,

    remark: String,
    interested: { type: String, enum: ['Hot', 'Cold','Dead'] },

    status: { 
      type: String, 
      enum: ['fresh', 'approached', 'pre-demo', 'demo-day', 'post-demo', 'admission'],
      default: 'fresh' 
    },

    uploadedBy: String,
    uploadedAt: { type: Date, default: Date.now },
    approachedAt: Date,
  },
  { timestamps: true }
);

// Indexes
LeadSchema.index({ eqId: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ priority: 1 });
LeadSchema.index({ admissionStatus: 1 });
LeadSchema.index({ isPreDemo: 1 });
LeadSchema.index({ isPostDemo: 1 });
LeadSchema.index({ department: 1 });        // ← New Index for Department

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);