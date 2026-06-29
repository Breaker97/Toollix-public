"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  Monitor, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
  isHowTo?: boolean;
  steps?: string[];
}

interface FAQSectionProps {
  toolName: string;
  faqs: FAQItem[];
}

export function FAQSection({ toolName, faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  // Generate HowTo Schema
  const howToFAQ = faqs.find(faq => faq.isHowTo && faq.steps);
  const howToSchema = howToFAQ ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howToFAQ.question,
    "step": howToFAQ.steps?.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": step
    }))
  } : null;

  // Generate FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="mt-20 md:mt-28 mb-12">
      {/* Schema Injection */}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Resources & Support</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Commonly Asked <span className="text-primary">Questions.</span>
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-xl">
            Everything you need to know about using our {toolName} tool efficiently and securely.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FAQ Accordion */}
        <div className="lg:col-span-8 space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={cn(
                "group border rounded-2xl transition-all duration-300",
                openIndex === index 
                  ? "bg-white dark:bg-zinc-900/50 border-primary/30 shadow-xl shadow-primary/5" 
                  : "bg-zinc-50/50 dark:bg-white/5 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "font-mono text-[10px] font-bold shrink-0 transition-colors",
                    openIndex === index ? "text-primary" : "text-slate-400"
                  )}>
                    0{index + 1}
                  </span>
                  <h3 className={cn(
                    "font-bold text-sm md:text-base tracking-tight transition-colors",
                    openIndex === index ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-zinc-400"
                  )}>
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-300 shrink-0",
                  openIndex === index ? "rotate-180 text-primary" : "text-slate-400"
                )} />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="pl-9 text-sm md:text-[15px] text-slate-500 dark:text-zinc-400 leading-relaxed space-y-4">
                    <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    
                    {faq.isHowTo && faq.steps && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {faq.steps.map((step, sIdx) => (
                          <div key={sIdx} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group/step">
                             <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full flex items-center justify-end pr-3 pt-2">
                                <span className="font-mono text-[10px] font-bold text-primary opacity-40">{sIdx + 1}</span>
                             </div>
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Step {sIdx + 1}</p>
                             <p className="text-[13px] text-slate-700 dark:text-zinc-300 font-medium leading-snug">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="suite-card p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black text-white relative overflow-hidden border-none shadow-2xl">
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Secure Infrastructure</h4>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Industrial Grade</p>
                </div>
              </div>
              
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Toollix uses enterprise-level encryption. Your files never touch our permanent storage, ensuring your private data stays private.
              </p>

              <div className="pt-4 space-y-3">
                {[
                  { icon: Zap, text: "Client-Side Processing", sub: "Maximum Privacy" },
                  { icon: Monitor, text: "Desktop Optimized", sub: "Production Ready" },
                  { icon: Smartphone, text: "Mobile Friendly", sub: "Responsive Web" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <item.icon className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">{item.text}</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest italic">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Uptime Guaranteed</h4>
            <p className="text-[11px] text-slate-400 font-medium">Our tools are globally distributed for 99.9% availability.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
