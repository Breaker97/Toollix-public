import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Link from "next/link";
import { BookOpen, Calendar, Clock, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Blog & Guides | Toollix Toolkit",
  description: "Stay updated with the latest productivity tips, document management guides, and technical tutorials from Toollix.",
};

export default async function BlogListingPage() {
  let articles: any[] = [];
  try {
    const conn = await dbConnect();
    if (conn) {
      articles = await Article.find({ published: true }).sort({ createdAt: -1 }).lean();
    }
  } catch (error) {
    console.error("Failed to fetch blog articles:", error);
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 pt-32">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 text-brand-red text-[10px] font-black uppercase tracking-widest mb-6 shadow-soft-xl">
              <BookOpen className="w-4 h-4" /> Latest Updates
           </div>
           <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
              Knowledge Base.
           </h1>
           <p className="text-xl text-slate-500 leading-relaxed">
              Explore our collection of deep-dive guides, feature updates, and productivity workflows designed to help you master your tools.
           </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {articles.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-20 text-center space-y-4 shadow-soft-xl">
               <BookOpen className="w-12 h-12 text-slate-200 mx-auto" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No articles published yet.</p>
            </div>
          ) : (
            articles.map((article: any, idx: number) => (
              <Link 
                key={article.slug} 
                href={`/blog/${article.slug}`}
                className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 md:p-8 transition-all hover:shadow-soft-2xl hover:-translate-y-2 flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-soft-xl"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                   <Calendar className="w-4 h-4 text-brand-red" />
                   {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100 mb-4 leading-tight group-hover:text-brand-red transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8 mb-auto line-clamp-3">
                  {article.seoDescription || "Read our latest guide and stay informed with everything Toollix."}
                </p>

                <div className="flex items-center justify-between pt-8 mt-auto">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> 5 min read
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                   </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
