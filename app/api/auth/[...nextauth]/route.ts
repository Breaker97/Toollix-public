import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";

async function handler(req: any, res: any) {
  console.log("[AUTH-ROUTE] Connecting to DB and fetching dynamic settings...");
  await dbConnect();
  const settings = await getGlobalSettings();
  
  const clientId = (settings.googleClientId || process.env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (settings.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "").trim();

  console.log("[AUTH-ROUTE] Initializing NextAuth with Client ID:", clientId.substring(0, 10) + "...");

  return await NextAuth({
    ...authOptions,
    providers: [
      ...authOptions.providers,
      GoogleProvider({
        clientId: clientId,
        clientSecret: clientSecret,
      }),
    ],
  })(req, res);
}

export { handler as GET, handler as POST };
