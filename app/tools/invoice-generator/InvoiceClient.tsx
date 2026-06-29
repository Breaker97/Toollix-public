"use client";

import { useState, useMemo, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Download, 
  User, 
  Building2, 
  Settings2, 
  Activity,
  FileText,
  DollarSign,
  Percent,
  Coins,
  Palette,
  Image as ImageIcon,
  FileDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const CURRENCIES = [
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "₹", code: "INR", name: "Indian Rupee" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  { symbol: "AED", code: "AED", name: "UAE Dirham" },
  { symbol: "SAR", code: "SAR", name: "Saudi Riyal" },
];

const TEMPLATES = [
  { id: "modern", name: "Modern Gold", color: "#c5a059" },
  { id: "minimal", name: "Minimal Slate", color: "#334155" },
  { id: "classic", name: "Classic Navy", color: "#1e1b4b" },
  { id: "vibrant", name: "Vibrant Indigo", color: "#4f46e5" },
];

export default function InvoiceClient() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-001`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Standard Service", quantity: 1, rate: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  }, [items]);

  const discountAmount = (subtotal * discountRate) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleExport = async () => {
    if (!invoiceRef.current) return;
    
    if (exportFormat === "pdf") {
      generatePDF();
    } else {
      generateImage();
    }
  };

  const generateImage = async () => {
    if (!invoiceRef.current) return;
    toast.info("Generating high-resolution image...");
    
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNumber}.png`;
    link.click();
    toast.success("Invoice Image saved!");
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const primaryColor = template.color;
    
    // Header background (optional based on template)
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("INVOICE", 150, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(companyName || "Your Company", 20, 55);
    
    doc.setFont("helvetica", "bold");
    doc.text("To:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(clientName || "Client Name", 20, 75);
    
    doc.setFont("helvetica", "bold");
    doc.text("Invoice #:", 140, 50);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceNumber, 170, 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 140, 55);
    doc.setFont("helvetica", "normal");
    doc.text(date, 170, 55);

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 90, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 95);
    doc.text("Qty", 120, 95);
    doc.text("Rate", 145, 95);
    doc.text("Amount", 175, 95);

    // Items
    let y = 105;
    doc.setFont("helvetica", "normal");
    items.forEach(item => {
      doc.text(item.description || "No description", 25, y);
      doc.text(item.quantity.toString(), 120, y);
      doc.text(`${currency.symbol}${item.rate.toFixed(2)}`, 145, y);
      doc.text(`${currency.symbol}${(item.quantity * item.rate).toFixed(2)}`, 175, y);
      y += 8;
    });

    // Totals
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(130, y, 190, y);
    y += 10;
    doc.text("Subtotal:", 140, y);
    doc.text(`${currency.symbol}${subtotal.toFixed(2)}`, 175, y);
    
    if (discountRate > 0) {
      y += 8;
      doc.text(`Discount (${discountRate}%):`, 140, y);
      doc.text(`-${currency.symbol}${discountAmount.toFixed(2)}`, 175, y);
    }
    
    y += 8;
    doc.text(`VAT/Tax (${taxRate}%):`, 140, y);
    doc.text(`${currency.symbol}${taxAmount.toFixed(2)}`, 175, y);
    
    y += 10;
    doc.setFillColor(primaryColor);
    doc.rect(130, y - 6, 65, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", 140, y);
    doc.text(`${currency.symbol}${total.toFixed(2)}`, 175, y);

    doc.save(`${invoiceNumber}.pdf`);
    toast.success("Invoice PDF generated!");
  };

  return (
    <ToolLayout 
      title="Invoice Architect" 
      description="Professional multi-currency billing engine with VAT support, discounts, and high-fidelity design templates."
      fullWidth
    >
      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Invoice Canvas */}
          <div className="lg:col-span-8 space-y-8">
            <div 
              ref={invoiceRef}
              className="suite-card rounded-[3.5rem] p-8 sm:p-16 space-y-12 overflow-hidden relative bg-white dark:bg-zinc-950 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-2 border-zinc-50 dark:border-zinc-900"
            >
              {/* Header Design Accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-4 transition-colors duration-500" 
                style={{ backgroundColor: template.color }}
              />
              
              <div className="flex flex-col md:flex-row justify-between gap-12 border-b border-zinc-100 dark:border-zinc-900 pb-12">
                 <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3 text-slate-400">
                       <Building2 className="w-5 h-5" style={{ color: template.color }} />
                       <span className="text-[11px] font-black uppercase tracking-[0.3em]">Origin Signal</span>
                    </div>
                    <input 
                       className="text-4xl font-black bg-transparent w-full focus:outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 tracking-tighter uppercase italic"
                       placeholder="YOUR STUDIO NAME"
                       value={companyName}
                       onChange={(e) => setCompanyName(e.target.value)}
                    />
                 </div>
                 <div className="text-right space-y-3">
                    <h2 className="text-6xl font-black text-slate-900 dark:text-white opacity-5 uppercase tracking-tighter leading-none">INVOICE</h2>
                    <div className="flex items-center justify-end gap-3">
                       <span className="text-[11px] font-black text-slate-400">ID://</span>
                       <input 
                         className="text-lg font-black bg-transparent text-right focus:outline-none w-40 text-[#c5a059] tracking-tight"
                         value={invoiceNumber}
                         onChange={(e) => setInvoiceNumber(e.target.value)}
                       />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manifested</span>
                       <input 
                          type="date"
                          className="text-sm font-bold text-zinc-900 dark:text-white bg-transparent text-right focus:outline-none cursor-pointer"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              {/* Client Info */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-slate-400">
                    <User className="w-5 h-5" style={{ color: template.color }} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Destination Identity</span>
                 </div>
                 <textarea 
                    className="text-xl font-bold bg-transparent w-full focus:outline-none placeholder:text-zinc-100 dark:placeholder:text-zinc-900 resize-none h-20 leading-relaxed italic"
                    placeholder="CLIENT NAME / TRANSMISSION ADDRESS"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                 />
              </div>

              {/* Line Items */}
              <div className="space-y-8">
                 <div className="grid grid-cols-12 gap-6 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-50 dark:border-zinc-900 pb-6 italic">
                    <div className="col-span-6">Operation Details</div>
                    <div className="col-span-2 text-center">Unit</div>
                    <div className="col-span-2 text-center">Rate ({currency.code})</div>
                    <div className="col-span-2 text-right">Magnitude</div>
                 </div>

                 <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-6 items-center group animate-in slide-in-from-left-4 duration-300">
                         <div className="col-span-6 flex items-center gap-4">
                            <button 
                               onClick={() => removeItem(item.id)}
                               className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                            <input 
                               className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 text-sm font-bold focus:outline-none border-2 border-transparent focus:border-[#c5a059] transition-all shadow-inner"
                               placeholder="Signal/Service Description"
                               value={item.description}
                               onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            />
                         </div>
                         <div className="col-span-2">
                            <input 
                               type="number"
                               className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 text-sm font-bold text-center focus:outline-none border-2 border-transparent focus:border-[#c5a059] transition-all shadow-inner"
                               value={item.quantity}
                               onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            />
                         </div>
                         <div className="col-span-2">
                            <input 
                               type="number"
                               className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 text-sm font-bold text-center focus:outline-none border-2 border-transparent focus:border-[#c5a059] transition-all shadow-inner"
                               value={item.rate}
                               onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                            />
                         </div>
                         <div className="col-span-2 text-right text-base font-black text-slate-900 dark:text-white tracking-tight">
                            {currency.symbol}{(item.quantity * item.rate).toLocaleString()}
                         </div>
                      </div>
                    ))}
                 </div>

                 <Button 
                    variant="ghost" 
                    onClick={addItem}
                    className="w-full h-16 rounded-[1.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-all group"
                 >
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                    New Line Item
                 </Button>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start pt-12 border-t border-zinc-100 dark:border-zinc-900 gap-12">
                 <div className="flex-1 space-y-4">
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-relaxed">
                       This signal is generated in a secure environment. <br/>
                       Final magnitude includes all adjusted taxes and discounts.
                    </p>
                 </div>
                 <div className="w-full sm:w-80 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-zinc-400 font-black uppercase tracking-widest italic">Subtotal</span>
                       <span className="font-black text-slate-900 dark:text-white text-lg">{currency.symbol}{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-black uppercase tracking-widest italic">Discount</span>
                          <div className="relative">
                             <input 
                               type="number" 
                               className="w-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-2 text-[11px] font-black text-center focus:outline-none border border-transparent focus:border-[#c5a059] shadow-inner"
                               value={discountRate}
                               onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                             />
                             <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#c5a059]">%</span>
                          </div>
                       </div>
                       <span className="font-black text-red-500">-{currency.symbol}{discountAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-black uppercase tracking-widest italic">VAT / Tax</span>
                          <div className="relative">
                             <input 
                               type="number" 
                               className="w-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-2 text-[11px] font-black text-center focus:outline-none border border-transparent focus:border-[#c5a059] shadow-inner"
                               value={taxRate}
                               onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                             />
                             <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#c5a059]">%</span>
                          </div>
                       </div>
                       <span className="font-black text-slate-900 dark:text-white">+{currency.symbol}{taxAmount.toLocaleString()}</span>
                    </div>

                    <div 
                      className="flex justify-between p-6 rounded-3xl mt-4 transition-colors duration-500 shadow-xl"
                      style={{ backgroundColor: template.color }}
                    >
                       <span className="text-lg font-black text-white uppercase tracking-tighter italic">Total</span>
                       <span className="text-2xl font-black text-white tracking-tight">{currency.symbol}{total.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Configuration Column */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            {/* Format & Template Selection */}
            <div className="suite-card rounded-[3.5rem] p-10 space-y-10 bg-white dark:bg-zinc-900 border-2 border-zinc-50 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
               
               <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Studio Control</h2>
                  <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest italic leading-none mt-2">Export Configuration</p>
               </div>

               <div className="space-y-8">
                  {/* Currency Selection */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 ml-2">
                        <Coins className="w-3 h-3 text-[#c5a059]" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signal Currency</label>
                     </div>
                     <div className="grid grid-cols-4 gap-3">
                        {CURRENCIES.map((curr) => (
                           <button 
                             key={curr.code}
                             onClick={() => setCurrency(curr)}
                             className={cn(
                               "h-12 rounded-xl flex items-center justify-center text-[11px] font-black transition-all border-2",
                               currency.code === curr.code ? "bg-[#c5a059] text-white border-[#c5a059]" : "bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-transparent hover:border-[#c5a059]/20"
                             )}
                             title={curr.name}
                           >
                              {curr.symbol}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 ml-2">
                        <Palette className="w-3 h-3 text-[#c5a059]" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Aesthetic</label>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {TEMPLATES.map((tmp) => (
                           <button 
                             key={tmp.id}
                             onClick={() => setTemplate(tmp)}
                             className={cn(
                               "h-14 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all border-2",
                               template.id === tmp.id ? "border-[#c5a059] bg-[#c5a059]/5 text-slate-900 dark:text-white" : "bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-transparent"
                             )}
                           >
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tmp.color }} />
                              {tmp.name}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 ml-2">
                        <FileDown className="w-3 h-3 text-[#c5a059]" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export Protocol</label>
                     </div>
                     <div className="flex p-1 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <button 
                          onClick={() => setExportFormat("pdf")}
                          className={cn(
                            "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            exportFormat === "pdf" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                          )}
                        >
                           <FileText className="w-4 h-4" /> PDF
                        </button>
                        <button 
                          onClick={() => setExportFormat("png")}
                          className={cn(
                            "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            exportFormat === "png" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                          )}
                        >
                           <ImageIcon className="w-4 h-4" /> PNG Image
                        </button>
                     </div>
                  </div>
               </div>

               <div className="pt-8">
                  <Button 
                    onClick={handleExport}
                    className="w-full h-20 rounded-[2rem] bg-[#c5a059] text-white hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-zinc-950 text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_-10px_rgba(197,160,89,0.5)] active:scale-95 transition-all group"
                  >
                     <Download className="w-6 h-6 mr-3 group-hover:translate-y-1 transition-transform" />
                     Initialize Export
                  </Button>
               </div>
            </div>

            <div className="suite-card p-10 rounded-[3.5rem] bg-[#c5a059]/5 border border-[#c5a059]/10 space-y-6">
               <div className="flex items-center gap-4">
                  <Activity className="w-6 h-6 text-[#c5a059]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#c5a059]">Integrity Report</span>
               </div>
               <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-500 leading-relaxed uppercase tracking-[0.2em] italic">
                  High-fidelity PDF & Image rendering with multi-layer color profiles. Client-side generation ensures absolute data privacy.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
