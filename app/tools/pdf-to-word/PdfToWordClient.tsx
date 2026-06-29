"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  Download,
  RotateCcw,
  Upload,
  Check
} from "lucide-react";
import { validateUpload, getLimitsForSession } from "@/lib/upload-limits";

export function PdfToWordClient() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<string>('');

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const limits = getLimitsForSession(session);
    const validation = validateUpload([selected], session, false);
    
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setError(null);
    setFile(selected);
    
    // Auto-start conversion
    startConversion(selected);
  };

  const startConversion = async (selectedFile: File) => {
    setStep(2);
    setProcessingState('Extracting text and layout...');
    
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      
      const res = await fetch('/api/pdf-to-word', {
        method: 'POST',
        body: fd
      });
      
      if (!res.ok) {
        let errStr = "Conversion failed";
        try {
          const errData = await res.clone().json();
          errStr = errData.error || errStr;
        } catch {
          errStr = await res.text();
        }
        throw new Error(errStr);
      }
      
      setProcessingState('Finalizing Document...');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStep(3);
    } catch (err: any) {
      console.error("Conversion Error:", err);
      setError(err.message || "Failed to convert PDF to Word.");
      setStep(1);
      setFile(null);
    }
  };

  const clearAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setStep(1);
    setError(null);
    setDownloadUrl(null);
  };

  return (
    <ToolLayout 
      title="PDF to Word" 
      description="Convert your PDF documents into editable Word files instantly."
    >
      <div className="max-w-4xl mx-auto space-y-6 px-4 md:px-0 w-full overflow-x-hidden pb-12">
        
        {/* Steps Progress */}
        <div className="flex flex-wrap items-center justify-center gap-y-4 mb-8 w-full">
            {[
                { num: 1, label: "Upload" },
                { num: 2, label: "Processing" },
                { num: 3, label: "Download" },
            ].map((s, i, arr) => (
                <div key={s.num} className="flex items-center">
                    <div className={cn(
                        "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition-colors shrink-0",
                        step >= s.num ? "bg-[#c5a059] text-white" : "bg-zinc-100 text-muted-foreground dark:bg-zinc-800"
                    )}>
                        {step > s.num ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : s.num}
                    </div>
                    <span className={cn(
                        "ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-medium whitespace-nowrap",
                        step >= s.num ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {s.label}
                    </span>
                    {i < arr.length - 1 && (
                        <div className={cn(
                            "w-4 sm:w-16 h-[2px] sm:h-1 mx-1.5 sm:mx-4 rounded-full transition-colors shrink-0",
                            step > s.num ? "bg-[#c5a059]" : "bg-zinc-100 dark:bg-zinc-800"
                        )} />
                    )}
                </div>
            ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <Card className="p-6 sm:p-12 border-dashed border-2 flex flex-col items-center justify-center relative group overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors min-h-[300px]">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="application/pdf" onChange={handleFileChange} />
            <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Upload PDF</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
                Drag and drop your PDF file here or click to browse.
            </p>
            {error && (
              <div className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg text-center max-w-md w-full relative z-20">
                {error}
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <Card className="p-8 sm:p-12">
             <div className="flex flex-col items-center text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
                 <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#c5a059]" />
                 </div>
                 <div className="space-y-2">
                     <h3 className="text-lg font-bold">{processingState}</h3>
                     <p className="text-sm text-muted-foreground">Please wait while we convert your document.</p>
                 </div>
             </div>
          </Card>
        )}

        {/* Step 3: Result & Download */}
        {step === 3 && downloadUrl && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-8 sm:p-12 text-center space-y-8 bg-zinc-50/50 dark:bg-zinc-900/50">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                       <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                       <h3 className="text-2xl sm:text-3xl font-bold">Conversion Complete!</h3>
                       <p className="text-sm text-muted-foreground">
                          Your Word document is ready to download.
                       </p>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                       <Button variant="outline" onClick={clearAll} className="w-full sm:w-auto h-12">
                           <RotateCcw className="w-4 h-4 mr-2" /> Convert Another
                       </Button>
                       <a href={downloadUrl} download={`${file?.name.replace(/\.pdf$/i, '') || 'converted'}.docx`} className="w-full sm:w-auto">
                           <Button className="w-full sm:w-auto bg-[#c5a059] hover:bg-[#b08d4b] text-white px-8 h-12 text-base shadow-lg shadow-[#c5a059]/20">
                               <Download className="w-5 h-5 mr-2" /> Download DOCX
                           </Button>
                       </a>
                   </div>
                </Card>
            </div>
        )}

      </div>
    </ToolLayout>
  );
}
