import { Metadata } from 'next';
import { ALL_TOOLS } from "@/lib/tools-data";
import PassportPhotoClient from './PassportPhotoClient';

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === "/tools/passport-photo-maker");
  
  return {
    title: tool?.seoTitle || "Passport Photo Maker - Toollix",
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

export default function PassportPhotoPage() {
  return <PassportPhotoClient />;
}
