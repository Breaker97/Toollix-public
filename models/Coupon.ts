import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  maxRedemptions?: number;
  timesUsed: number;
  active: boolean;
  expiryDate?: Date;
  redemptions: {
    userId: string;
    email: string;
    usedAt: Date;
  }[];
  createdAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxRedemptions: { type: Number, default: 0 }, // 0 = unlimited
    timesUsed: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiryDate: { type: Date },
    redemptions: [
      {
        userId: { type: String, required: true },
        email: { type: String, required: true },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

delete mongoose.models.Coupon;
const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
