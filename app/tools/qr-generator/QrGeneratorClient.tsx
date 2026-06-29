"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { 
  QrCode, Download, Loader2, Image as ImageIcon, ShieldCheck, 
  Wifi, Mail, Phone, Link2, Sparkles, Lock, PlusCircle, Settings2, Smartphone
} from "lucide-react";
import { apiFetch } from "@/lib/fetcher";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QrGeneratorClient() {
  const { data: session } = useSession();
  const isPro = session?.user?.plan === "pro";

  const [qrType, setQrType] = useState<"text" | "wifi" | "email" | "phone" | "whatsapp" | "vcard">("text");
  const [text, setText] = useState("");
  
  // WiFi
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  
  // Email
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // Phone & WhatsApp
  const [phoneNumber, setPhoneNumber] = useState("");
  const [waMessage, setWaMessage] = useState("");

  // VCard
  const [vcard, setVcard] = useState({
    firstName: "",
    lastName: "",
    org: "",
    title: "",
    phone: "",
    email: "",
    url: ""
  });

  const [color, setColor] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [format, setFormat] = useState<"png" | "svg">("png");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo must be under 2MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrorCorrectionLevel("H");
      setFormat("png");
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleGenerate = async () => {
    setError(null);
    let payload = "";
    if (qrType === "text") {
      if (!text.trim()) return setError("Please enter a valid URL or text.");
      payload = text.trim();
    } else if (qrType === "wifi") {
      if (!wifiSsid.trim()) return setError("Wi-Fi Network Name (SSID) is required.");
      payload = `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
    } else if (qrType === "email") {
      if (!emailAddress.trim()) return setError("Email address is required.");
      payload = `MATMSG:TO:${emailAddress};SUB:${emailSubject};BODY:${emailBody};;`;
    } else if (qrType === "phone") {
      if (!phoneNumber.trim()) return setError("Phone number is required.");
      payload = `tel:${phoneNumber.trim()}`;
    } else if (qrType === "whatsapp") {
      if (!phoneNumber.trim()) return setError("Phone number is required.");
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      payload = `https://wa.me/${cleanPhone}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ""}`;
    } else if (qrType === "vcard") {
      if (!vcard.firstName.trim() && !vcard.lastName.trim()) return setError("Name is required.");
      payload = `BEGIN:VCARD\nVERSION:3.0\nN:${vcard.lastName};${vcard.firstName}\nFN:${vcard.firstName} ${vcard.lastName}\nORG:${vcard.org}\nTITLE:${vcard.title}\nTEL;TYPE=CELL:${vcard.phone}\nEMAIL;TYPE=PREF,INTERNET:${vcard.email}\nURL:${vcard.url}\nEND:VCARD`;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", payload);
      formData.append("color", color);
      formData.append("background", background);
      formData.append("margin", margin.toString());
      formData.append("errorCorrectionLevel", errorCorrectionLevel);
      formData.append("format", format);
      if (logoFile) formData.append("logo", logoFile);
      const res = await apiFetch("/api/tools/qr", { method: "POST", body: formData });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to generate QR Code");
      }
      const data = await res.json();
      setQrCodeData(data.dataUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeData) return;
    const a = document.createElement("a");
    a.href = qrCodeData;
    a.download = `qrcode-${qrType}-toollix.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const currentTabStyle = "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-black text-[8px] sm:text-[9px] uppercase tracking-widest sm:tracking-[0.2em] transition-all whitespace-nowrap min-w-fit";
  const activeTabStyle = "border-[#c5a059] text-[#c5a059] bg-[#c5a059]/5";
  const inactiveTabStyle = "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10";

  return (
    <ToolLayout 
      title="QR Code Generator" 
      description="Create custom QR codes for links, Wi-Fi, WhatsApp, and digital business cards. Personalize with your brand colors and logo."
      fullWidth={true}
    >
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Ambient Background Elements */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-[#c5a059]/5 rounded-full blur-[140px] pointer-events-none opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Preview Column (Primary on Mobile) */}
          <div className="lg:sticky lg:top-28 h-fit order-1 lg:order-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center gap-6 sm:gap-10 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col items-center text-center gap-2 mb-1 sm:mb-4">
                   <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic">Live Preview</h3>
                   <div className="w-10 h-0.5 bg-[#c5a059]/20 rounded-full" />
                </div>

                <div className="relative group w-full aspect-square max-w-[200px] sm:max-w-[280px]">
                   <div className="absolute -inset-8 bg-[#c5a059]/10 blur-[50px] rounded-full opacity-60 pointer-events-none" />
                   <div className="relative z-10 p-4 sm:p-6 bg-white dark:bg-zinc-800 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-700 aspect-square flex items-center justify-center">
                      {qrCodeData ? (
                        <img src={qrCodeData} alt="QR Code" className="w-full h-full rounded-lg animate-in zoom-in-90 duration-500" />
                      ) : (
                        <div className="flex flex-col items-center gap-3 opacity-20">
                           <QrCode className="w-12 h-12 sm:w-20 sm:h-20" />
                           <p className="text-[8px] font-black uppercase tracking-[0.2em] italic">Ready</p>
                        </div>
                      )}
                   </div>
                </div>

                {qrCodeData && (
                  <Button 
                    onClick={handleDownload}
                    className="w-full h-12 sm:h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl sm:rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98] transition-all"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="uppercase tracking-[0.2em] italic text-[10px] sm:text-sm">Save {format.toUpperCase()}</span>
                  </Button>
                )}
                
                <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02] pointer-events-none" />
            </div>
          </div>

          <div className="space-y-8 order-2 lg:order-1">
            {/* Configuration Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="flex overflow-x-auto bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 no-scrollbar snap-x snap-mandatory">
                <button onClick={() => setQrType("text")} className={cn(currentTabStyle, "snap-start", qrType === "text" ? activeTabStyle : inactiveTabStyle)}><Link2 className="w-3.5 h-3.5" /> Text</button>
                <button onClick={() => setQrType("wifi")} className={cn(currentTabStyle, "snap-start", qrType === "wifi" ? activeTabStyle : inactiveTabStyle)}><Wifi className="w-3.5 h-3.5" /> Wi-Fi</button>
                <button onClick={() => setQrType("whatsapp")} className={cn(currentTabStyle, "snap-start", qrType === "whatsapp" ? activeTabStyle : inactiveTabStyle)}><Smartphone className="w-3.5 h-3.5" /> WhatsApp</button>
                <button onClick={() => setQrType("vcard")} className={cn(currentTabStyle, "snap-start", qrType === "vcard" ? activeTabStyle : inactiveTabStyle)}><ImageIcon className="w-3.5 h-3.5" /> VCard</button>
                <button onClick={() => setQrType("email")} className={cn(currentTabStyle, "snap-start", qrType === "email" ? activeTabStyle : inactiveTabStyle)}><Mail className="w-3.5 h-3.5" /> Email</button>
                <button onClick={() => setQrType("phone")} className={cn(currentTabStyle, "snap-start", qrType === "phone" ? activeTabStyle : inactiveTabStyle)}><Phone className="w-3.5 h-3.5" /> Phone</button>
              </div>
              
              <div className="p-4 sm:p-12 space-y-6 sm:space-y-10">
                {qrType === "text" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Website URL or Text</Label>
                    <Input 
                        placeholder="https://google.com" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        className="h-12 sm:h-16 text-sm sm:text-lg font-black bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl sm:rounded-2xl shadow-inner-soft px-5 sm:px-8 focus:ring-4 focus:ring-[#c5a059]/10 transition-all placeholder:opacity-30" 
                    />
                  </div>
                )}
                
                {qrType === "wifi" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Network Name (SSID)</Label>
                        <Input placeholder="Home Wi-Fi" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 font-black" />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Password</Label>
                        <Input type="password" placeholder="••••••••" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6" />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Security</Label>
                        <select value={wifiEncryption} onChange={(e: any) => setWifiEncryption(e.target.value)} className="w-full h-14 px-6 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                            <option value="WPA">WPA/WPA2/WPA3</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                         <label className="flex items-center gap-4 h-14 px-6 bg-zinc-50 dark:bg-zinc-800 rounded-xl w-full cursor-pointer group">
                            <input type="checkbox" checked={wifiHidden} onChange={e => setWifiHidden(e.target.checked)} className="w-4 h-4 accent-[#c5a059]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Hidden Network</span>
                         </label>
                    </div>
                  </div>
                )}

                {qrType === "whatsapp" && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Phone Number</Label>
                        <Input placeholder="+1234567890" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 font-black" />
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Optional Message</Label>
                        <Textarea placeholder="Hello! I'm interested in..." value={waMessage} onChange={e => setWaMessage(e.target.value)} className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-6 min-h-[120px] resize-none" />
                    </div>
                  </div>
                )}

                {qrType === "vcard" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">First Name</Label>
                        <Input value={vcard.firstName} onChange={e => setVcard({...vcard, firstName: e.target.value})} className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Last Name</Label>
                        <Input value={vcard.lastName} onChange={e => setVcard({...vcard, lastName: e.target.value})} className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Organization</Label>
                        <Input value={vcard.org} onChange={e => setVcard({...vcard, org: e.target.value})} className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Job Title</Label>
                        <Input value={vcard.title} onChange={e => setVcard({...vcard, title: e.target.value})} className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Work Phone</Label>
                        <Input value={vcard.phone} onChange={e => setVcard({...vcard, phone: e.target.value})} className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-black" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Email</Label>
                        <Input value={vcard.email} onChange={e => setVcard({...vcard, email: e.target.value})} className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 font-black" />
                    </div>
                  </div>
                )}

                {qrType === "email" && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Recipient Email</Label>
                            <Input value={emailAddress} onChange={e => setEmailAddress(e.target.value)} className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 font-black" />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Subject</Label>
                            <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="h-14 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 font-black" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Message Body</Label>
                        <Textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-6 min-h-[140px] resize-none" />
                    </div>
                </div>
                )}

                {qrType === "phone" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Phone Number</Label>
                    <Input type="tel" placeholder="+123456789" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-14 sm:h-16 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-6 sm:px-8 font-black text-lg sm:text-xl" />
                  </div>
                )}

                {/* Styling Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">QR Color</Label>
                    <div className="flex gap-4 items-center h-14 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer border-none" />
                        </div>
                        <Input value={color} onChange={(e) => setColor(e.target.value)} className="uppercase font-mono text-xs bg-transparent border-none h-8 font-black tracking-widest outline-none ring-0 w-24" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-2 italic">Background</Label>
                    <div className="flex gap-4 items-center h-14 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            <Input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer border-none" />
                        </div>
                        <Input value={background} onChange={(e) => setBackground(e.target.value)} className="uppercase font-mono text-xs bg-transparent border-none h-8 font-black tracking-widest outline-none ring-0 w-24" />
                    </div>
                  </div>
                </div>

                <Button 
                    onClick={handleGenerate} 
                    disabled={loading}
                    className="w-full h-14 sm:h-20 bg-[#c5a059] text-white rounded-xl sm:rounded-[1.5rem] font-black text-sm sm:text-lg shadow-[0_20px_50px_-10px_rgba(197,160,89,0.4)] transition-all active:scale-[0.98] group relative overflow-hidden border-none"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4">
                        {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <QrCode className="w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform duration-500" />}
                        <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] italic text-[10px] sm:text-lg">Generate QR Code</span>
                    </div>
                </Button>
              </div>
            </div>

            {/* Advanced Settings Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3">
                     <Settings2 className="w-4 h-4 text-[#c5a059]" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Advanced Settings</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between px-1">
                       <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">Quiet Zone</Label>
                       <span className="text-xs font-black text-[#c5a059]">{margin}px</span>
                    </div>
                    <input type="range" min="0" max="10" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full accent-[#c5a059] h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="flex gap-2">
                     {["png", "svg"].map(f => (
                       <button key={f} onClick={() => { if(isPro || f === 'png') setFormat(f as any) }} className={cn("flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", format === f ? "bg-[#c5a059] text-white" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400")}>
                          {f.toUpperCase()} {!isPro && f === 'svg' && <Lock className="w-2.5 h-2.5 inline ml-1" />}
                       </button>
                     ))}
                  </div>
               </div>

               <div className={cn("bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl", !isPro && "opacity-80")}>
                  {!isPro && (
                     <div className="absolute inset-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                        <Link href="/pricing" className="w-full">
                           <Button size="sm" className="w-full bg-[#c5a059] text-white font-black text-[9px] tracking-widest rounded-xl h-10">UPGRADE FOR LOGO</Button>
                        </Link>
                     </div>
                  )}
                  <div className="relative z-10 flex flex-col h-full space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <ImageIcon className="w-4 h-4 text-[#c5a059]" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Logo Overlay</span>
                        </div>
                        {isPro && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                     </div>
                     {!logoPreview ? (
                        <label className="flex-1 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#c5a059]/40 transition-colors py-4">
                           <PlusCircle className="w-6 h-6 text-[#c5a059] mb-2" />
                           <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Add Logo</span>
                           <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={!isPro} />
                        </label>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                           <img src={logoPreview} className="w-12 h-12 object-contain rounded-lg shadow-lg bg-white p-1" />
                           <button onClick={handleRemoveLogo} className="text-[8px] font-black text-red-500 uppercase tracking-widest">Remove</button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
    </ToolLayout>
  );
}
