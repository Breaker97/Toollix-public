import dbConnect from "@/lib/mongoose";
import { getGlobalSettings } from "@/models/Settings";
import { Wrench, Zap, FileImage, Code2, Shield } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";
import Link from "next/link";
import Image from "next/image";

const toolLinks = {
  PDF: [
    { label: "Merge PDF", href: "/tools/merge-pdf" },
    { label: "Split PDF", href: "/tools/split-pdf" },
    { label: "Compress PDF", href: "/tools/compress-pdf" },
    { label: "PDF to Image", href: "/tools/pdf-to-image" },
    { label: "Image to PDF", href: "/tools/image-to-pdf" },
  ],
  Image: [
    { label: "Compress Image", href: "/tools/compress-image" },
    { label: "Resize Image", href: "/tools/resize-image" },
    { label: "Crop Image", href: "/tools/crop-image" },
    { label: "Convert Image", href: "/tools/convert-image" },
  ],
  Developer: [
    { label: "JSON Formatter", href: "/tools/json-formatter" },
    { label: "QR Generator", href: "/tools/qr-generator" },
    { label: "Base64 Encoder", href: "/tools/base64" },
    { label: "Regex Tester", href: "/tools/regex-tester" },
    { label: "URL Encoder", href: "/tools/url-encoder" },
  ],
};

export async function Footer() {
  let legalLinks: any[] = [];
  let logoUrl = "";
  let logoWidth = 120;

  try {
    await dbConnect();
    const settings = await getGlobalSettings();
    logoUrl = settings.siteLogo || "";
    logoWidth = settings.logoWidth || 120;

    // Fetch dynamic legal links
    const LegalContent = (await import("@/models/LegalContent")).default;
    const rawLinks = await LegalContent.find({ showInFooter: true }).select('slug title').lean();
    
    // Filter duplicates by title
    const seen = new Set();
    legalLinks = rawLinks.filter((link: any) => {
      const duplicate = seen.has(link.title);
      seen.add(link.title);
      return !duplicate;
    });
  } catch (e) {
    // fall back to defaults silently
  }

  return (
    <footer className="w-full bg-[#292931] text-zinc-300 border-t border-white/5 shadow-2xl">

      <div className="container mx-auto px-4 pt-12">
        <NewsletterSignup />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-6 justify-items-center md:justify-items-start">

          {/* Brand column */}
          <div className="col-span-2 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <Link href="/" className="flex items-center gap-0.5 group w-fit">
              <div className="transition-transform duration-200 group-hover:scale-105">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logo" width={logoWidth} height={40} className="max-h-10 object-contain w-auto h-auto" />
                ) : (
                  <div className="bg-primary p-1 rounded-xl">
                    <Wrench className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <span className="font-extrabold text-lg tracking-tight transition-colors">
                <span className="text-primary">toollix</span>
                <span className="text-[#c5a059]">.io</span>
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
              Your all-in-one platform for lightning-fast, free, and private online tools. 
              No installs. No registration required for most tools.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
              {["100% Free", "Privacy First", "No Watermarks"].map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-muted/60 border border-border/40 text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Tool columns */}
          {(Object.entries(toolLinks) as [string, { label: string; href: string }[]][]).map(([category, links]) => (
            <div key={category} className="flex flex-col items-center md:items-start gap-3 w-full">
              <div className="flex items-center gap-2">
                {category === "PDF" && <Zap className="w-3 h-3 text-primary" />}
                {category === "Image" && <FileImage className="w-3 h-3 text-blue-500" />}
                {category === "Developer" && <Code2 className="w-3 h-3 text-violet-500" />}
                <h3 className="text-sm font-semibold tracking-tight text-white">{category}</h3>
              </div>
              <ul className="space-y-1 md:space-y-1.5 text-center md:text-left w-full">
                {links.map(({ label, href }) => (
                  <li key={label} className="w-full">
                    <Link
                      href={href}
                      className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start gap-1 group py-3 md:py-0.5"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal column */}
          <div className="flex flex-col items-center md:items-start gap-3 w-full">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-emerald-500" />
              <h3 className="text-sm font-semibold tracking-tight text-white">Legal</h3>
            </div>
            <ul className="space-y-1 md:space-y-1.5 text-center md:text-left w-full">
              <li className="w-full">
                <Link href="/about" className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start py-3 md:py-0.5">
                  About Us
                </Link>
              </li>
              {legalLinks.length > 0 ? (
                legalLinks.map((link) => (
                  <li key={link.slug} className="w-full">
                    <Link href={`/legal/${link.slug}`} className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start gap-1 group py-3 md:py-0.5">
                      {link.title.replace(' Policy', '')}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li className="w-full"><Link href="/legal/privacy-policy" className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start py-3 md:py-0.5">Privacy</Link></li>
                  <li className="w-full"><Link href="/legal/terms-of-service" className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start py-3 md:py-0.5">Terms of Service</Link></li>
                  <li className="w-full"><Link href="/legal/cookie-policy" className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start py-3 md:py-0.5">Cookie</Link></li>
                </>
              )}
              <li className="w-full">
                <Link href="/contact" className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start gap-1 group py-3 md:py-0.5">
                  Contact
                </Link>
              </li>
              <li className="w-full">
                <a href="/sitemap.xml" className="text-sm font-medium text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 flex items-center justify-center md:justify-start gap-1 group py-3 md:py-0.5">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Sub-Footer Layout */}
        <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xs font-medium text-zinc-500 text-center md:text-left">
            © 2026 toollix<span className="text-primary font-bold">.io</span> — made with love ❤️ and built for speed.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
            <span className="hover:text-primary transition-colors cursor-default">Secure & Encrypted</span>
            <span className="w-1 h-1 rounded-full bg-primary/20" />
            <span className="hover:text-primary transition-colors cursor-default">No Data Storage</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
