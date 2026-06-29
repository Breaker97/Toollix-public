import { notFound } from "next/navigation";
import { LEGAL_CONTENT } from "@/lib/legal/data";
import { ChevronRight, BookOpen, Scale } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongoose";
import LegalContent from "@/models/LegalContent";
import { LegalHeader } from "@/components/legal/LegalHeader";

import { Metadata } from "next";

function getNormalizedSlug(slug: string): string {
  if (slug === "privacy") return "privacy-policy";
  if (slug === "terms") return "terms-of-service";
  if (slug === "cookies") return "cookie-policy";
  return slug;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = getNormalizedSlug(slug);
  
  let page: any = null;
  try {
    await dbConnect();
    page = await LegalContent.findOne({ slug: normalizedSlug }).lean();
  } catch (e) {
    console.error("Failed to fetch legal metadata from DB:", e);
  }

  if (!page) {
    page = LEGAL_CONTENT[normalizedSlug];
  }

  if (!page) {
    return { title: "Legal | Toollix.io" };
  }

  return {
    title: `${page.title} | Toollix.io`,
    description: `Read the official ${page.title} for Toollix.io. Learn more about our privacy, licensing, terms, and security controls.`,
    alternates: {
      canonical: `/legal/${normalizedSlug}`,
    },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = getNormalizedSlug(slug);
  
  // Try to fetch from DB first (dedicated editor)
  let page: any = null;
  try {
    await dbConnect();
    page = await LegalContent.findOne({ slug: normalizedSlug }).lean();
  } catch (e) {
    console.error("Failed to fetch legal from DB:", e);
  }

  // Fallback to static content if not in DB
  if (!page) {
    page = LEGAL_CONTENT[normalizedSlug];
  }

  if (!page) {
    notFound();
  }

  // Normalize data (DB and static have different date formats/structures)
  const displayDate = page.lastUpdated instanceof Date 
    ? page.lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : page.lastUpdated;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Premium Header - Client Component */}
      <LegalHeader title={page.title} displayDate={displayDate} />

      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          
          {/* Section Navigator (Sidebar) */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Contents</p>
                <nav className="space-y-1">
                  {page.sections.map((section: any) => (
                    <a 
                      key={section.id}
                      href={`#${section.id}`}
                      className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-sm font-semibold text-slate-500 hover:text-slate-900"
                    >
                      {section.title.split(' ')[1] || section.title}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
                 <Scale className="w-8 h-8 mb-4 opacity-50" />
                 <h3 className="font-bold text-lg leading-tight mb-2">Privacy is our Default.</h3>
                 <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                   We built Toollix to be the safest place online to handle your files. No data is ever stored on our systems.
                 </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white border border-slate-200 rounded-3xl sm:rounded-[40px] p-6 sm:p-16 shadow-2xl shadow-slate-200/50">
               
               {/* Welcome Banner */}
               <div className="mb-8 sm:mb-12 pb-8 sm:pb-12 border-b border-slate-100">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6">
                    <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Official Documentation
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none mb-4 sm:mb-6">
                    Professional Transparency.
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-500 max-w-2xl leading-relaxed">
                    This document outlines the high standards we maintain to protect your rights and ensure a secure experience across our platform.
                  </p>
               </div>

               {/* Sections */}
                <div className="space-y-12 sm:space-y-20">
                   {page.sections.map((section: any) => (
                     <section key={section.id} id={section.id} className="scroll-mt-32">
                       <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 group">
                         <span className="w-1 h-6 sm:w-1.5 sm:h-8 bg-emerald-500 rounded-full group-hover:scale-y-125 transition-transform" />
                         {section.title}
                       </h3>
                       <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-lg">
                         <p>{section.content}</p>
                       </div>
                     </section>
                   ))}
                </div>

               {/* Footer of Content */}
                <div className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-slate-100">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900 flex items-center justify-center font-black text-white italic text-sm sm:text-base">
                           T.
                         </div>
                         <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">Legal Department</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">toollix.io — Security First</p>
                         </div>
                      </div>
                     <Link href="/contact">
                        <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
                           Ask a Question
                        </button>
                     </Link>
                  </div>
               </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
