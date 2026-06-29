import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  relatedTools: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    published: { type: Boolean, default: false },
    relatedTools: { type: [String], default: [] },
  },
  { timestamps: true }
);

delete mongoose.models.Article;
const Article: Model<IArticle> = mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
