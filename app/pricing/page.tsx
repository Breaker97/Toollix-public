"use client";

import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2, Mail, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [pricing, setPricing] = useState({
    original: 15,
    current: 9,
    currency: "$"
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [couponStatus, setCouponStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then(res => res.json())
      .then(data => {
        if (data.proCurrentPrice !== undefined) {
          setPricing({
            original: data.proOriginalPrice,
            current: data.proCurrentPrice,
            currency: data.priceCurrency || "$"
          });
        }
      })
      .catch(err => console.error("Failed to fetch prices:", err))
      .finally(() => setLoadingPrice(false));
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setCouponStatus({ type: "error", message: "Please sign in to redeem coupons." });
      return;
    }
    setRedeeming(true);
    setCouponStatus(null);
    try {
      const res = await fetch("/api/redeem-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponStatus({ type: "success", message: data.message });
        setCouponCode("");
      } else {
        setCouponStatus({ type: "error", message: data.error });
      }
    } catch (e) {
      setCouponStatus({ type: "error", message: "Failed to redeem code." });
    } finally {
      setRedeeming(false);
    }
  };

  const PLANS = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for casual users and quick one-off tasks.",
      features: [
        "Access to all 20+ basic tools",
        "Standard processing speed",
        "Single file processing",
        "Community support",
        "Global CDN access"
      ],
      cta: "Current Plan",
      current: true,
      highlight: false
    },
    {
      name: "Pro",
      price: `${pricing.currency}${pricing.current}`,
      originalPrice: pricing.original > pricing.current ? `${pricing.currency}${pricing.original}` : null,
      period: "/month",
      description: "The ultimate toolkit for professionals and power users.",
      features: [
        "No Ads forever",
        "Ultra-fast priority processing",
        "Batch file processing (up to 50 files)",
        "High-resolution exports",
        "Priority email support",
        "Exclusive Pro-only tools",
        "Save settings across devices"
      ],
      cta: "Request Pro Upgrade",
      current: false,
      highlight: true,
      tag: "Most Popular"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7] relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-24 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" /> Pricing Plans
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-foreground">
            Professional tools for <br />
            <span>Power Users</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Choose the plan that fits your workflow. From quick edits to massive batch processing, we've got you covered.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-6 sm:p-8 rounded-[2rem] sm:rounded-[40px] border transition-all duration-500 hover:scale-[1.02] ${
                plan.highlight 
                  ? "bg-white dark:bg-zinc-900 border-[#CD9A32]/40 shadow-2xl shadow-yellow-900/10 ring-1 ring-yellow-400/20" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-[#CD9A32]/20"
              }`}
            >
              {plan.tag && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#CD9A32] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  {plan.tag}
                </div>
              )}

              <div className="mb-8 font-heading">
                <h3 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-[#CD9A32]' : ''}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black tracking-tight ${plan.highlight ? 'text-[#CD9A32]' : ''}`}>
                    {loadingPrice && plan.name === "Pro" ? "..." : plan.price}
                  </span>
                  {plan.originalPrice && plan.name === "Pro" && (
                    <span className="text-2xl text-muted-foreground/50 line-through font-bold decoration-red-500/30 decoration-2">
                       {plan.originalPrice}
                    </span>
                  )}
                  {plan.period && <span className="text-muted-foreground font-bold">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 group">
                    <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? 'text-[#CD9A32]' : 'text-muted-foreground'}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.name === "Free" && session?.user?.plan === "free" ? (
                <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-default opacity-50">
                  Current Plan
                </Button>
              ) : (
                <Link 
                  href={plan.name === "Pro" ? "mailto:support@toollix.io?subject=Pro Upgrade Request" : "/login"}
                  className={`w-full h-14 rounded-2xl font-black text-md shadow-xl transition-all active:scale-95 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center ${
                    plan.highlight 
                      ? "bg-[#CD9A32] text-white hover:opacity-90 shadow-yellow-900/20" 
                      : "bg-foreground text-background hover:bg-foreground/90 shadow-foreground/10"
                  }`}
                >
                  {plan.name === "Pro" ? <Mail className="w-5 h-5 mr-2" /> : null}
                  {plan.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}

              <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-6">
                {plan.highlight ? "Admin managed • Manual verification" : "Perfect to get started"}
              </p>
            </div>
          ))}
        </div>

        {/* Coupon Redemption Section */}
         <div className="max-w-md mx-auto mb-20 p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <Ticket className="w-5 h-5 text-primary" />
               </div>
              <h3 className="text-lg font-bold">Have a coupon code?</h3>
           </div>
           
           <form onSubmit={handleRedeem} className="space-y-4">
              <div className="relative">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code" 
                    className="w-full h-12 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 font-bold uppercase tracking-widest text-xs focus:ring-2 ring-primary outline-none transition-all shadow-inner"
                  />
                 <Button 
                   type="submit" 
                   disabled={redeeming || !couponCode}
                   variant="ghost" 
                   className="absolute right-1 top-1/2 -translate-y-1/2 h-10 px-4 rounded-lg font-bold text-xs uppercase text-primary hover:bg-primary/5"
                 >
                   {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                 </Button>
              </div>
               {couponStatus && (
                 <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${
                   couponStatus.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800"
                 }`}>
                  {couponStatus.message}
                </div>
              )}
           </form>
        </div>

        {/* FAQ / Trust Minimal Section */}
        <div className="text-center space-y-8">
           <div className="flex flex-wrap items-center justify-center gap-10 opacity-30 grayscale contrast-125 mb-10">
              <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]"><Zap className="w-5 h-5 text-[#CD9A32]" /> Ultra-Fast</div>
              <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]"><ShieldCheck className="w-5 h-5 text-[#CD9A32]" /> Secure SSL</div>
              <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em]"><Check className="w-5 h-5 text-[#CD9A32]" /> 99.9% Uptime</div>
           </div>
           
            <div className="max-w-xl mx-auto p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 shadow-sm">
               <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Questions about elite tools?</p>
               <p className="text-xs leading-relaxed font-medium">Reach out to our executive support team for custom enterprise configurations or bulk licensing inquiries.</p>
            </div>
        </div>

      </div>
    </div>
  );
}
