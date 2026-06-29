"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, Save, Globe, ShieldAlert, BarChart, 
  FileCode, Search, Scale, Plus, Trash2, 
  Activity, Sparkles, Mail, ChevronRight, LayoutGrid, CreditCard, Send,
  UploadCloud, Image, Zap,
  Settings as SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SmartText } from "@/components/ui/smart-text";

type Category = "general" | "branding" | "monetization" | "security" | "legal" | "marketing" | "storage" | "auth" | "pricing" | "engines" | "customcode";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("general");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: string; error?: string } | null>(null);

  const categories = [
    { id: "general", label: "General & SEO", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "branding", label: "Branding & Logo", icon: Zap, color: "text-gold-metallic", bg: "bg-gold-metallic/10" },
    { id: "monetization", label: "Ads & Revenue", icon: BarChart, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "security", label: "Security & Limits", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "legal", label: "Compliance & Legal", icon: Scale, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "marketing", label: "Email Marketing", icon: Mail, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "storage", label: "Cloud Storage", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "auth", label: "Social Auth", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/10" },
    { id: "pricing", label: "Pricing & Plans", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "engines", label: "Cloud Engines", icon: Activity, color: "text-orange-600", bg: "bg-orange-600/10" },
    { id: "customcode", label: "Custom Code", icon: FileCode, color: "text-violet-600", bg: "bg-violet-600/10" },
  ];

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            ...data.settings,
            ads: data.settings.ads || [],
            gcsEnabled: data.settings.gcsEnabled ?? false,
            gcsBucketName: data.settings.gcsBucketName || "",
            gcsProjectId: data.settings.gcsProjectId || "",
            gcsClientEmail: data.settings.gcsClientEmail || "",
            gcsPrivateKey: data.settings.gcsPrivateKey || "",
            googleClientId: data.settings.googleClientId || "",
            googleClientSecret: data.settings.googleClientSecret || "",
            proOriginalPrice: data.settings.proOriginalPrice ?? 15,
            proCurrentPrice: data.settings.proCurrentPrice ?? 9,
            priceCurrency: data.settings.priceCurrency || "$",
            smtpHost: data.settings.smtpHost || "",
            smtpPort: data.settings.smtpPort ?? 587,
            smtpSecure: data.settings.smtpSecure ?? false,
            smtpUser: data.settings.smtpUser || "",
            smtpPass: data.settings.smtpPass || "",
            smtpFrom: data.settings.smtpFrom || "",
            siteLogo: data.settings.siteLogo || "",
            logoWidth: data.settings.logoWidth || 120,
            siteFavicon: data.settings.siteFavicon || "",
            googleSearchConsoleId: data.settings.googleSearchConsoleId || "",
            bingWebmasterId: data.settings.bingWebmasterId || "",
            replicateApiKey: data.settings.replicateApiKey || "",
            hfAccessToken: data.settings.hfAccessToken || "",
            adobeClientId: data.settings.adobeClientId || "",
            adobeClientSecret: data.settings.adobeClientSecret || "",
            adobeOrganizationId: data.settings.adobeOrganizationId || "",
            adobeTechnicalAccountId: data.settings.adobeTechnicalAccountId || "",
            adobeTechnicalAccountEmail: data.settings.adobeTechnicalAccountEmail || "",
            hideAdsForPro: data.settings.hideAdsForPro ?? true,
            headCode: data.settings.headCode || "",
            bodyStartCode: data.settings.bodyStartCode || "",
            bodyEndCode: data.settings.bodyEndCode || "",
          });
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.checked });
  };

  const handleAddAd = () => {
    setSettings({
      ...settings,
      ads: [...settings.ads, { name: "", placement: "banner", code: "", active: true }]
    });
  };

  const handleAdChange = (index: number, field: string, value: any) => {
    const updatedAds = [...settings.ads];
    updatedAds[index][field] = value;
    setSettings({ ...settings, ads: updatedAds });
  };

  const handleRemoveAd = (index: number) => {
    const updatedAds = [...settings.ads];
    updatedAds.splice(index, 1);
    setSettings({ ...settings, ads: updatedAds });
  };

  const [uploading, setUploading] = useState<string | null>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/admin/settings/logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, [type === "logo" ? "siteLogo" : "siteFavicon"]: data.url });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Error uploading file.");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
         alert("Failed to save settings.");
      }
    } catch {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };
  
  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: "Diagnostic email sent! Check your inbox (admin@toollix.io)." });
      } else {
        setTestResult({ error: data.error || "SMTP verification failed." });
      }
    } catch {
      setTestResult({ error: "Network error during SMTP test." });
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
       
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl shadow-inner">
               <SettingsIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
               <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Global Strategy</h1>
               <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure platform parameters and engine credentials.</p>
            </div>
         </div>
         <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-12 w-full md:w-auto px-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold shadow-xl shadow-zinc-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2.5 uppercase tracking-widest text-xs"
         >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Persist Configuration
         </Button>
       </header>

       <div className="flex flex-col lg:flex-row gap-10">
         {/* SIDEBAR NAVIGATION */}
         <aside className="w-full lg:w-72 shrink-0">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none">
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.id as Category)}
                   className={cn(
                     "flex items-center gap-3 w-full p-3.5 rounded-xl transition-all text-left group shrink-0",
                     activeCategory === cat.id 
                       ? "bg-primary/10 text-primary shadow-sm" 
                       : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-500"
                   )}
                 >
                   <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110", activeCategory === cat.id ? "bg-white dark:bg-zinc-900 shadow-sm" : cat.bg)}>
                      <cat.icon className={cn("w-4.5 h-4.5", activeCategory === cat.id ? "text-primary" : cat.color)} />
                   </div>
                   <div className="flex-1">
                      <span className={cn("text-[13px] font-bold tracking-tight", activeCategory === cat.id ? "text-primary" : "text-zinc-600 dark:text-zinc-400")}>{cat.label}</span>
                   </div>
                   <ChevronRight className={cn("w-3.5 h-3.5 transition-all", 
                     activeCategory === cat.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                   )} />
                 </button>
               ))}
            </nav>
         </aside>

         {/* CONTENT AREA */}
         <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            
            {activeCategory === "general" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                       <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Search Presence</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">SEO & Discovery Parameters</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <Label htmlFor="siteTitle" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Platform Identity (Title)</Label>
                      <Input id="siteTitle" name="siteTitle" value={settings.siteTitle || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="googleAnalyticsId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Analytics Measurement ID</Label>
                      <Input id="googleAnalyticsId" name="googleAnalyticsId" value={settings.googleAnalyticsId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm placeholder:text-zinc-400 focus:ring-2 ring-primary/20 outline-none" placeholder="G-XXXXXX" />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="siteDescription" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Universal Meta Description</Label>
                    <textarea id="siteDescription" name="siteDescription" value={settings.siteDescription || ""} onChange={handleChange} className="w-full h-32 p-5 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl focus:ring-2 ring-primary/20 outline-none resize-none text-sm font-medium leading-relaxed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="space-y-2.5">
                       <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-blue-600" />
                          <Label htmlFor="googleSearchConsoleId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Google Search Console</Label>
                       </div>
                       <Input id="googleSearchConsoleId" name="googleSearchConsoleId" value={settings.googleSearchConsoleId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="Verification Token" />
                    </div>
                    <div className="space-y-2.5">
                       <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-emerald-600" />
                          <Label htmlFor="bingWebmasterId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bing Webmaster Tools</Label>
                       </div>
                       <Input id="bingWebmasterId" name="bingWebmasterId" value={settings.bingWebmasterId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="Verification Token" />
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                       <FileCode className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Crawler Instructions</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Robots.txt Directives</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="robotsContent" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Live Manifest</Label>
                    <textarea id="robotsContent" name="robotsContent" value={settings.robotsContent || ""} onChange={handleChange} className="w-full h-40 p-6 bg-zinc-900 text-emerald-500 font-mono text-[11px] border-none rounded-2xl focus:ring-2 ring-primary/20 outline-none resize-none shadow-inner" />
                  </div>
                </section>
              </div>
            )}
            
            {activeCategory === "branding" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-10 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                       <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Visual Identity</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Logos, Favicons & Scaling</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* LOGO SECTION */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Primary Logo (Asset)</Label>
                          {uploading === "logo" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                       </div>
                       
                       <div className="relative group aspect-video rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all overflow-hidden cursor-pointer">
                          {settings.siteLogo ? (
                             <div className="relative w-full h-full flex items-center justify-center p-12">
                                <img 
                                  src={settings.siteLogo} 
                                  alt="Logo Preview" 
                                  className="max-h-full transition-all duration-500 group-hover:scale-105" 
                                  style={{ width: `${settings.logoWidth}px` }} 
                                />
                                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                   <label className="cursor-pointer bg-white text-zinc-900 px-5 py-2.5 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-transform shadow-xl">
                                      Replace Asset
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
                                   </label>
                                   <Button variant="destructive" size="sm" className="rounded-xl h-10 px-5 text-xs font-bold shadow-xl" onClick={() => setSettings({...settings, siteLogo: ""})}>Wipe</Button>
                                </div>
                             </div>
                          ) : (
                             <label className="cursor-pointer flex flex-col items-center gap-4 p-12 text-center w-full h-full justify-center">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                                   <UploadCloud className="w-7 h-7" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Upload Branding Asset</p>
                                   <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">SVG, PNG or WEBP (Directivity)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} />
                             </label>
                          )}
                       </div>

                       <div className="space-y-6 px-1">
                          <div className="flex items-center justify-between">
                             <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scale Manifest (Width)</Label>
                             <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{settings.logoWidth}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="20" 
                            max="300" 
                            name="logoWidth"
                            value={settings.logoWidth} 
                            onChange={(e) => setSettings({...settings, logoWidth: parseInt(e.target.value)})}
                            className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary" 
                          />
                          <p className="text-[10px] text-zinc-400 font-medium italic">* This logic replaces the primary brand icon. Text logo remains static.</p>
                       </div>
                    </div>

                    {/* FAVICON SECTION */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Browser Identity (Favicon)</Label>
                          {uploading === "favicon" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                       </div>

                       <div className="relative group w-48 h-48 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all mx-auto cursor-pointer">
                          {settings.siteFavicon ? (
                             <div className="relative w-full h-full flex items-center justify-center p-6">
                                <img src={settings.siteFavicon} alt="Favicon Preview" className="w-16 h-16 rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2 rounded-[2.5rem]">
                                   <label className="cursor-pointer bg-white text-zinc-900 px-4 py-2 rounded-xl text-[10px] font-bold shadow-xl">
                                      Update Favicon
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "favicon")} />
                                   </label>
                                </div>
                             </div>
                          ) : (
                             <label className="cursor-pointer flex flex-col items-center gap-4 p-8 text-center w-full h-full justify-center">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-inner">
                                   <Image className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Upload Manifest Icon</p>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "favicon")} />
                             </label>
                          )}
                       </div>
                       <p className="text-[10px] text-zinc-400 font-medium text-center max-w-xs mx-auto leading-relaxed uppercase tracking-wider px-4">Modern browser standard: 32x32px PNG or ICO format.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "monetization" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                       <BarChart className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Revenue Configuration</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Ad Networks & Visibility Throttling</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Universal Traffic Toggles</Label>
                       <label className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Display Manual Ad Units</span>
                          <input type="checkbox" name="showAds" checked={settings.showAds} onChange={handleCheckboxChange} className="w-5 h-5 accent-primary cursor-pointer" />
                       </label>
                       <label className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Google AdSense Auto-Serve</span>
                          <input type="checkbox" name="autoAdsEnabled" checked={settings.autoAdsEnabled} onChange={handleCheckboxChange} className="w-5 h-5 accent-primary cursor-pointer" />
                       </label>
                       <label className="flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all cursor-pointer group shadow-sm">
                          <div className="space-y-0.5">
                             <span className="text-sm font-bold text-primary">Clean Interface for PRO Members</span>
                             <p className="text-[10px] text-primary/60 font-medium uppercase tracking-tight">Suppresses all ad injections for Premium tier.</p>
                          </div>
                          <input type="checkbox" name="hideAdsForPro" checked={settings.hideAdsForPro} onChange={handleCheckboxChange} className="w-5 h-5 accent-primary cursor-pointer" />
                       </label>
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2.5">
                          <Label htmlFor="googleAdsenseId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">AdSense Publisher Identity</Label>
                          <Input id="googleAdsenseId" name="googleAdsenseId" value={settings.googleAdsenseId || ""} onChange={handleChange} placeholder="ca-pub-XXXXX" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                       </div>
                       <div className="space-y-2.5">
                          <Label htmlFor="adsContent" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Authoritative Ads.txt Registry</Label>
                          <textarea id="adsContent" name="adsContent" value={settings.adsContent || ""} onChange={handleChange} className="w-full h-32 p-5 bg-zinc-900 text-amber-500 font-mono text-[11px] rounded-2xl outline-none focus:ring-2 ring-primary/20 resize-none shadow-inner" />
                       </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                          <LayoutGrid className="w-5 h-5 text-indigo-500" />
                       </div>
                       <div>
                          <h2 className="text-xl font-extrabold tracking-tight">Placement Matrix</h2>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Manual Injectable Ad Units</p>
                       </div>
                    </div>
                    <Button onClick={handleAddAd} variant="outline" className="h-10 rounded-xl border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold gap-2 px-6 shadow-sm">
                       <Plus className="w-4 h-4" /> Define Unit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
                    {settings.ads.map((ad: any, index: number) => (
                      <div key={index} className="p-6 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 space-y-4 shadow-sm group">
                         <div className="grid grid-cols-2 gap-4">
                            <Input value={ad.name} onChange={(e) => handleAdChange(index, "name", e.target.value)} placeholder="Friendly Name" className="h-10 text-xs rounded-xl bg-white dark:bg-zinc-900 border-none font-bold" />
                            <select value={ad.placement} onChange={(e) => handleAdChange(index, "placement", e.target.value)} className="h-10 text-xs rounded-xl border-none bg-white dark:bg-zinc-900 px-3 font-bold cursor-pointer outline-none focus:ring-2 ring-primary/20">
                               <option value="header">Global Header</option>
                               <option value="middle">Utility Content</option>
                               <option value="sidebar">Sidebar Slot</option>
                               <option value="footer">Root Footer</option>
                            </select>
                         </div>
                         <textarea value={ad.code} onChange={(e) => handleAdChange(index, "code", e.target.value)} placeholder="Embed logic (Script/HTML)..." className="w-full h-24 p-4 text-[10px] font-mono border-none bg-white dark:bg-zinc-900 rounded-xl resize-none outline-none focus:ring-2 ring-primary/20 shadow-inner" />
                         <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer">
                               <input type="checkbox" checked={ad.active} onChange={(e) => handleAdChange(index, "active", e.target.checked)} className="w-4 h-4 accent-primary" />
                               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors">Unit Operational</span>
                            </label>
                            <button onClick={() => handleRemoveAd(index)} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                    ))}
                    {settings.ads.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl gap-4">
                            <LayoutGrid className="w-12 h-12" />
                            <p className="text-xs font-bold uppercase tracking-[0.2em]">Zero Active Placements</p>
                        </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "security" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-10 border border-zinc-50 dark:border-none">
                   <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-red-500/10 rounded-xl">
                       <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">API Infrastructure Limits</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Usage Quotation & Rate Limiting</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-8 border border-zinc-100 dark:border-zinc-800/50 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-800/30 space-y-6 shadow-sm">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block text-center bg-white dark:bg-zinc-900 shadow-sm py-2 rounded-xl">Anonymous Usage</span>
                       <div className="space-y-5">
                          <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 ml-1">Cycles / 24h</Label><Input type="number" name="guestDailyLimit" value={settings.guestDailyLimit} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-none font-bold shadow-sm" /></div>
                          <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 ml-1">Cycles / Hour</Label><Input type="number" name="guestHourlyLimit" value={settings.guestHourlyLimit} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-none font-bold shadow-sm" /></div>
                       </div>
                    </div>
                    <div className="p-8 border border-primary/10 rounded-[2rem] bg-primary/5 space-y-6 shadow-sm">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary block text-center bg-white dark:bg-zinc-900 shadow-sm py-2 rounded-xl">Standard Account</span>
                       <div className="space-y-5">
                          <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-tighter text-primary/40 ml-1">Cycles / 24h</Label><Input type="number" name="freeDailyLimit" value={settings.freeDailyLimit} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-none font-bold shadow-sm" /></div>
                          <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-tighter text-primary/40 ml-1">Cycles / Hour</Label><Input type="number" name="freeHourlyLimit" value={settings.freeHourlyLimit} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-none font-bold shadow-sm" /></div>
                       </div>
                    </div>
                    <div className="p-8 border-2 border-violet-500/20 rounded-[2.5rem] bg-white dark:bg-zinc-900 space-y-6 shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white block text-center bg-violet-600 shadow-lg shadow-violet-500/30 py-2 rounded-xl relative z-10">Premium Elite</span>
                       <div className="space-y-5 relative z-10">
                          <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-tighter text-violet-400 ml-1">Global 24h Window</Label><div className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center px-4 font-black text-violet-500 shadow-inner">∞ Unlimited</div></div>
                          <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase tracking-tighter text-violet-400 ml-1">Max Hourly Burst</Label><Input type="number" name="proHourlyLimit" value={settings.proHourlyLimit} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 font-bold focus:ring-violet-500/20 shadow-sm" /></div>
                       </div>
                    </div>
                  </div>
                </section>

                <section className="bg-red-600 p-10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(220,38,38,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden group border border-red-400/20">
                   <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                   <div className="space-y-1 relative z-10 text-center md:text-left">
                      <h3 className="text-2xl font-extrabold tracking-tight">Engine Isolation (Maintenance)</h3>
                      <p className="text-sm text-white/70 font-medium leading-relaxed">Kill all public application controllers. Only authority IDs remain active.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer z-10 scale-125">
                      <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleCheckboxChange} className="sr-only peer" />
                      <div className="w-16 h-8 bg-black/40 rounded-full peer peer-checked:bg-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white peer-checked:after:bg-red-600 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-8 shadow-inner" />
                   </label>
                </section>
              </div>
            )}

            {activeCategory === "legal" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                       <Scale className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Compliance & Data Governance</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">GDPR, Terms & Privacy Directives</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                     <label className="flex items-center justify-between p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 cursor-pointer group hover:bg-emerald-500/10 transition-all shadow-sm">
                        <div className="space-y-1">
                           <p className="font-extrabold text-emerald-600 uppercase tracking-widest text-[11px]">EU Consent Interceptor</p>
                           <p className="text-sm font-medium text-emerald-600/60 leading-relaxed max-w-md">Activate the universal cookie acceptance banner for European visitors.</p>
                        </div>
                        <input type="checkbox" name="cookieConsentEnabled" checked={settings.cookieConsentEnabled} onChange={handleCheckboxChange} className="w-6 h-6 accent-emerald-500 scale-125 cursor-pointer" />
                     </label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Privacy Registry Link</Label>
                           <Input name="privacyPolicyUrl" value={settings.privacyPolicyUrl} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                        </div>
                        <div className="space-y-2.5">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Terms of Service Link</Label>
                           <Input name="termsOfServiceUrl" value={settings.termsOfServiceUrl} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                        </div>
                     </div>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "marketing" && (
              <div className="space-y-8">
                 <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl">
                       <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Growth & Lifecycle Marketing</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Newsletter Aggregators & List Management</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6 p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 shadow-sm group">
                        <div className="flex items-center justify-between px-1">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">M</div>
                              <span className="font-extrabold tracking-tight">Mailchimp</span>
                           </div>
                           <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="space-y-2.5">
                           <Label className="text-[10px] uppercase font-bold text-blue-600/40 ml-1 tracking-widest">Secret API Key</Label>
                           <Input type="password" name="mailchimpApiKey" value={settings.mailchimpApiKey || ""} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-none font-bold px-4" placeholder="us1-xxxxxxxxxx" />
                        </div>
                     </div>
                     <div className="space-y-6 p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10 shadow-sm group">
                        <div className="flex items-center justify-between px-1">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">B</div>
                              <span className="font-extrabold tracking-tight">Brevo</span>
                           </div>
                           <div className="h-2 w-2 rounded-full bg-orange-500" />
                        </div>
                        <div className="space-y-2.5">
                           <Label className="text-[10px] uppercase font-bold text-orange-600/40 ml-1 tracking-widest">Secret API Key</Label>
                           <Input type="password" name="brevoApiKey" value={settings.brevoApiKey || ""} onChange={handleChange} className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-none font-bold px-4" placeholder="xkeysib-xxxxxxxxxx" />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                     <Label className="text-[10px] font-bold uppercase text-zinc-400 ml-1 tracking-widest">Target Audience ID (Newsletter)</Label>
                     <Input name="newsletterListId" value={settings.newsletterListId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="List ID Reference" />
                  </div>
                </section>

                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-10 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl">
                       <Send className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Dispatch (SMTP) Infrastructure</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">System Email Routing Credentials</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2.5">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 tracking-widest">SMTP Outbound Host</Label>
                        <Input name="smtpHost" value={settings.smtpHost || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="smtp.domain.com" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 tracking-widest">Routing Port</Label>
                        <Input type="number" name="smtpPort" value={settings.smtpPort || 587} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 tracking-widest">Identity (Username)</Label>
                        <Input name="smtpUser" value={settings.smtpUser || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 tracking-widest">Security Token (Password)</Label>
                        <Input type="password" name="smtpPass" value={settings.smtpPass || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                     </div>
                     <div className="space-y-2.5">
                        <Label className="text-[10px] uppercase font-bold text-zinc-400 ml-1 tracking-widest">Public Sender Identity</Label>
                        <Input name="smtpFrom" value={settings.smtpFrom || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder='"Toollix" <mail@toollix.io>' />
                     </div>
                     <div className="flex items-center gap-4 mt-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <input type="checkbox" name="smtpSecure" checked={!!settings.smtpSecure} onChange={handleCheckboxChange} className="w-5 h-5 accent-primary cursor-pointer" />
                           <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors">Apply SSL Encryption (High Guard)</span>
                        </label>
                     </div>
                  </div>
                  
                  <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="space-y-1 text-center md:text-left">
                        <p className="text-sm font-extrabold tracking-tight">Credential Diagnostic</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Trigger a cryptographic test sequence to inbox.</p>
                     </div>
                     <div className="flex items-center gap-4 w-full md:w-auto">
                        {testResult && (
                           <div className={cn(
                             "flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-bold border transition-all animate-in fade-in zoom-in-95 shadow-sm",
                             testResult.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border-red-500/20 text-red-600"
                           )}>
                              {testResult.success || testResult.error}
                           </div>
                        )}
                        <Button 
                          onClick={handleTestSmtp} 
                          disabled={testingSmtp || !settings.smtpHost || !settings.smtpUser}
                          variant="outline" 
                          className="h-11 px-8 rounded-xl font-bold gap-3 shrink-0 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-primary/5 hover:border-primary/20 text-zinc-700 dark:text-zinc-200 shadow-sm"
                        >
                           {testingSmtp ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Send className="w-4 h-4" />}
                           Execute Test Link
                        </Button>
                     </div>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "storage" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                       <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Object Storage Architecture</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Google Cloud Storage (GCS) Credentials</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-8 rounded-[2rem] bg-purple-500/5 border border-purple-500/10 shadow-sm">
                    <div className="space-y-1">
                      <p className="font-extrabold text-purple-600 uppercase tracking-widest text-[11px]">PDF Compression Bypass (Cloud)</p>
                      <p className="text-sm font-medium text-purple-600/60 leading-relaxed max-w-lg">When enabled, large files are processed via persistent GCS buckets instead of local buffer streams.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                      <input type="checkbox" name="gcsEnabled" checked={!!settings.gcsEnabled} onChange={handleCheckboxChange} className="sr-only peer" />
                      <div className="w-14 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-inner" />
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <Label htmlFor="gcsBucketName" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Universal Bucket Key</Label>
                      <Input id="gcsBucketName" name="gcsBucketName" value={settings.gcsBucketName || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="Production Bucket" />
                    </div>
                    <div className="space-y-2.5">
                       <Label htmlFor="gcsProjectId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">GCP Project Pointer</Label>
                       <Input id="gcsProjectId" name="gcsProjectId" value={settings.gcsProjectId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="gcsClientEmail" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Authority Service Identity (Email)</Label>
                    <Input id="gcsClientEmail" name="gcsClientEmail" value={settings.gcsClientEmail || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="gcsPrivateKey" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Secret Access Key (JSON Fragment)</Label>
                    <textarea 
                      id="gcsPrivateKey" 
                      name="gcsPrivateKey" 
                      value={settings.gcsPrivateKey || ""} 
                      onChange={handleChange} 
                      className="w-full h-48 p-6 bg-zinc-900 text-purple-400 font-mono text-[11px] border-none rounded-[2rem] focus:ring-2 ring-primary/20 outline-none resize-none shadow-inner leading-relaxed" 
                      placeholder="-----BEGIN PRIVATE KEY-----\n..."
                    />
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic ml-2 mt-2">Extract the "private_key" string from your service account JSON file.</p>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "auth" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-pink-500/10 rounded-xl">
                       <Sparkles className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Social Authentication Hub</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Google Identity & OAuth 2.0 Credentials</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 bg-blue-500/20 rounded-lg"><Globe className="w-4 h-4 text-blue-600" /></div>
                       <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">OAuth Activation Manifest</p>
                    </div>
                    <p className="text-sm text-blue-700/80 leading-relaxed font-medium">
                      Configure your project in <a href="https://console.cloud.google.com/" target="_blank" className="font-bold underline text-blue-600">Google Cloud Console</a>. 
                      Set the <strong>Authorized callback URI</strong> to the following relative path: 
                      <code className="mx-2 px-3 py-1 bg-white rounded-lg border-none shadow-sm text-blue-600 font-bold select-all inline-block mt-2">/api/auth/callback/google</code>
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="googleClientId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Client Identity Token</Label>
                      <Input id="googleClientId" name="googleClientId" value={settings.googleClientId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="OAuth Client ID" />
                    </div>
                    <div className="space-y-2.5">
                       <Label htmlFor="googleClientSecret" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Private Client Secret</Label>
                       <Input id="googleClientSecret" name="googleClientSecret" type="password" value={settings.googleClientSecret || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="Secret Key" />
                    </div>
                  </div>
                </section>
              </div>
            )}            {activeCategory === "pricing" && (
              <div className="space-y-8">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Monetization Geometry</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Front-end Pricing Display Parameters</p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 bg-emerald-500/20 rounded-lg"><Zap className="w-4 h-4 text-emerald-600" /></div>
                       <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Manual Economy Override</p>
                    </div>
                    <p className="text-sm text-emerald-700/80 leading-relaxed font-medium">
                      Automated checkout is current inactive. These parameters control the <strong>visual data</strong> displayed on pricing cards. 
                      Upgrades are processed via the <a href="/admin/users" className="font-extrabold text-emerald-600 underline">Authority Panel</a>.
                    </p>
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2.5">
                      <Label htmlFor="proOriginalPrice" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Listed MSRP (Crossed Out)</Label>
                      <Input id="proOriginalPrice" name="proOriginalPrice" type="number" value={settings.proOriginalPrice} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2.5">
                       <Label htmlFor="proCurrentPrice" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Live Offer Price</Label>
                       <Input id="proCurrentPrice" name="proCurrentPrice" type="number" value={settings.proCurrentPrice} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm text-emerald-500 focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="priceCurrency" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Currency Manifest</Label>
                      <Input id="priceCurrency" name="priceCurrency" value={settings.priceCurrency} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="$" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "engines" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-orange-600/10 rounded-xl">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Document Processing Engines</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Adobe Acrobat Services API (Expert Tier)</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-500/5 border border-orange-500/10 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 bg-orange-500/20 rounded-lg"><Zap className="w-4 h-4 text-orange-600" /></div>
                       <p className="text-xs font-extrabold text-orange-600 uppercase tracking-widest">Enterprise Compression Node</p>
                    </div>
                    <p className="text-sm text-orange-700/80 leading-relaxed font-medium">
                      Enable high-performance PDF optimization by linking your <a href="https://developer.adobe.com/console" target="_blank" className="font-extrabold text-orange-600 underline">Acrobat Services credentials</a>. Pro-tier compression uses this engine exclusively.
                    </p>
                  </div>
 
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="adobeClientId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Adobe Client ID Pointer</Label>
                      <Input id="adobeClientId" name="adobeClientId" value={settings.adobeClientId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="Client Reference" />
                    </div>
                    <div className="space-y-2.5">
                       <Label htmlFor="adobeClientSecret" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Secret Access Cipher</Label>
                       <Input id="adobeClientSecret" name="adobeClientSecret" type="password" value={settings.adobeClientSecret || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" placeholder="Client Secret" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                            <Label htmlFor="adobeOrganizationId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Org Identity Identifier</Label>
                            <Input id="adobeOrganizationId" name="adobeOrganizationId" value={settings.adobeOrganizationId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                        </div>
                        <div className="space-y-2.5">
                             <Label htmlFor="adobeTechnicalAccountId" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Tech Instance Account ID</Label>
                             <Input id="adobeTechnicalAccountId" name="adobeTechnicalAccountId" value={settings.adobeTechnicalAccountId || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <Label htmlFor="adobeTechnicalAccountEmail" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Instance Communication Email</Label>
                        <Input id="adobeTechnicalAccountEmail" name="adobeTechnicalAccountEmail" value={settings.adobeTechnicalAccountEmail || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic px-1 pt-2">
                    * If left blank, the tool will gracefully fall back to the Local Compression engine.
                  </p>
                  
                  <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving} 
                      className="h-12 px-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      Sync Engine State
                    </Button>
                  </div>
                </section>

                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-8 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-indigo-600/10 rounded-xl">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">AI Model Gateways</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">External Intelligence API Registry</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                      <Label htmlFor="replicateApiKey" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Replicate Core Token</Label>
                      <Input id="replicateApiKey" name="replicateApiKey" type="password" value={settings.replicateApiKey || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                    <div className="space-y-2.5">
                       <Label htmlFor="hfAccessToken" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">HuggingFace Authority Token</Label>
                       <Input id="hfAccessToken" name="hfAccessToken" type="password" value={settings.hfAccessToken || ""} onChange={handleChange} className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-none px-5 font-semibold text-sm focus:ring-2 ring-primary/20 outline-none" />
                    </div>
                  </div>
                </section>
              </div>
            )}


            {activeCategory === "customcode" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                {/* Info banner */}
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-violet-500/5 border border-violet-500/15 shadow-sm">
                  <div className="p-2.5 bg-violet-500/10 rounded-xl shrink-0 mt-0.5">
                    <FileCode className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-violet-700 dark:text-violet-400 text-sm tracking-tight">Global Code Injection</p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      Paste any HTML, script, or style tag here — Google AdSense auto-ads, Meta Pixel, Hotjar, LiveChat, custom fonts, etc.
                      Code is injected on <strong>every page</strong>. No restart required.
                    </p>
                  </div>
                </div>

                {/* HEAD */}
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-6 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-violet-500/10 rounded-xl">
                      <FileCode className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight">&lt;head&gt; Injection</h2>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Injected inside the HTML &lt;head&gt; tag — ideal for AdSense, GTM, meta tags</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <span className="inline-block px-2.5 py-1 bg-zinc-900 text-violet-400 font-mono text-[10px] rounded-md shadow-inner">&lt;head&gt;...&lt;/head&gt;</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Your code goes here</span>
                    </div>
                    <textarea
                      name="headCode"
                      value={settings.headCode || ""}
                      onChange={handleChange}
                      rows={10}
                      placeholder={`<!-- Example: Google AdSense -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>\n\n<!-- Example: Google Tag Manager -->\n<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>`}
                      className="w-full p-6 bg-zinc-900 text-violet-300 font-mono text-[11px] border-none rounded-2xl focus:ring-2 ring-violet-500/20 outline-none resize-none shadow-inner leading-relaxed"
                    />
                    <p className="text-[10px] text-zinc-400 font-medium italic ml-1">
                      ⚡ Rendered server-side via <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">dangerouslySetInnerHTML</code> inside the root layout's &lt;head&gt;.
                    </p>
                  </div>
                </section>

                {/* BODY START */}
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-6 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl">
                      <FileCode className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight">&lt;body&gt; Open Injection</h2>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Injected immediately after &lt;body&gt; opens — ideal for GTM noscript, chat widgets</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <span className="inline-block px-2.5 py-1 bg-zinc-900 text-orange-400 font-mono text-[10px] rounded-md shadow-inner">&lt;body&gt; ← here</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Immediately after body opens</span>
                    </div>
                    <textarea
                      name="bodyStartCode"
                      value={settings.bodyStartCode || ""}
                      onChange={handleChange}
                      rows={8}
                      placeholder={`<!-- Example: GTM noscript fallback -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n\n<!-- Example: Hotjar -->\n<script>...</script>`}
                      className="w-full p-6 bg-zinc-900 text-orange-300 font-mono text-[11px] border-none rounded-2xl focus:ring-2 ring-orange-500/20 outline-none resize-none shadow-inner leading-relaxed"
                    />
                  </div>
                </section>

                {/* BODY END */}
                <section className="bg-white dark:bg-[#232333] p-8 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] space-y-6 border border-zinc-50 dark:border-none">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                      <FileCode className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight">&lt;/body&gt; Close Injection</h2>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">Injected just before &lt;/body&gt; closes — ideal for deferred scripts, live chat</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <span className="inline-block px-2.5 py-1 bg-zinc-900 text-emerald-400 font-mono text-[10px] rounded-md shadow-inner">here → &lt;/body&gt;</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Just before body closes</span>
                    </div>
                    <textarea
                      name="bodyEndCode"
                      value={settings.bodyEndCode || ""}
                      onChange={handleChange}
                      rows={8}
                      placeholder={`<!-- Example: Intercom live chat -->\n<script>window.intercomSettings={api_base:"https://api-iam.intercom.io",app_id:"XXXXX"};</script>\n<script src="https://widget.intercom.io/widget/XXXXX" async></script>\n\n<!-- Example: Crisp chat -->\n<script>window.$crisp=[];window.CRISP_WEBSITE_ID="XXXX";</script>`}
                      className="w-full p-6 bg-zinc-900 text-emerald-300 font-mono text-[11px] border-none rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none resize-none shadow-inner leading-relaxed"
                    />
                  </div>
                </section>

                {/* Save reminder */}
                <div className="flex items-center justify-end gap-4 pt-2">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Changes are saved globally — click "Persist Configuration" above.</p>
                </div>
              </div>
            )}

          </main>
       </div>
    </div>
  );
}
