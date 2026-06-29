"use client";

import React from "react";
import { ShieldAlert, Check, HelpCircle } from "lucide-react";
import { FAQItem } from "@/components/faq-section";

interface ToolDocumentationProps {
  title: string;
  description: string;
  category: string;
  seoDescription?: string;
  faqs?: FAQItem[];
}

export function ToolDocumentation({
  title,
  description,
  category,
  seoDescription,
  faqs
}: ToolDocumentationProps) {
  // Extract how-to steps from FAQs if available
  const howToFAQ = faqs?.find((faq) => faq.isHowTo && faq.steps);
  const steps = howToFAQ?.steps || [
    `Input your source data or upload the files you want to process.`,
    `Adjust the options, custom constraints, or alignment settings.`,
    `Click the action button to process and download your high-quality output.`
  ];

  // Category-based features helper
  const getCategoryFeatures = (cat: string): string[] => {
    const lowercaseCat = cat.toLowerCase();
    if (lowercaseCat.includes("pdf")) {
      return [
        "100% browser-based PDF processing",
        "High-fidelity layout & formatting preservation",
        "Secure SSL transit encryption",
        "Zero permanent database storage of documents",
        "Optimized for standard desktop & mobile viewports",
        "Saves time with zero-installation workflow"
      ];
    }
    if (lowercaseCat.includes("image")) {
      return [
        "AI-accelerated or canvas-based rendering",
        "High-resolution canvas export logic",
        "Supports JPG, PNG, WebP, and SVG formats",
        "Ephemeral local memory caching (zero cloud logs)",
        "Responsive alignment controls for social layouts",
        "Lightweight download package with zero quality loss"
      ];
    }
    if (lowercaseCat.includes("developer") || lowercaseCat.includes("dev")) {
      return [
        "Real-time syntax parsing & validation",
        "Fully sandboxed client-side JavaScript engine",
        "Clean, legible output with syntax formatting",
        "Quick clipboard actions for copy and export",
        "Works offline once the page is fully loaded",
        "No network overhead or telemetry data tracking"
      ];
    }
    if (lowercaseCat.includes("marketing") || lowercaseCat.includes("color")) {
      return [
        "Accurate, industry-standard campaign parameters",
        "Instant color code conversion (HEX, RGB, HSL)",
        "WCAG-compliant accessibility standards",
        "1-click link generation and auto-copy functionality",
        "Compatible with major social networks & trackers",
        "Secure browser environment with zero user tracking"
      ];
    }
    return [
      "Fair and cryptographically secure randomization",
      "Dynamic real-time state visualization",
      "Adjustable quantity and custom ranges",
      "Instant history log and export controls",
      "Works on any modern browser or device",
      "100% free with unlimited generation runs"
    ];
  };

  const features = getCategoryFeatures(category);

  // Dynamic content block generation to meet the 300-500 words requirement
  const introText = seoDescription || `${description} Toollix provides an easy-to-use, secure, and fast solution to manage your files and developer resources directly in your browser. With no signup required, you can achieve professional results instantly while knowing your privacy is fully protected under our zero-storage policy.`;

  return (
    <div className="mt-20 space-y-16 text-slate-600 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800 pt-16 animate-in fade-in duration-700 font-sans">
      
      {/* 1. Header & Intro */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase italic font-sans">
          {title} — Free Online Web Tool
        </h2>
        <p className="leading-relaxed text-sm sm:text-base text-slate-500 dark:text-zinc-400">
          {introText} Our team built the <strong>{title}</strong> as part of the Toollix suite to empower developers, content creators, and remote workers with zero-cost utilities. We understand that installing software or creating premium accounts just to perform a single quick task is frustrating. Toollix bypasses those barriers entirely by putting industrial-grade scripts right at your fingertips.
        </p>
      </section>

      {/* 2. Grid columns: What is it & How to use */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            What Is the {title} Tool?
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
            The {title} on Toollix.io is a lightweight, responsive utility designed to run locally on your device. Unlike traditional server-centric platforms that upload your files or data to external cloud servers, this tool executes processes in your browser's memory using modern JavaScript and WebAssembly compiled modules. This architectural design ensures maximum speed, absolute privacy, and complete compatibility across all mobile and desktop devices.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            How to Use This Tool
          </h3>
          <ol className="space-y-3 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            {steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                  {idx + 1}
                </div>
                <span className="leading-normal">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Features Accordion Box */}
      <section className="suite-card p-8 sm:p-10 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-900">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">
          Key Features & Specifications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Target Audience */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Who Can Benefit From Using {title}?
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
          This utility is optimized for a wide array of professional and everyday tasks. Programmers utilize it to streamline software compilation; digital marketers leverage it to optimize tracking links and handle color schemes; and students find it invaluable for formatting coursework and rearranging PDFs. Because Toollix is 100% mobile-friendly, you can access it on-the-go during commute hours, client meetings, or while working from a remote cafe, all without installing bulky application packages.
        </p>
      </section>

      {/* 5. Privacy Advantage */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          The Privacy-First Advantage of Toollix.io
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
          Security is not an afterthought at Toollix. We enforce a strict ephemeral memory policy. When you use the {title}, all files and inputs are loaded strictly into your computer's RAM. They are never written to physical disk storage, cloned, or shared with third parties. The moment you download your output, close the tab, or click clear, the memory is purged permanently. This conforms to the highest standards of the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>
      </section>

      {/* 6. Cautionary Alert */}
      <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
        <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
              Security Notice & File Policy
            </h4>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-medium">
              Because your tasks run entirely in client-side memory, closing or refreshing this browser tab before downloading your completed files will result in data loss. Toollix does not back up or archive files to any remote servers. Please make sure to download all processed outputs before navigating away from this page.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
