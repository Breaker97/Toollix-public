import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILog extends Document {
  adminName: string;
  adminEmail: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const LogSchema: Schema = new Schema(
  {
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

delete mongoose.models.Log;
const Log: Model<ILog> = mongoose.model<ILog>("Log", LogSchema);

export default Log;
