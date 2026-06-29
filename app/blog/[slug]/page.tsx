import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { BookOpen, Calendar, Clock, ArrowLeft, Share2, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ALL_TOOLS } from "@/lib/tools-data";
import { AdUnit } from "@/components/ad-unit";

// ── Social Icons (Lucide fallback) ──────────────────────────────────────────
const FacebookIcon = () => (
   <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
   </svg>
);
const TwitterIcon = () => (
   <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
   </svg>
);
const LinkedinIcon = () => (
   <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
   </svg>
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article: any = null;
  try {
    const conn = await dbConnect();
    if (conn) {
      article = await Article.findOne({ slug, published: true }).lean();
    }
  } catch (err) {
    console.error("Metadata fetch error:", err);
  }
  
  if (!article) return { title: "Toollix Blog" };

  return {
    title: `${article.title} | Toollix Blog`,
    description: article.seoDescription || `Read our guide about ${article.title} on Toollix.`,
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription,
      type: 'article',
      publishedTime: article.createdAt,
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article: any = null;
  try {
    const conn = await dbConnect();
    if (conn) {
      article = await Article.findOne({ slug, published: true }).lean();
    }
  } catch (error) {
    console.error("Blog post fetch error:", error);
  }

  if (!article) {
    notFound();
  }

  const publishDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 pt-24 sm:pt-32">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-8 sm:mb-12 group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all shadow-soft-xl">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          Back to Knowledge Base
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8 flex flex-col">
            <header className="mb-12">
               <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
                  <BookOpen className="w-4 h-4" /> Editorial
               </div>
               <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none mb-8">
                  {article.title}
               </h1>
               
               <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-6 sm:py-8 border-y border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 flex items-center justify-center font-black text-white italic text-[10px] sm:text-xs">T.</div>
                     <div>
                        <p className="text-xs sm:text-sm font-black text-slate-900 leading-none">Toollix Editorial</p>
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-1">Authorized Author</p>
                     </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden md:block" />
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                     <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                     {publishDate}
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden md:block" />
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                     <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                     6 min read
                  </div>
               </div>
            </header>

            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
               <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            <footer className="mt-20 pt-12 border-t border-zinc-100 dark:border-zinc-800">
               <div className="flex flex-col gap-10 mb-12">
                 <div className="w-full flex justify-center py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] shadow-inner-soft">
                   <AdUnit width={728} height={90} placement="blog_footer" className="hidden md:flex" />
                   <AdUnit width={320} height={50} placement="blog_footer" className="flex md:hidden" />
                 </div>
               </div>
               <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Share this guide:</span>
                     <div className="flex gap-2">
                        {[FacebookIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                           <button key={i} className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border-none shadow-soft-xl flex items-center justify-center hover:bg-brand-red hover:text-white transition-all">
                              <Icon />
                           </button>
                        ))}
                     </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-red text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-brand-red/20">
                     <Share2 className="w-4 h-4" /> Copy Link
                  </button>
               </div>
            </footer>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
             <div className="sticky top-32 space-y-8">
                
                {/* Related Tools Section */}
                {article.relatedTools?.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Featured Tools</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {article.relatedTools.map((href: string) => {
                        const tool = ALL_TOOLS.find(t => t.href === href);
                        if (!tool) return null;
                        return (
                          <Link 
                            key={tool.href} 
                            href={tool.href}
                            className="group block bg-white dark:bg-zinc-900 rounded-[2rem] p-5 transition-all hover:shadow-soft-2xl hover:-translate-y-1 shadow-soft-xl"
                          >
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tool.bgClass}`}>
                                  <span className="text-xl font-black text-primary italic">{tool.title[0]}</span>
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-black text-slate-900 dark:text-zinc-100 group-hover:text-brand-red transition-colors truncate">{tool.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Free Web Tool</p>
                               </div>
                               <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all">
                                  <ChevronRight className="w-4 h-4" />
                               </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-red rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-red/20 px-10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                    <h3 className="text-xl font-black mb-4 italic leading-tight relative z-10">Fast. Free. <br /> Private.</h3>
                    <p className="text-xs text-white/80 font-medium leading-relaxed mb-8 relative z-10">
                      Toollix offers 24+ professional tools to handle your files with zero logs and maximum speed.
                    </p>
                    <Link href="/" className="relative z-10 block">
                       <button className="w-full h-12 rounded-2xl bg-white text-brand-red font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-colors shadow-xl">
                          Explore All Tools
                       </button>
                    </Link>
                  </div>
                )}

                {/* Ad Placement */}
                  <div className="flex flex-col gap-4">
                    <AdUnit 
                      placement="sidebar" 
                      className="rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-soft-xl hidden md:flex" 
                      width={300} 
                      height={250} 
                    />
                    <AdUnit 
                      placement="sidebar" 
                      className="rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-soft-xl flex md:hidden" 
                      width={320} 
                      height={50} 
                    />
                  </div>

             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
