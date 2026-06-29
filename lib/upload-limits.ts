export interface LimitConfig {
  maxServerFileSize: number; // For tools hitting Vercel (4.5MB limit)
  maxCloudFileSize: number;  // For tools with Direct-to-Cloud bypass (100MB+)
  maxFiles: number;
  label: string;
}

export const GUEST_LIMITS: LimitConfig = {
  maxServerFileSize: 4.5 * 1024 * 1024, // 4.5MB (Vercel Limit)
  maxCloudFileSize: 10 * 1024 * 1024,  // 10MB
  maxFiles: 3,
  label: "Guest",
};

export const FREE_LIMITS: LimitConfig = {
  maxServerFileSize: 4.5 * 1024 * 1024,
  maxCloudFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  label: "Registered",
};

export const PRO_LIMITS: LimitConfig = {
  maxServerFileSize: 15 * 1024 * 1024,  // Pro can sometimes handle more if configured
  maxCloudFileSize: 500 * 1024 * 1024, // 500MB
  maxFiles: 50,
  label: "Pro",
};

export function getLimitsForSession(session: any): LimitConfig {
  if (!session || !session.user) return GUEST_LIMITS;
  const plan = session.user.plan?.toLowerCase();
  if (plan === "pro") return PRO_LIMITS;
  return FREE_LIMITS;
}

export function validateUpload(files: File[], session: any, isCloudTool: boolean = false) {
  const limits = getLimitsForSession(session);
  const maxAllowed = isCloudTool ? limits.maxCloudFileSize : limits.maxServerFileSize;
  
  // Check file count
  if (files.length > limits.maxFiles) {
    return {
      valid: false,
      message: `${limits.label} users can upload up to ${limits.maxFiles} files at once. Please ${limits.label === "Guest" ? "sign up" : "upgrade"} to increase your limit.`,
    };
  }

  // Check each file size
  for (const file of files) {
    if (file.size > maxAllowed) {
      const sizeInMb = Math.round(maxAllowed / (1024 * 1024));
      const message = isCloudTool 
        ? `File "${file.name}" exceeds the ${sizeInMb}MB cloud processing limit for ${limits.label} users.`
        : `File "${file.name}" exceeds the ${sizeInMb}MB server limit. Please sign up or upgrade to use our high-capacity Cloud Processing for files up to 100MB+.`;
      
      return {
        valid: false,
        message: message,
      };
    }
  }

  return { valid: true, message: "" };
}
