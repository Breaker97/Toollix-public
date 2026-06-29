"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, KeyRound, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-metallic to-gold-metallic/50"></div>

        <Link href="/login" className="inline-flex items-center text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
           <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
        </Link>

        {success ? (
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
             <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
             </div>
             <h2 className="text-xl sm:text-2xl font-black tracking-tight">Recovery Email Sent!</h2>
             <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed px-4">
               If an account with that email exists, we have sent a secure password reset link. Please check your inbox (and spam folder) to continue.
             </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center px-4">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gold-metallic/10 text-gold-metallic rounded-xl flex items-center justify-center mb-4 transform -rotate-12 hover:rotate-0 transition-transform">
                <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Account Recovery</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Enter your email and we'll send you a secure link to reset your password.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold flex items-center gap-3">
                 <ShieldAlert className="w-5 h-5 shrink-0" />
                 {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 rounded-xl text-base"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || !email}
                className="w-full h-12 rounded-xl text-base font-black shadow-lg hover:-translate-y-0.5 transition-all bg-gold-metallic text-black hover:bg-gold-metallic/90"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Password Reset Link"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
