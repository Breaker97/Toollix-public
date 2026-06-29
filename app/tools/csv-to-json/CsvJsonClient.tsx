"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Table, 
  Share2, 
  ShieldCheck, 
  Zap,
  Database,
  Save,
  Code,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Mode = "csv-to-json" | "json-to-csv";

export default function CsvJsonClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [delimiter, setDelimiter] = useState(",");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    handleProcess();
  }, [input, mode, delimiter]);

  const handleProcess = () => {
    setError(null);
    try {
      if (mode === "csv-to-json") {
        setOutput(JSON.stringify(csvToJson(input, delimiter), null, 2));
      } else {
        setOutput(jsonToCsv(input, delimiter));
      }
    } catch (err: any) {
      setError(err.message || "Conversion failed. Please check your format.");
      setOutput("");
    }
  };

  const csvToJson = (csv: string, delim: string) => {
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return [];
    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === delim && !inQuotes) { result.push(current.trim()); current = ""; }
        else { current += char; }
      }
      result.push(current.trim());
      return result;
    };
    const headers = parseLine(lines[0]);
    return lines.slice(1).map(line => {
      const values = parseLine(line);
      const obj: any = {};
      headers.forEach((header, index) => { obj[header] = values[index] !== undefined ? values[index] : ""; });
      return obj;
    });
  };

  const jsonToCsv = (jsonStr: string, delim: string) => {
    let arr;
    try { arr = JSON.parse(jsonStr); } catch { throw new Error("Invalid JSON input."); }
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("JSON must be an array of objects.");
    const headers = Object.keys(arr[0]);
    const csvLines = [headers.join(delim)];
    arr.forEach(obj => {
      const line = headers.map(header => {
        let val = obj[header] === undefined || obj[header] === null ? "" : String(obj[header]);
        if (val.includes(delim) || val.includes('"') || val.includes("\n")) val = `"${val.replace(/"/g, '""')}"`;
        return val;
      });
      csvLines.push(line.join(delim));
    });
    return csvLines.join("\n");
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Result copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!output) return;
    const blob = new Blob([output], { type: mode === "csv-to-json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "csv-to-json" ? "toollix-converted.json" : "toollix-converted.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File exported successfully!");
  };

  return (
    <ToolLayout 
      title="CSV to JSON Converter" 
      description="Easily convert CSV data to JSON or JSON to CSV. A simple, fast, and private tool that works directly in your browser."
      fullWidth={true}
    >
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[360px_1fr] lg:gap-10 items-start w-full overflow-x-hidden pb-12">
        
        {/* LEFT COLUMN: Controls */}
        <div className="w-full lg:sticky lg:top-28 space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            
            {/* Phase 01: Settings */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-8 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Settings</span>
                    <p className="text-[11px] font-black text-[#c5a059] uppercase tracking-widest italic mt-1">Converter Mode</p>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="flex bg-zinc-50 dark:bg-zinc-800/80 p-1.5 rounded-[1.5rem] shadow-inner-soft border border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => { setMode("csv-to-json"); setInput(""); setOutput(""); }}
                      className={cn(
                        "flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                        mode === "csv-to-json" ? "bg-[#c5a059] text-white shadow-lg scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                      )}
                    >CSV → JSON</button>
                    <button
                      onClick={() => { setMode("json-to-csv"); setInput(""); setOutput(""); }}
                      className={cn(
                        "flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                        mode === "json-to-csv" ? "bg-[#c5a059] text-white shadow-lg scale-[1.02]" : "text-muted-foreground/40 hover:text-[#c5a059]"
                      )}
                    >JSON → CSV</button>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-4 italic">Delimiter Matrix</label>
                     <div className="h-14 px-6 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl shadow-inner-soft flex items-center border border-zinc-100 dark:border-zinc-800 transition-all focus-within:border-[#c5a059]/30">
                        <Database className="w-4 h-4 text-[#c5a059]/30 mr-4" />
                        <select
                          value={delimiter}
                          onChange={(e) => setDelimiter(e.target.value)}
                          className="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer text-[#c5a059]"
                        >
                          <option value=",">Comma (,)</option>
                          <option value=";">Semicolon (;)</option>
                          <option value={"\t"}>Tab (⇥)</option>
                          <option value="|">Pipe (|)</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>

            {/* Support Info: Ecosystem */}
            <div className="bg-gradient-to-br from-[#c5a059]/10 to-white dark:from-[#c5a059]/5 dark:to-zinc-900 p-8 shadow-lg rounded-[2rem] sm:rounded-[2.5rem] space-y-6 relative overflow-hidden group border border-[#c5a059]/20">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-[#c5a059]/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                     <Share2 className="w-6 h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic leading-none">Matrix Registry</h4>
                    <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-1">Status: Operational</p>
                  </div>
               </div>

                <div className="space-y-3 relative z-10">
                  {[
                    { icon: Code, label: "JSON Array", detail: "Standard" },
                    { icon: Table, label: "CSV Flatfile", detail: "Universal" },
                    { icon: ShieldCheck, label: "Schema Verify", detail: "Enabled" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-[#c5a059]/10 group/item hover:bg-[#c5a059]/5 transition-all">
                       <div className="flex items-center gap-4">
                          <item.icon className="w-4 h-4 text-[#c5a059] opacity-40 group-hover/item:opacity-100" />
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">{item.label}</span>
                       </div>
                       <span className="text-[9px] font-black text-[#c5a059] uppercase italic opacity-40">{item.detail}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Studio Workspace */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] min-h-[500px] lg:min-h-[600px] p-6 sm:p-8 lg:p-10 flex flex-col relative shadow-xl overflow-hidden">
               
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex flex-col gap-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none">Visual Monitor</span>
                    <p className="text-lg font-black uppercase tracking-widest italic text-[#c5a059] opacity-80">Spectrum Feed</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-[#c5a059]/10 text-[#c5a059] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" /> Live Stream
                     </div>
                     <div className="flex items-center gap-2">
                          <Button 
                           size="icon" 
                           variant="ghost" 
                           onClick={downloadFile} 
                           disabled={!output} 
                           className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-[#c5a059]/10 hover:text-[#c5a059] transition-all border border-zinc-100 dark:border-zinc-700 shadow-sm"
                         >
                           <Save className="w-4 h-4" />
                         </Button>
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           onClick={copyToClipboard} 
                           disabled={!output} 
                           className={cn("w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 transition-all border border-zinc-100 dark:border-zinc-700 shadow-sm", copied ? "bg-emerald-50 text-emerald-600" : "hover:bg-[#c5a059]/10 hover:text-[#c5a059]")}
                         >
                           {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                         </Button>
                     </div>
                  </div>
               </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Input Studio */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-4 italic">Inbound Vector</label>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] p-1 border border-zinc-100 dark:border-zinc-800 shadow-inner-soft relative overflow-hidden group/input">
                        <div className="absolute top-4 left-6 flex gap-1.5 z-20">
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                           <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-zinc-400/40 uppercase tracking-widest">{mode === 'csv-to-json' ? 'data.csv' : 'data.json'}</span>
                        </div>
                        <textarea
                          className="w-full h-[400px] lg:h-[450px] p-8 pt-12 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 caret-[#c5a059] placeholder:text-zinc-300"
                          placeholder={mode === "csv-to-json" ? "Name,Age,City\nAlice,30,Dubai\nBob,25,London" : '[\n  { "Name": "Alice", "Age": 30 }\n]'}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] italic">Generated Manifest</label>
                       {output && (
                          <span className="text-[10px] font-mono font-black text-[#c5a059]/40">{output.split('\n').length} Vectors</span>
                       )}
                    </div>
                    <div className={cn(
                       "bg-[#c5a059]/5 dark:bg-[#c5a059]/10 rounded-[2rem] p-1 border shadow-inner-soft relative overflow-hidden transition-all duration-700",
                       error ? "border-red-500/20" : "border-[#c5a059]/20"
                    )}>
                        <div className="absolute top-4 right-8 z-20">
                           <span className="text-[9px] font-mono font-black text-[#c5a059]/40 uppercase tracking-widest">{mode === 'csv-to-json' ? 'output.json' : 'output.csv'}</span>
                        </div>
                        <textarea
                          readOnly
                          className={cn(
                            "w-full h-[400px] lg:h-[450px] p-8 pt-12 bg-transparent resize-none focus:outline-none font-mono text-[13px] leading-relaxed",
                            error ? "text-red-500/70" : "text-[#c5a059]"
                          )}
                          placeholder="Manifest will manifest here..."
                          value={error ? `PROTOCOL_ERROR:\n\n${error}` : output}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
                    </div>
                  </div>
               </div>

               {/* Footer Branding Overlay */}
               <div className="absolute bottom-12 right-12 flex items-center gap-4 hidden sm:flex">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none mb-1">Session Protocol</p>
                        <p className="text-[10px] font-mono font-black text-[#c5a059] uppercase leading-none">{Math.random().toString(36).substring(7)}</p>
                    </div>
                    <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                    <Zap className="w-5 h-5 text-[#c5a059]" />
               </div>
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        .shadow-inner-soft {
           box-shadow: inset 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </ToolLayout>
  );
}
