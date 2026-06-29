import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdUnit {
  name: string;
  placement: string;
  code: string;
  active: boolean;
}

export interface ISettings extends Document {
  guestDailyLimit: number;
  guestHourlyLimit: number;
  freeDailyLimit: number;
  freeHourlyLimit: number;
  proHourlyLimit: number;
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string;
  googleAnalyticsId: string;
  googleAdsenseId: string;
  robotsContent: string;
  showAds: boolean;
  ads: IAdUnit[];
  maintenanceMode: boolean;
  bingWebmasterId: string;
  googleSearchConsoleId: string;
  cookieConsentEnabled: boolean;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  adsContent: string;
  autoAdsEnabled: boolean;
  dropboxAppKey: string;
  googleDriveClientId: string;
  mailchimpApiKey: string;
  brevoApiKey: string;
  newsletterListId: string;
  gcsBucketName: string;
  gcsProjectId: string;
  gcsClientEmail: string;
  gcsPrivateKey: string;
  gcsEnabled: boolean;
  hideAdsForPro: boolean;
  googleClientId: string;
  googleClientSecret: string;
  proOriginalPrice: number;
  proCurrentPrice: number;
  priceCurrency: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  siteLogo?: string;
  logoWidth: number;
  siteFavicon?: string;
  baseUrl?: string;
  replicateApiKey?: string;
  hfAccessToken?: string;
  adobeClientId?: string;
  adobeClientSecret?: string;
  adobeOrganizationId?: string;
  adobeTechnicalAccountId?: string;
  adobeTechnicalAccountEmail?: string;
  headCode?: string;
  bodyStartCode?: string;
  bodyEndCode?: string;
}

const AdUnitSchema = new Schema({
  name: { type: String, required: true },
  placement: { type: String, required: true }, // e.g., 'sidebar', 'banner'
  code: { type: String, required: true },
  active: { type: Boolean, default: true }
});

const SettingsSchema: Schema = new Schema(
  {
    guestDailyLimit: { type: Number, default: 3 },
    guestHourlyLimit: { type: Number, default: 1 },
    freeDailyLimit: { type: Number, default: 10 },
    freeHourlyLimit: { type: Number, default: 2 },
    proHourlyLimit: { type: Number, default: 20 },
    siteTitle: { type: String, default: "toollix.io - All in one free online tools" },
    siteDescription: { type: String, default: "Merge PDF, Compress Images, Generate QR codes and more with Toollix.io." },
    seoKeywords: { type: String, default: "tools, pdf, image converter, online utilities" },
    googleAnalyticsId: { type: String, default: "" },
    googleAdsenseId: { type: String, default: "ca-pub-7760787039539760" },
    robotsContent: { type: String, default: "User-agent: *\nAllow: /" },
    adsContent: { type: String, default: "google.com, pub-7760787039539760, DIRECT, f08c47fec0942fa0" },
    autoAdsEnabled: { type: Boolean, default: false },
    hideAdsForPro: { type: Boolean, default: true },
    showAds: { type: Boolean, default: false },
    ads: { type: [AdUnitSchema], default: [] },
    maintenanceMode: { type: Boolean, default: false },
    bingWebmasterId: { type: String, default: "" },
    googleSearchConsoleId: { type: String, default: "" },
    cookieConsentEnabled: { type: Boolean, default: false },
    privacyPolicyUrl: { type: String, default: "/legal/privacy-policy" },
    termsOfServiceUrl: { type: String, default: "/legal/terms-of-service" },
    dropboxAppKey: { type: String, default: "" },
    googleDriveClientId: { type: String, default: "" },
    mailchimpApiKey: { type: String, default: "" },
    brevoApiKey: { type: String, default: "" },
    newsletterListId: { type: String, default: "" },
    gcsBucketName: { type: String, default: "" },
    gcsProjectId: { type: String, default: "" },
    gcsClientEmail: { type: String, default: "" },
    gcsPrivateKey: { type: String, default: "" },
    gcsEnabled: { type: Boolean, default: false },
    googleClientId: { type: String, default: "" },
    googleClientSecret: { type: String, default: "" },
    proOriginalPrice: { type: Number, default: 15 },
    proCurrentPrice: { type: Number, default: 9 },
    priceCurrency: { type: String, default: "$" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    smtpFrom: { type: String, default: "\"Toollix\" <support@toollix.io>" },
    siteLogo: { type: String, default: "" },
    logoWidth: { type: Number, default: 120 },
    siteFavicon: { type: String, default: "" },
    baseUrl: { type: String, default: "" },
    replicateApiKey: { type: String, default: "" },
    hfAccessToken: { type: String, default: "" },
    adobeClientId: { type: String, default: "" },
    adobeClientSecret: { type: String, default: "" },
    adobeOrganizationId: { type: String, default: "" },
    adobeTechnicalAccountId: { type: String, default: "" },
    adobeTechnicalAccountEmail: { type: String, default: "" },
    headCode: { type: String, default: "" },
    bodyStartCode: { type: String, default: "" },
    bodyEndCode: { type: String, default: "" },
  },
  { timestamps: true }
);

delete mongoose.models.Settings;
const Settings: Model<ISettings> = mongoose.model<ISettings>("Settings", SettingsSchema);

// Helper function to safely get config singleton
export async function getGlobalSettings() {
  let config = await Settings.findOne();
  if (!config) {
    config = await Settings.create({});
  }
  return config;
}

export default Settings;
