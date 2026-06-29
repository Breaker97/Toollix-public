import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IToolUsage extends Document {
  userId: string; // Could be a session ID or actual user ID
  toolName: string;
  createdAt: Date;
}

const ToolUsageSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    toolName: { type: String, required: true },
  },
  { timestamps: true }
);

const ToolUsage: Model<IToolUsage> = mongoose.models.ToolUsage || mongoose.model<IToolUsage>('ToolUsage', ToolUsageSchema);

export default ToolUsage;
