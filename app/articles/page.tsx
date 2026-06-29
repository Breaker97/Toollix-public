import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import Link from "next/link";
import { BookOpen, ArrowRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Toollix Guides | Master Your Digital Workflow",
  description: "Expert tutorials, tips, and how-to guides for PDF management, image processing, and online utilities.",
  alternates: {
    canonical: "/articles",
  },
};

export default async function ArticlesDirectory() {
  let articles: any[] = [];
  try {
    const conn = await dbConnect();
    if (conn) {
      // Fetch only published articles, sorted by newest first
      articles = await Article.find({ published: true }).sort({ updatedAt: -1 });
    }
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl text-primary font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Toollix Knowledge Base</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
              Master Your <span className="text-primary italic">Digital</span> Workflow.
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Explore our collection of expert-written guides, tutorials, and tips designed to help you get the most out of our free online tools.
            </p>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-20 container mx-auto px-6">
        {articles.length === 0 ? (
          <div className="text-center py-32 space-y-4">
             <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                <BookOpen className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold">No guides found.</h2>
             <p className="text-muted-foreground">Our team is currently drafting some amazing content. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const wordCount = article.content.trim().split(/\s+/).length;
              const readingTime = Math.ceil(wordCount / 200);
              
              return (
                <Link 
                  key={article._id.toString()} 
                  href={`/articles/${article.slug}`}
                  className="group relative flex flex-col bg-background border border-border/60 rounded-[2.5rem] p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-inverse shadow-xl">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readingTime} MIN</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-2xl font-black leading-tight mb-4 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-muted-foreground font-medium text-sm line-clamp-3 mb-8 flex-1">
                    {article.seoDescription || "Discover expert tips and full tutorials on how to use our professional tools for your daily tasks."}
                  </p>

                  <div className="pt-6 border-t border-border/40">
                     <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        Read Full Guide <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                     </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 mb-24">
         <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-12 text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-black">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              We're constantly adding new tools and guides. If you have a specific request, feel free to reach out to our team.
            </p>
            <Link href="/">
              <Button size="lg" className="h-16 px-12 rounded-[1.5rem] font-bold shadow-xl shadow-primary/20">
                Back to Toollix Home
              </Button>
            </Link>
         </div>
      </section>
    </div>
  );
}
