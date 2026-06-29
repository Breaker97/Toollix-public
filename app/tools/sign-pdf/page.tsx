import { Metadata } from 'next';
import { ALL_TOOLS } from '@/lib/tools-data';
import ClientComponent from './signpdfClient';

export async function generateMetadata(): Promise<Metadata> {
  const tool = ALL_TOOLS.find(t => t.href === '/tools/sign-pdf');
  return {
    title: tool?.seoTitle || `${tool?.title} - Toollix`,
    description: tool?.seoDescription || tool?.description,
    keywords: tool?.keywords,
  };
}

export default function Page() {
  return <ClientComponent />;
}
