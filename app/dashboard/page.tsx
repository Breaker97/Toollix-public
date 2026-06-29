"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronRight,
  BellRing,
  CheckCircle2,
  Edit2,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [passwordStatus, setPasswordStatus] = useState<{ hasPassword: boolean; isSocialOnly: boolean; planExpiresAt?: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [updatingSub, setUpdatingSub] = useState(false);

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/status")
        .then(res => res.json())
        .then(data => setPasswordStatus(data))
        .catch(err => console.error("Failed to fetch password status:", err));

      fetch("/api/user/subscription")
        .then(res => res.json())
        .then(data => setIsSubscribed(data.subscribed))
        .catch(err => console.error("Failed to fetch subscription status:", err));
    }
  }, [status]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }
    setSettingPassword(true);
    setPassError("");
    setPassSuccess("");
    try {
      const res = await fetch("/api/user/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassSuccess(data.message);
        setPasswordStatus({ hasPassword: true, isSocialOnly: false });
        setNewPassword("");
      } else {
        setPassError(data.error);
      }
    } catch (err) {
      setPassError("Failed to set password. Try again.");
    } finally {
      setSettingPassword(false);
    }
  };
  
  const handleToggleSubscription = async () => {
    if (isSubscribed === null || updatingSub) return;
    
    const newValue = !isSubscribed;
    setIsSubscribed(newValue); // Optimistic update
    setUpdatingSub(true);
    
    try {
      const res = await fetch("/api/user/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: newValue }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setIsSubscribed(!newValue); // Rollback
      alert("Failed to update preferences. Please try again.");
    } finally {
      setUpdatingSub(false);
    }
  };

  const handleUpdateName = async () => {
    if (!tempName.trim() || tempName.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }

    setUpdatingName(true);
    setNameError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tempName }),
      });
      const data = await res.json();
      if (res.ok) {
        await update({ name: tempName }); // Update local session
        setIsEditingName(false);
        router.refresh();
      } else {
        setNameError(data.error);
      }
    } catch (err) {
      setNameError("Connection error.");
    } finally {
      setUpdatingName(false);
    }
  };

  const startEditing = () => {
    setTempName(user?.name || "");
    setIsEditingName(true);
    setNameError("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const user = session?.user;
  const isPro = user?.plan === "pro";

  return (
    <div className="min-h-screen bg-[#fcfaf7] relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#CD9A32]/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <div className="flex items-center gap-2 text-[#CD9A32] font-bold text-[10px] sm:text-xs mb-4 uppercase tracking-[0.2em]">
            <Link href="/" className="hover:opacity-70">toollix.io</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-muted-foreground/60">User Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CD9A32] to-[#B8860B] drop-shadow-sm">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-muted-foreground text-xs sm:text-lg max-w-xl font-medium leading-relaxed">
            Manage your profile, subscription, and account security in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                <UserIcon className="w-32 h-32" />
              </div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/5 rounded-full" />
                  <Avatar className="h-20 w-20 sm:h-32 sm:w-32 border-4 border-white dark:border-zinc-800 shadow-xl">
                    <AvatarFallback className="text-2xl sm:text-4xl font-black bg-zinc-100 dark:bg-zinc-800 text-primary">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isPro && (
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg border-2 sm:border-4 border-background">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="space-y-3">
                    {isEditingName ? (
                      <div className="space-y-2 max-w-sm mx-auto md:mx-0">
                         <div className="flex items-center gap-2">
                           <Input 
                             value={tempName}
                             onChange={(e) => setTempName(e.target.value)}
                             className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                             autoFocus
                           />
                           <Button 
                             size="icon" 
                             onClick={handleUpdateName} 
                             disabled={updatingName}
                             className="h-10 w-10 shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                           >
                             {updatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                           </Button>
                           <button 
                             onClick={() => setIsEditingName(false)}
                             className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:text-red-500 transition-colors"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         </div>
                         {nameError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{nameError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center md:justify-start gap-3 group/name">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name}</h2>
                        <button 
                          onClick={startEditing}
                          className="p-2 opacity-0 group-hover/name:opacity-100 transition-opacity text-zinc-400 hover:text-primary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 font-medium">
                      <Mail className="w-4 h-4 text-primary/50" /> {user?.email}
                    </p>
                    
                    {/* Integrated Subscription Toggle */}
                    <div className="mt-6 flex items-center justify-center md:justify-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-fit mx-auto md:mx-0 shadow-sm transition-all hover:border-primary/20">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#CD9A32]">Email Updates</span>
                          <span className="text-[10px] text-muted-foreground font-bold">Subscribe to newsletter</span>
                       </div>
                       <button 
                         onClick={handleToggleSubscription}
                         disabled={isSubscribed === null || updatingSub}
                         className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none ${
                           isSubscribed ? 'bg-[#CD9A32]' : 'bg-zinc-200 dark:bg-zinc-700'
                         }`}
                       >
                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-500 ${
                           isSubscribed ? 'translate-x-6' : 'translate-x-1'
                         }`} />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Role</p>
                      <p className="font-bold capitalize flex items-center gap-2">
                        {user?.role === 'admin' ? (
                          <><ShieldCheck className="w-4 h-4 text-primary" /> Administrator</>
                        ) : (
                          <><UserIcon className="w-4 h-4 text-muted-foreground" /> Member</>
                        )}
                      </p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Joined</p>
                      <p className="font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        April 2024
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link to Tools */}
            <Link href="/#tools" className="block group">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex items-center justify-between transition-all hover:border-[#CD9A32]/30 shadow-md hover:shadow-2xl">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform border border-zinc-100 dark:border-zinc-700">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#CD9A32]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg sm:text-xl truncate">Ready back to work?</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">Access 40+ professional tools instantly.</p>
                  </div>
                </div>
                <div className="hidden sm:flex bg-[#CD9A32] p-3 rounded-full text-white group-hover:translate-x-2 transition-transform shadow-lg shadow-[#CD9A32]/20">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </Link>

            {/* Set Password Card for Social Users */}
            {passwordStatus?.isSocialOnly && (
              <div className="bg-white dark:bg-zinc-900 border-2 border-[#CD9A32]/20 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center relative z-10">
                  <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CD9A32]/10 text-[#CD9A32] text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Security Upgrade
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">Set a Login Password</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      You're currently using Google login. Set a password to unlock Email/Password access.
                    </p>
                  </div>
                  
                  <div className="w-full md:w-80">
                    <form onSubmit={handleSetPassword} className="space-y-4">
                      {passError && <p className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg text-center uppercase tracking-tighter border border-red-100 dark:border-red-900">{passError}</p>}
                      {passSuccess && <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg text-center uppercase tracking-tighter border border-emerald-100 dark:border-emerald-900">{passSuccess}</p>}
                      <div className="relative">
                        <Input 
                          type="password" 
                          placeholder="Create secure password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 sm:h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 ring-[#CD9A32]/40 text-sm shadow-inner" 
                          required
                        />
                        <Button 
                          type="submit" 
                          disabled={settingPassword || !newPassword}
                          className="w-full h-11 sm:h-12 mt-3 rounded-xl bg-[#CD9A32] text-white font-black hover:opacity-90 transition-all shadow-lg shadow-[#CD9A32]/10 text-sm"
                        >
                          {settingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure My Account"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Membership Card */}
          <div className="space-y-6 sm:space-y-10">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col h-full relative overflow-hidden">
               {isPro && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
               )}
               
               <div className="flex items-center gap-3 mb-6 sm:mb-8">
                 <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${isPro ? 'bg-zinc-100 dark:bg-zinc-800 text-[#CD9A32]' : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shadow-inner'}`}>
                    <CreditCard className="w-5 h-5 sm:w-6 h-6" />
                 </div>
                 <h2 className="text-lg sm:text-xl font-black">Plan Status</h2>
               </div>
 
               <div className="flex-1 space-y-8">
                  <div className="text-center p-6 sm:p-10 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-50 dark:border-zinc-800 group/plan relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-[#CD9A32]/20" />
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-4 ${
                      isPro ? 'bg-[#CD9A32]/10 text-[#CD9A32] animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {user?.plan} Membership
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black">
                      {isPro ? "Toollix Pro" : "Free Tier"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-2">
                      {isPro 
                        ? "You have full access to all features." 
                        : "Upgrade to unlock professional features."
                      }
                    </p>
                 </div>
 
                 {isPro ? (
                   <div className="space-y-4">
                     <div className="flex items-center justify-between text-xs sm:text-sm">
                       <span className="text-muted-foreground">Next Billing</span>
                       <span className="font-bold">
                         {passwordStatus?.planExpiresAt ? (
                           new Date(passwordStatus.planExpiresAt).toLocaleDateString("en-US", {
                             year: "numeric",
                             month: "long",
                             day: "numeric"
                           })
                         ) : (
                           "Lifetime / Active"
                         )}
                       </span>
                     </div>
                     <div className="flex items-center justify-between text-xs sm:text-sm">
                       <span className="text-muted-foreground">Amount</span>
                       <span className="font-bold">$9.00/mo</span>
                     </div>
                      <Button className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl font-black mt-4 bg-[#CD9A32] text-white hover:opacity-90 shadow-lg shadow-[#CD9A32]/20 text-xs sm:text-sm">
                        Manage Billing
                      </Button>
                   </div>
                 ) : (
                   <Link href="/pricing" className="block w-full">
                     <Button className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black text-sm sm:text-md shadow-xl shadow-primary/20 group">
                       Upgrade to Pro
                       <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-125 transition-transform" />
                     </Button>
                   </Link>
                 )}
               </div>
 
               <div className="mt-8 pt-6 sm:pt-8 border-t border-border/50">
                  <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
                    Personal account securely managed by Toollix
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
