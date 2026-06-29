import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from './mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from './email-service';
import { getGlobalSettings } from '@/models/Settings';
import fs from 'fs';
import path from 'path';
import { getBaseUrl } from './utils';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      plan: string;
      role: string;
    } & DefaultSession['user'];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
        bot_field: { label: 'Bot Field', type: 'text' },
      },
      async authorize(credentials) {
        // Honey Pot rejection
        if (credentials?.bot_field) {
           console.warn("Bot detected on auth form");
           return null;
        }

        if (!credentials?.email || !credentials?.password) return null;

        try {
          if (!process.env.NEXTAUTH_SECRET) {
             console.error("[AUTH] CRITICAL: NEXTAUTH_SECRET is not defined in environment variables.");
          }
          
          await dbConnect();
          let user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            console.warn(`[AUTH] Login failed: User not found (${credentials.email})`);
            throw new Error("Account not found. Please sign up to continue.");
          }

          if (user.isVerified === false) {
            console.warn(`[AUTH] Login failed: User not verified (${credentials.email})`);
            throw new Error("Your account is not verified. Please check your email for the OTP.");
          }

          if (!user.password) {
            console.warn(`[AUTH] Login failed: Social account without password (${credentials.email})`);
            throw new Error("This account relies on Social Login. Please sign in with Google or reset your password.");
          } else {
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (!isValid) {
              console.warn(`[AUTH] Login failed: Invalid password (${credentials.email})`);
              throw new Error("Invalid credentials.");
            }
          }

          console.log(`[AUTH] Successful login for: ${credentials.email}`);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            plan: user.plan,
            role: user.role,
          };
        } catch (error: any) {
          console.error("[AUTH] System Error:", error.message);
          // Return the specific error message to the client
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
    CredentialsProvider({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { label: "Credential", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.credential) return null;

        const { OAuth2Client } = await import("google-auth-library");
        
        await dbConnect();
        const settings = await getGlobalSettings();
        const clientId = settings.googleClientId || process.env.GOOGLE_CLIENT_ID;

        if (!clientId) {
           console.error("[AUTH] Google One Tap failed: No Client ID found in settings or ENV.");
           return null;
        }

        const client = new OAuth2Client(clientId);

        try {
          const ticket = await client.verifyIdToken({
            idToken: credentials.credential,
            audience: clientId,
          });

          const payload = ticket.getPayload();
          if (!payload || !payload.email) return null;

          // Sync user logic (find or create)
          const isFirstUser = (await User.countDocuments()) === 0;
          let user = await User.findOne({ email: payload.email });

          if (!user) {
            user = await User.create({
              email: payload.email,
              name: payload.name || payload.email.split('@')[0],
              image: payload.picture,
              isVerified: true, // Google accounts are pre-verified
              plan: 'free',
              role: isFirstUser ? 'admin' : 'user',
            });
            await sendWelcomeEmail(user.email, user.name);
          } else {
            // Update image if changed
            if (payload.picture && user.image !== payload.picture) {
               user.image = payload.picture;
               await user.save();
            }
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            plan: user.plan,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] Google One Tap Verification Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;
        
        try {
          console.log("[AUTH] Initiating Google Sign-In sync for:", email);
          await dbConnect();
          
          const existingUser = await User.findOne({ email });
          const isNewUser = !existingUser;
          const isFirstUser = (await User.countDocuments()) === 0;
          
          const updatedUser = await User.findOneAndUpdate(
            { email },
            { 
              $setOnInsert: { 
                name: user.name || email.split('@')[0],
                plan: 'free',
                role: isFirstUser ? 'admin' : 'user',
              },
              $set: { 
                image: user.image 
              }
            },
            { upsert: true, new: true, runValidators: true }
          ) as any;

          if (isNewUser && updatedUser) {
             await sendWelcomeEmail(email, updatedUser.name);
          }

          if (updatedUser) {
            (user as any).id = updatedUser._id.toString();
            (user as any).plan = updatedUser.plan;
            (user as any).role = updatedUser.role;
            console.log("[AUTH] Sync successful for:", email, "Role:", updatedUser.role);
          }
          
          return true;
        } catch (error: any) {
          const logPath = path.join(process.cwd(), 'AUTHENTICATION_ERRORS.log');
          const logMessage = `[${new Date().toISOString()}] Google Sign-In Error for ${email}: ${error.message}\n${error.stack}\n\n`;
          fs.appendFileSync(logPath, logMessage);
          console.error("[AUTH] Google Sign-In Sync Error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign-in
      if (user && account) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email }) as any;
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.plan = dbUser.plan;
            token.role = dbUser.role;
            console.log("[AUTH] JWT initialized from DB for:", user.email);
          } else {
            // Fallback for unexpected cases
            token.id = user.id;
            token.plan = (user as any).plan || 'free';
            token.role = (user as any).role || 'user';
          }
        } catch (error) {
          console.error("[AUTH] JWT Sync Error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id);
          
          if (!dbUser) {
            // Force logout if user was deleted
            (session as any).user = null;
            return session;
          }

          // Handle plan expiration (Automatic Downgrade)
          let currentPlan = dbUser.plan;
          if (dbUser.plan === 'pro' && dbUser.planExpiresAt && new Date() > dbUser.planExpiresAt) {
             console.log(`[AUTH] Plan expired for ${dbUser.email}. Reverting to free.`);
             await User.findByIdAndUpdate(token.id, {
               plan: 'free',
               $unset: { planExpiresAt: "" }
             });
             currentPlan = 'free';
          }

          session.user.id = token.id as string;
          session.user.plan = currentPlan;
          session.user.role = dbUser.role;
        } catch (error) {
          console.error("[AUTH] Session Validation Error:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
