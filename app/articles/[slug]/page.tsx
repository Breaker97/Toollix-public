import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdUnit } from "@/components/ad-unit";
import { ALL_TOOLS } from "@/lib/tools-data";

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const conn = await dbConnect();
    if (conn) {
      const article = await Article.findOne({ slug, published: true });
      if (article) {
        return {
          title: `${article.seoTitle || article.title} | Toollix Guides`,
          description: article.seoDescription,
          alternates: {
            canonical: `/articles/${slug}`,
          },
          openGraph: {
            title: article.seoTitle || article.title,
            description: article.seoDescription,
            type: 'article',
          }
        };
      }
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }
  return { title: "Toollix Guide" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article: any = null;
  
  try {
    const conn = await dbConnect();
    if (conn) {
      article = await Article.findOne({ slug, published: true }).lean();
    }
  } catch (error) {
    console.error("Article fetch error:", error);
  }
  
  if (!article) return notFound();

  const wordCount = (article.content || "").trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const publishDate = new Date(article.updatedAt || article.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24 sm:pt-32">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Back Button */}
        <Link 
          href="/articles" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-8 sm:mb-12 group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          Back to Knowledge Base
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Article Content */}
          <article className="lg:col-span-8 flex flex-col">
            <header className="mb-12">
               <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
                  <BookOpen className="w-4 h-4" /> Guide
               </div>
               <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-8">
                  {article.title}
               </h1>
               
               <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-6 sm:py-8 border-y border-slate-200/60">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary italic text-[10px] sm:text-xs">T.</div>
                     <div>
                        <p className="text-xs sm:text-sm font-black text-slate-900 leading-none">Toollix Editorial</p>
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-1">Verified Resource</p>
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
                     {readingTime} min read
                  </div>
               </div>
            </header>

            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
               <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            <footer className="mt-20 pt-12 border-t border-slate-200">
               <div className="w-full flex justify-center py-8 mb-12 bg-muted/20 rounded-3xl border border-border/40">
                  <AdUnit width={728} height={90} placement="article_footer" className="hidden md:flex" />
                  <AdUnit width={320} height={50} placement="article_footer" className="flex md:hidden" />
               </div>
               <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-bold text-slate-900">Share this guide:</span>
                     <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <Share2 className="w-4 h-4 text-slate-600" />
                     </button>
                  </div>
                  <Link href="/">
                    <Button className="rounded-2xl font-black text-xs uppercase tracking-widest px-8 h-12">Explore All Tools</Button>
                  </Link>
               </div>
            </footer>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
             <div className="sticky top-32 space-y-8">
                
                {/* Related Tools Section */}
                {article.relatedTools?.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1 text-emerald-500">
                      <Sparkles className="w-4 h-4" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Relevant Tools</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {article.relatedTools.map((href: string) => {
                        const tool = ALL_TOOLS.find(t => t.href === href);
                        if (!tool) return null;
                        return (
                          <Link 
                            key={tool.href} 
                            href={tool.href}
                            className="group block bg-white border border-slate-200 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                          >
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tool.bgClass}`}>
                                  <span className="text-xl font-black text-primary italic">{tool.title[0]}</span>
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors truncate">{tool.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Free Premium Tool</p>
                               </div>
                               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary rounded-[40px] p-8 text-white shadow-xl shadow-primary/20 px-10">
                    <h3 className="text-xl font-black mb-4 italic leading-tight">Fast. Free. <br /> Professional.</h3>
                    <p className="text-xs text-primary-inverse/80 font-medium leading-relaxed mb-8">
                      Toollix offers 24+ professional tools to handle your files with zero logs and maximum speed.
                    </p>
                    <Link href="/">
                       <button className="w-full h-12 rounded-2xl bg-white text-primary font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                          Explore All Tools
                       </button>
                    </Link>
                  </div>
                )}

                {/* Ad Placement */}
                <div className="flex flex-col gap-4">
                  <AdUnit 
                    placement="sidebar" 
                    className="rounded-3xl sm:rounded-[40px] overflow-hidden border border-slate-200 bg-white hidden md:flex" 
                    width={300} 
                    height={250} 
                  />
                  <AdUnit 
                    placement="sidebar" 
                    className="rounded-3xl sm:rounded-[40px] overflow-hidden border border-slate-200 bg-white flex md:hidden" 
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
