import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Heart, 
  Users, 
  Code2, 
  EyeOff, 
  ArrowRight,
  HelpCircle,
  FileCheck
} from "lucide-react";

export const metadata = {
  title: "About Us | Toollix.io",
  description: "Learn about Toollix, our mission to provide secure, fast, and 100% private online tools for creators, developers, and power users worldwide.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24 sm:pt-32 selection:bg-[#c5a059]/20 selection:text-[#c5a059]">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 mb-20 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c5a059]/10 rounded-2xl text-[#c5a059] font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Empowering your digital workflow, <span className="text-[#c5a059] italic font-serif">privately</span>.
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Toollix is a premium, all-in-one suite of online utilities built for creators, developers, and professionals. 
            We believe that basic file processing and daily developer helpers should be fast, elegant, and above all, secure.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-100/50 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Privacy by Default</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              We process your files entirely in ephemeral, short-lived memory. Your files are never written to disk, stored, or indexed. 
              Once your session is closed or your file is downloaded, it is permanently purged.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-100/50 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#c5a059] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ultra-Fast Performance</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Built on a modern serverless stack, Toollix operations execute in milliseconds. 
              We leverage Client-Side WebAssembly (WASM) and high-performance serverless endpoints to ensure no waiting.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl shadow-slate-100/50 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">100% Free, No Watermarks</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              We don't believe in locking basic utility behind paywalls or adding ugly watermarks to your documents. 
              Toollix remains completely free for daily limits, supported by clean, non-intrusive advertising.
            </p>
          </div>
        </section>

        {/* Detailed Story / Quality Assurance */}
        <section className="bg-white border border-slate-200 rounded-[3rem] p-8 sm:p-16 shadow-2xl shadow-slate-200/50 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-[10px] font-black uppercase tracking-widest">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Crafted with Care
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Why We Built Toollix
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
                We got tired of websites loaded with tracking cookies, popup advertisements, and forced subscription dialogs just to convert an image or sign a PDF. 
                We wanted a workspace that felt premium and respected the user.
              </p>
              <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">
                Toollix was created to bridge the gap between powerful utility and stunning design. 
                Our interfaces are designed to be smooth and responsive, utilizing subtle typography and modern layout practices to make daily tasks a pleasure.
              </p>
              <div className="pt-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">100k+ Active Users</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">80+ Professional Utilities</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">How We Maintain Quality</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <FileCheck className="w-4 h-4 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Rigorous Testing</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Each tool is optimized across desktop, tablet, and mobile devices to ensure a seamless responsive flow.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <EyeOff className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Security Audited</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Our libraries and dependencies are continuously scanned to safeguard against data leaks or server vulnerabilities.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Community Driven</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Our roadmap is entirely built on requests from our support portal. If you need a tool, we build it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary/5 border border-primary/10 rounded-[3rem] p-12 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">Ready to boost your productivity?</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-sm sm:text-base">
            Explore our massive suite of PDF, Image, and Developer utilities. No registration or installation is required to start.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/">
              <Button size="lg" className="h-16 px-12 rounded-[1.5rem] font-bold shadow-xl shadow-primary/20 bg-[#c5a059] text-white hover:bg-[#b08d4a] flex items-center gap-2">
                Browse All Tools <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-16 px-12 rounded-[1.5rem] font-bold border-slate-200 bg-white hover:bg-slate-50">
                Contact Support
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
