"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Phone, 
  Globe, 
  CheckCircle2, 
  Copy, 
  QrCode as QrIcon, 
  Link as LinkIcon,
  Zap,
  Smartphone,
  Share2,
  ShieldCheck,
  Target,
  Printer,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "1", name: "United States", flag: "🇺🇸" },
  { code: "44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "91", name: "India", flag: "🇮🇳" },
  { code: "971", name: "UAE", flag: "🇦🇪" },
  { code: "61", name: "Australia", flag: "🇦🇺" },
  { code: "49", name: "Germany", flag: "🇩🇪" },
  { code: "33", name: "France", flag: "🇫🇷" },
  { code: "81", name: "Japan", flag: "🇯🇵" },
  { code: "86", name: "China", flag: "🇨🇳" },
  { code: "71", name: "Russia", flag: "🇷🇺" },
  { code: "55", name: "Brazil", flag: "🇧🇷" },
  { code: "27", name: "South Africa", flag: "🇿🇦" },
  { code: "34", name: "Spain", flag: "🇪🇸" },
  { code: "39", name: "Italy", flag: "🇮🇹" },
  { code: "65", name: "Singapore", flag: "🇸🇬" },
  { code: "60", name: "Malaysia", flag: "🇲🇾" },
  { code: "92", name: "Pakistan", flag: "🇵🇰" },
  { code: "880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "62", name: "Indonesia", flag: "🇮🇩" },
  { code: "63", name: "Philippines", flag: "🇵🇭" },
  { code: "66", name: "Thailand", flag: "🇹🇭" },
  { code: "84", name: "Vietnam", flag: "🇻🇳" },
  { code: "90", name: "Turkey", flag: "🇹🇷" },
  { code: "20", name: "Egypt", flag: "🇪🇬" },
  { code: "234", name: "Nigeria", flag: "🇳🇬" },
  { code: "52", name: "Mexico", flag: "🇲🇽" },
  { code: "54", name: "Argentina", flag: "🇦🇷" },
];

export default function WhatsAppClient() {
  const [countryCode, setCountryCode] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const fullNumber = `${countryCode}${cleanNumber}`;
  const isValid = cleanNumber.length >= 7;
  
  const waLink = isValid 
    ? `https://wa.me/${fullNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}` 
    : "";

  useEffect(() => {
    if (isValid) {
      QRCode.toDataURL(waLink, {
        width: 800,
        margin: 4,
        color: {
          dark: "#075E54",
          light: "#ffffff",
        },
      })
      .then(url => setQrUrl(url))
      .catch(err => console.error(err));
    } else {
      setQrUrl("");
    }
  }, [waLink, isValid]);

  const handleCopyLink = () => {
    if (!waLink) return;
    navigator.clipboard.writeText(waLink);
    setCopied(true);
    toast.success("Direct link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `whatsapp-qr-${fullNumber}.png`;
    link.click();
    toast.success("High-res QR Code exported");
  };

  const handleWhatsApp = () => {
    if (!isValid) return;
    window.open(waLink, "_blank");
    toast.success("Redirecting to WhatsApp...");
  };

  return (
    <ToolLayout 
      title="WhatsApp Direct" 
      description="Professional communication bridge. Generate instant direct-chat links and high-fidelity QR codes without saving contacts."
      fullWidth={true}
    >
      <div className="w-full max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-7 space-y-8">
            <div className="suite-card rounded-[2.5rem] p-8 sm:p-12 space-y-10 relative overflow-hidden bg-white/50 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Direct Connection</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Phase 01: Identification</p>
              </div>

              <div className="space-y-10">
                {/* Phone Input Group */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Recipient Phone Number</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group w-full sm:w-[160px]">
                      <select 
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full h-16 sm:h-20 pl-14 pr-4 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl font-black text-[12px] uppercase tracking-widest appearance-none cursor-pointer focus:border-emerald-500 transition-all outline-none shadow-xl"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={`${c.name}-${c.code}`} value={c.code}>
                            +{c.code} {c.flag}
                          </option>
                        ))}
                      </select>
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="flex-1 relative">
                      <Input 
                        type="tel"
                        placeholder="555 0123 456"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-16 sm:h-20 px-8 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl font-black text-2xl text-emerald-600 focus-visible:ring-0 focus-visible:border-emerald-500 transition-all shadow-xl placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                      />
                      {isValid && (
                        <CheckCircle2 className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500 animate-in zoom-in duration-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Input Group */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 italic">Pre-written Message</label>
                  <div className="relative">
                    <Textarea 
                      placeholder="Enter the message you want to send automatically..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[180px] p-8 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] font-medium text-lg focus-visible:ring-0 focus-visible:border-emerald-500 transition-all resize-none shadow-xl placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
                    />
                    <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-30">
                       <Sparkles className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Draft System Active</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <Button 
                    disabled={!isValid}
                    onClick={handleWhatsApp}
                    className="h-20 sm:h-24 rounded-[2rem] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg group shadow-2xl shadow-emerald-500/20 border-none transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <MessageSquare className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform" />
                    SEND ON WHATSAPP
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={!isValid}
                    onClick={() => window.location.href = `tel:${fullNumber}`}
                    className="h-20 sm:h-24 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-black text-lg group transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Phone className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform text-emerald-500" />
                    QUICK DIAL
                  </Button>
                </div>
              </div>
            </div>

            {/* Link Preview Bar */}
            {isValid && (
              <div className="suite-card rounded-[2rem] p-6 bg-white/80 dark:bg-zinc-900/80 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-700">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic mb-1">Direct Link URI</p>
                  <code className="block truncate font-mono text-xs font-bold text-emerald-600/80">{waLink}</code>
                </div>
                <Button 
                  onClick={handleCopyLink}
                  className={cn(
                    "h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0",
                    copied ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-emerald-500 hover:text-white"
                  )}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "COPIED" : "COPY"}
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel: Assets & Preview */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            
            {/* QR Asset Section */}
            <div className="suite-card rounded-[2.5rem] p-10 space-y-8 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
              
              <div className="flex justify-between items-center relative z-10">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Scan to Chat</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Asset Generation</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border-2 transition-all",
                  isValid ? "bg-emerald-50 text-emerald-500 border-emerald-100 animate-pulse" : "bg-zinc-50 text-zinc-300 border-zinc-100"
                )}>
                  {isValid ? "Active Vector" : "Idle State"}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
                <div className={cn(
                  "p-6 bg-white dark:bg-zinc-950 rounded-[3rem] shadow-2xl border-2 transition-all duration-700",
                  isValid ? "border-emerald-500/20 scale-100" : "border-zinc-100 dark:border-zinc-800 scale-95 opacity-20 grayscale"
                )}>
                   {qrUrl ? (
                     <img src={qrUrl} alt="WhatsApp QR" className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl" />
                   ) : (
                     <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                        <QrIcon className="w-20 h-20 text-zinc-100 dark:text-zinc-800" />
                     </div>
                   )}
                </div>

                <Button 
                  disabled={!isValid}
                  onClick={handleDownloadQR}
                  className="w-full h-16 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-xl group"
                >
                  <Printer className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                  Download Print Asset
                </Button>
              </div>
            </div>

            {/* Lifestyle Preview Mockup */}
            <div className="suite-card rounded-[2.5rem] p-8 bg-[#e5ddd5] dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative min-h-[300px]">
               {/* WhatsApp Wallpaper Pattern */}
               <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-[length:400px]" />
               
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Live Message Preview</p>
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     {/* Chat Bubble Incoming (Mock) */}
                     <div className="flex justify-start">
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                           <p className="text-xs text-zinc-600 dark:text-zinc-400">Hey! How can I contact you on WhatsApp?</p>
                           <p className="text-[8px] text-zinc-400 text-right mt-1">10:42 AM</p>
                        </div>
                     </div>

                     {/* Chat Bubble Outgoing (Live) */}
                     <div className={cn(
                       "flex justify-end transition-all duration-500",
                       isValid ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                     )}>
                        <div className="bg-[#dcf8c6] dark:bg-emerald-900/40 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] border border-emerald-500/10">
                           <p className="text-xs text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">
                              {message || "No message provided..."}
                           </p>
                           <div className="flex items-center justify-end gap-1 mt-1">
                              <p className="text-[8px] text-emerald-600/60 dark:text-emerald-400/60 font-bold">SENT</p>
                              <CheckCircle2 className="w-2 h-2 text-emerald-500" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {!isValid && (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] transition-all">
                    <Smartphone className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Link Generator Idle</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           {[
             { icon: ShieldCheck, title: "Zero Contact", desc: "No need to save numbers to your address book. Keep your directory clean." },
             { icon: Zap, title: "Instant Bridge", desc: "Our high-speed routing protocol initializes chats in less than 200ms." },
             { icon: Target, title: "Universal", desc: "Works across iOS, Android, and Web with native app handshaking." }
           ].map((feature, i) => (
             <div key={i} className="suite-card p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 flex items-start gap-6 group hover:border-emerald-500/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                   <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">{feature.title}</h4>
                   <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">{feature.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </ToolLayout>
  );
}
