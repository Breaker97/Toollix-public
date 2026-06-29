import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  source: string; // e.g. "footer", "popup"
  status: "active" | "unsubscribed";
  ip?: string;
  createdAt: Date;
}

const NewsletterSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    status: { type: String, enum: ["active", "unsubscribed"], default: "active" },
    unsubscribeToken: { type: String, unique: true, sparse: true, index: true },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Newsletter || mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
