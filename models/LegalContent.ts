import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILegalSection {
  id: string;
  title: string;
  content: string;
}

export interface ILegalContent extends Document {
  slug: string; // 'privacy-policy', 'terms-of-service', 'cookie-policy'
  title: string;
  showInFooter: boolean;
  lastUpdated: Date;
  sections: ILegalSection[];
  createdAt: Date;
  updatedAt: Date;
}

const LegalSectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
});

const LegalContentSchema: Schema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    showInFooter: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    sections: { type: [LegalSectionSchema], default: [] }
  },
  { timestamps: true }
);

delete mongoose.models.LegalContent;
const LegalContent: Model<ILegalContent> = mongoose.model<ILegalContent>("LegalContent", LegalContentSchema);

export default LegalContent;
