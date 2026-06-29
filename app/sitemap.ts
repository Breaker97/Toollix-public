import { MetadataRoute } from "next";
import dbConnect from "@/lib/mongoose";
import Article from "@/models/Article";
import { ALL_TOOLS } from "@/lib/tools-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.toollix.io";

  // Use ALL_TOOLS from tools-data for a truly dynamic sitemap
  const sitemapEntries: MetadataRoute.Sitemap = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Add Articles dynamically
  try {
    await dbConnect();
    const articles = await Article.find({ published: true });
    articles.forEach((art) => {
      sitemapEntries.push({
        url: `${baseUrl}/articles/${art.slug}`,
        lastModified: art.updatedAt.toISOString().split("T")[0],
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });
  } catch (err) {
    console.error("Sitemap article fetch failed:", err);
  }

  // Add core routes
  sitemapEntries.unshift(
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/terms-of-service`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/cookie-policy`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.5,
    }
  );

  return sitemapEntries;
}
