"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, LockKeyhole, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
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

  if (!token || !email) {
    return (
        <div className="text-center p-6 sm:p-8 border rounded-3xl bg-red-500/5 border-red-500/20 max-w-md w-full">
           <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-lg sm:text-xl font-black text-red-600 mb-2">Invalid Reset Link</h2>
           <p className="text-xs sm:text-sm text-red-500/80 mb-6">This password reset link is invalid or missing required parameters. Please request a new one.</p>
           <Link href="/forgot-password">
              <Button variant="outline" className="font-bold rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/10 h-10 sm:h-11">Request New Link</Button>
           </Link>
        </div>
    );
  }

  if (success) {
    return (
        <div className="text-center p-6 sm:p-8 rounded-3xl bg-card border shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
           <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
             <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
           </div>
           <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Password Reset!</h2>
           <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-8 px-4">Your account password has been officially changed and strongly encrypted.</p>
           <Link href="/login" className="block">
              <Button className="w-full h-11 sm:h-12 rounded-xl text-base font-black gap-2 hover:-translate-y-0.5 transition-transform bg-gold-metallic text-black hover:bg-gold-metallic/90 shadow-lg">
                 Proceed to Login <ArrowRight className="w-4 h-4" />
              </Button>
           </Link>
        </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-metallic to-gold-metallic/50"></div>
      
      <div className="mb-6 sm:mb-8 text-center mt-2 px-4">
        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gold-metallic/10 text-gold-metallic rounded-xl flex items-center justify-center mb-4">
          <LockKeyhole className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2 leading-tight">Create New Password</h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Please enter a highly secure password for <strong className="text-foreground">{email}</strong>.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-bold flex items-center gap-3">
           <ShieldAlert className="w-5 h-5 shrink-0" />
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">New Password</label>
          <Input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="h-12 rounded-xl text-base tracking-widest font-mono"
            required
            minLength={6}
          />
        </div>

         <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Confirm New Password</label>
          <Input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="h-12 rounded-xl text-base tracking-widest font-mono"
            required
            minLength={6}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !password || !confirmPassword}
          className="w-full h-12 rounded-xl text-base font-black shadow-lg hover:-translate-y-0.5 transition-all mt-4 bg-gold-metallic text-black hover:bg-gold-metallic/90"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure & Save Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
       <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />}>
         <ResetPasswordForm />
       </Suspense>
    </div>
  );
}
