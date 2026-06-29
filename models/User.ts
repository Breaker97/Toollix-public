import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  plan: 'free' | 'pro';
  role: 'user' | 'admin';
  isRestricted: boolean;
  dailyLimitOverride: number;
  planExpiresAt?: Date;
  marketingSubscription: boolean;
  unsubscribeToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    image: { type: String },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isRestricted: { type: Boolean, default: false },
    dailyLimitOverride: { type: Number, default: -1 }, // -1 means no override
    planExpiresAt: { type: Date },
    marketingSubscription: { type: Boolean, default: true },
    unsubscribeToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isVerified: { type: Boolean, default: true },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date },
  },
  { timestamps: true }
);

delete mongoose.models.User;
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
