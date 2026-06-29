import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDesign extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  pages: any[];
  width: number;
  height: number;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DesignSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Design" },
    pages: { type: Schema.Types.Mixed, default: [] },
    width: { type: Number, default: 1080 },
    height: { type: Number, default: 1080 },
    thumbnail: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add index for faster queries by user
DesignSchema.index({ userId: 1, updatedAt: -1 });

delete mongoose.models.Design;
const Design: Model<IDesign> = mongoose.model<IDesign>("Design", DesignSchema);

export default Design;
