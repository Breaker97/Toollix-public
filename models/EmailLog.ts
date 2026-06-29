import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailLog extends Document {
  subject: string;
  audience: string;
  emailType: "marketing" | "transactional";
  stats: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
  };
  htmlContent: string;
  sentBy: {
    name: string;
    email: string;
  };
  createdAt: Date;
}

const EmailLogSchema: Schema = new Schema(
  {
    subject: { type: String, required: true },
    audience: { type: String, required: true },
    emailType: { type: String, enum: ["marketing", "transactional"], required: true },
    stats: {
      total: { type: Number, default: 0 },
      success: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    htmlContent: { type: String, required: true },
    sentBy: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Ensure the model is only defined once
delete mongoose.models.EmailLog;
const EmailLog: Model<IEmailLog> = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
