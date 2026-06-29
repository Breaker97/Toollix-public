"use client";

import { useState, useEffect } from "react";
import { Cookie, X, Shield, BarChart2, Megaphone } from "lucide-react";

export default function CookieConsentBanner({ termsUrl, privacyUrl }: { termsUrl: string; privacyUrl: string }) {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShow(true);
  }, []);

  const accept = (all: boolean) => {
    localStorage.setItem("cookie_consent", all ? "all" : "essential");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[9999] p-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-3xl mx-auto bg-background border border-border/70 rounded-3xl shadow-[0_-4px_60px_rgba(0,0,0,0.15)] overflow-hidden">

        {/* Gradient top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10">
                <Cookie className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-base">We use cookies</h3>
                <p className="text-xs text-muted-foreground">Your privacy choices matter to us</p>
              </div>
            </div>
            <button
              onClick={() => accept(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            We use cookies to improve your experience, display relevant ads, and analyze traffic.
            By accepting, you agree to our{" "}
            <a href={privacyUrl} className="text-primary hover:underline font-medium">Privacy Policy</a>
            {" "}and{" "}
            <a href={termsUrl} className="text-primary hover:underline font-medium">Terms of Service</a>.
          </p>

          {/* Expandable preferences */}
          {expanded && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-4 rounded-2xl bg-muted border border-border/40">
              {[
                { icon: Shield, label: "Essential", desc: "Required for the site to function.", color: "text-emerald-500 bg-emerald-500/10", locked: true },
                { icon: BarChart2, label: "Analytics", desc: "Help us understand how tools are used.", color: "text-blue-500 bg-blue-500/10", locked: false },
                { icon: Megaphone, label: "Advertising", desc: "Personalized ad experiences.", color: "text-violet-500 bg-violet-500/10", locked: false },
              ].map(({ icon: Icon, label, desc, color, locked }) => (
                <div key={label} className="flex flex-col gap-1.5 p-3 rounded-xl bg-background border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${locked ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {locked ? "Always on" : "Optional"}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-1">{label}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => accept(true)}
              className="w-full sm:w-auto order-1 sm:order-3 px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Accept All
            </button>
            <button
              onClick={() => accept(false)}
              className="w-full sm:w-auto order-2 px-6 py-2.5 rounded-xl border border-border bg-transparent text-sm font-semibold hover:bg-muted transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full sm:w-auto order-3 sm:order-1 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {expanded ? "Hide preferences" : "Customize"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
