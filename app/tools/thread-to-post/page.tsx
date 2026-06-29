import { Metadata } from 'next';
import { ALL_TOOLS } from "@/lib/tools-data";
import ThreadCarouselClient from './ThreadCarouselClient';

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/thread-to-post");
  
  return {
    title: tool?.seoTitle || "Thread to Carousel - Toollix",
    description: tool?.seoDescription || tool?.description,
    keywords: tool?.keywords,
    openGraph: {
      title: `${tool?.title} | Toollix`,
      description: tool?.description,
      url: `https://www.toollix.io${tool?.href}`,
      type: "website",
    }
  };
}

export default function ThreadCarouselPage() {
  return <ThreadCarouselClient />;
}
