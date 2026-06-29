"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  X,
  Zap,
  Activity,
  Download,
  ListRestart,
  Braces,
  FileSpreadsheet,
  FileCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAMES = ["John Doe", "Jane Smith", "Alex Johnson", "Sarah Williams", "Michael Brown", "Emily Davis", "David Miller", "Chris Wilson", "Jessica Taylor", "Daniel Anderson"];
const EMAILS = ["@gmail.com", "@yahoo.com", "@outlook.com", "@company.io", "@startup.co"];
const COMPANIES = ["TechNova", "CloudScale", "DataFlow", "InnovaCore", "Zenith Solutions", "Stellar Systems"];
const ROLES = ["CEO", "Senior Developer", "UI Designer", "Product Manager", "Data Analyst", "Marketing Lead"];

export default function DummyDataClient() {
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<"json" | "csv" | "sql">("json");
  const [count, setCount] = useState(10);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateData();
  }, [format, count]);

  const generateData = () => {
    const data = Array.from({ length: count }).map((_, i) => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const email = name.toLowerCase().replace(" ", ".") + EMAILS[Math.floor(Math.random() * EMAILS.length)];
      return {
        id: i + 1,
        uuid: crypto.randomUUID(),
        name,
        email,
        company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
        role: ROLES[Math.floor(Math.random() * ROLES.length)],
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
      };
    });

    let result = "";
    if (format === "json") {
      result = JSON.stringify(data, null, 2);
    } else if (format === "csv") {
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(",")).join("\n");
      result = `${headers}\n${rows}`;
    } else if (format === "sql") {
      const table = "users";
      const columns = Object.keys(data[0]).join(", ");
      const values = data.map(obj => `(${Object.values(obj).map(v => typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v).join(", ")})`).join(",\n");
      result = `INSERT INTO ${table} (${columns})\nVALUES\n${values};`;
    }

    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Dataset copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `toollix-dummy-data.${format}`;
    link.click();
  };

  return (
    <ToolLayout 
      title="Data Architect" 
      description="Professional dummy data generator for developers. Instantly create high-fidelity datasets in JSON, CSV, or SQL for testing and prototyping."
      fullWidth
    >
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 space-y-6 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#c5a059]/10 text-[#c5a059] rounded-xl flex items-center justify-center shadow-sm">
                      <Terminal className="w-5 h-5" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 italic">Data Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" onClick={generateData} className="w-10 h-10 rounded-full hover:bg-[#c5a059]/10">
                      <ListRestart className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="icon" onClick={copyToClipboard} className="w-10 h-10 rounded-full hover:bg-[#c5a059]/10">
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </Button>
                </div>
              </div>

              <textarea
                className="w-full h-[250px] sm:h-[400px] bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 resize-none focus:outline-none font-mono text-[13px] text-zinc-800 dark:text-zinc-200 caret-[#c5a059]"
                placeholder="Generating dataset..."
                value={output}
                readOnly
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <Button 
                  onClick={copyToClipboard}
                  className="flex-1 h-14 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-[#c5a059] text-white hover:bg-[#b08d4a] text-[12px] font-black uppercase tracking-[0.3em] shadow-xl group transition-all"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  {copied ? "COPIED TO CLIPBOARD" : "COPY DATASET"}
                </Button>
                <Button 
                  onClick={downloadFile}
                  variant="outline"
                  className="flex-1 h-14 sm:h-20 rounded-2xl sm:rounded-[2rem] border-2 border-zinc-100 text-slate-900 dark:text-white hover:bg-zinc-50 text-[12px] font-black uppercase tracking-[0.3em] transition-all"
                >
                  <Download className="w-5 h-5 mr-3" />
                  DOWNLOAD .{format.toUpperCase()}
                </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="suite-card rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Generation Logic</h2>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Mock Parameters</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Export Format</label>
                     <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "json", label: "JSON", icon: Braces },
                          { id: "csv", label: "CSV", icon: FileSpreadsheet },
                          { id: "sql", label: "SQL", icon: FileCode },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFormat(f.id as any)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                              format === f.id ? "bg-[#c5a059]/5 border-[#c5a059]/30 text-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 text-slate-400"
                            )}
                          >
                             <f.icon className="w-4 h-4" />
                             <span className="text-[9px] font-black">{f.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Record Count</label>
                       <span className="text-[10px] font-black text-[#c5a059]">{count}</span>
                    </div>
                    <input 
                      type="range" min="1" max="100" value={count} 
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="w-full accent-[#c5a059]"
                    />
                  </div>
               </div>
            </div>

            <div className="suite-card p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#c5a059]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Prototyping Fuel</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider italic">
                  Save hours of manual data entry. Perfect for populating databases, testing API endpoints, or creating UI demos.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
