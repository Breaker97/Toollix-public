"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Inbox, 
  Loader2, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Mail, 
  User, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  FileText,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  Send,
  MoreVertical,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?page=${page}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTotalPages(data.pages || 1);
      setTotalMessages(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateStatus = async (messageId: string, status: "read" | "unread") => {
    setUpdating(messageId);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, status }),
      });
      if (res.ok) {
        setMessages(messages.map(m => m._id === messageId ? { ...m, status } : m));
        if (selectedMessage?._id === messageId) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Permanently delete this message tracking node?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing Communication Hub</p>
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">Support Inbox</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Client Requests & Communication Protocol</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white dark:bg-[#232333] px-6 py-4 rounded-2xl shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-black text-zinc-800 dark:text-zinc-100">{totalMessages}</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Inquiries</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Message List */}
         <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#232333] rounded-[2rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] overflow-hidden border border-zinc-50 dark:border-none flex flex-col h-[750px]">
               <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Incoming Feed</span>
                  <Button variant="ghost" size="sm" onClick={() => fetchMessages()} className="h-8 px-3 text-[10px] uppercase font-bold text-primary gap-2 hover:bg-primary/5 rounded-lg active:scale-95 transition-all">
                    <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    Sync
                  </Button>
               </div>
               
               <div className="flex-1 overflow-y-auto scrollbar-none py-2">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-30">
                        <MessageSquare className="w-12 h-12 text-zinc-300" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 leading-relaxed">System Quiet<br/>No communication nodes detected</p>
                    </div>
                  ) : messages.map((m, idx) => (
                    <button 
                      key={m._id}
                      onClick={() => {
                        setSelectedMessage(m);
                        if (m.status === "unread") updateStatus(m._id, "read");
                      }}
                      className={cn(
                        "w-full text-left p-6 transition-all border-l-4 group relative hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
                        selectedMessage?._id === m._id 
                            ? "bg-primary/5 active-indicator border-primary" 
                            : "border-transparent"
                      )}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest",
                                m.status === 'unread' 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                              )}>
                                 {m.status}
                              </span>
                              {m.status === 'unread' && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />}
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter opacity-60">{new Date(m.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 className="font-extrabold text-[15px] text-zinc-800 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">{m.subject}</h4>
                       <p className="text-[11px] text-zinc-400 font-medium mt-1 truncate">Origin: <span className="text-zinc-600 dark:text-zinc-300 font-bold">{m.name}</span></p>
                    </button>
                  ))}
               </div>

               {/* Pagination */}
               {totalPages > 1 && (
                 <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                    <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage(page-1)} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-all"><ChevronLeft className="w-5 h-5" /></Button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Registry {page} <span className="opacity-40">/</span> {totalPages}</span>
                    <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage(page+1)} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-all"><ChevronRight className="w-5 h-5" /></Button>
                 </div>
               )}
            </div>
         </div>

         {/* Message Reader */}
         <div className="lg:col-span-7 xl:col-span-8 h-[750px]">
            {selectedMessage ? (
              <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] h-full flex flex-col overflow-hidden border border-zinc-50 dark:border-none animate-in fade-in slide-in-from-right-8 duration-700">
                 
                 {/* Header Detail */}
                 <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 space-y-8 bg-zinc-50/30 dark:bg-zinc-800/10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1 min-w-0">
                           <h2 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 break-words leading-[1.1]">{selectedMessage.subject}</h2>
                           <div className="flex flex-wrap gap-3 pt-2">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-2xl text-[11px] font-bold text-zinc-500 shadow-sm border border-zinc-100 dark:border-none">
                                 <User className="w-4 h-4 text-primary" /> {selectedMessage.name}
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-2xl text-[11px] font-bold text-zinc-500 shadow-sm border border-zinc-100 dark:border-none uppercase tracking-tighter">
                                 <Mail className="w-4 h-4 text-emerald-500" /> {selectedMessage.email}
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-2xl text-[11px] font-bold text-zinc-500 shadow-sm border border-zinc-100 dark:border-none">
                                 <Calendar className="w-4 h-4 text-zinc-400" /> {new Date(selectedMessage.createdAt).toLocaleString()}
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                           <Button 
                             onClick={() => updateStatus(selectedMessage._id, selectedMessage.status === 'read' ? 'unread' : 'read')}
                             disabled={!!updating}
                             className={cn(
                                "h-12 px-6 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg gap-2",
                                selectedMessage.status === 'read' 
                                    ? 'bg-zinc-900 text-white shadow-zinc-900/20' 
                                    : 'bg-emerald-500 text-white shadow-emerald-500/20'
                             )}
                           >
                              {updating === selectedMessage._id 
                                ? <Loader2 className="w-4 h-4 animate-spin" /> 
                                : (selectedMessage.status === 'read' ? <RefreshCw className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
                              <span>{selectedMessage.status === 'read' ? 'Toggle Unread' : 'Resolve Protocol'}</span>
                           </Button>
                           <Button 
                             variant="ghost" 
                             onClick={() => deleteMessage(selectedMessage._id)}
                             className="h-12 w-12 p-0 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all scale-100 active:scale-90"
                           >
                              <Trash2 className="w-5 h-5" />
                           </Button>
                        </div>
                    </div>
                 </div>

                 {/* Message Analysis */}
                 <div className="flex-1 p-10 overflow-y-auto scrollbar-none">
                    <div className="max-w-4xl space-y-8">
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 shrink-0">
                             <FileText className="w-4 h-4" /> Message Logic
                          </div>
                          <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                       </div>
                       
                       <div className="relative">
                           <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-primary/10 rounded-full" />
                           <p className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[1.8] font-medium whitespace-pre-wrap selection:bg-primary selection:text-white pl-6">
                              {selectedMessage.message}
                           </p>
                       </div>
                    </div>
                 </div>

                 {/* Deployment Actions */}
                 <div className="p-10 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-[200px]">Node ID: <span className="text-zinc-300 font-sans tracking-normal">{selectedMessage._id}</span></p>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            className="h-14 px-8 rounded-[1.25rem] text-[11px] font-extrabold uppercase tracking-[0.2em] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all w-full sm:w-auto" 
                            onClick={() => setSelectedMessage(null)}
                        >
                            De-select
                        </Button>
                        <a 
                            href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} 
                            className="h-14 px-10 rounded-[1.25rem] bg-primary text-white font-extrabold text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all hover:opacity-90 w-full sm:w-auto"
                        >
                           <Send className="w-4 h-4" /> Transmit Reply
                        </a>
                    </div>
                 </div>

              </div>
            ) : (
              <div className="h-full bg-white dark:bg-[#232333] rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-center space-y-8 shadow-[0_2px_10px_0_rgba(76,78,100,0.1)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.3)] border border-zinc-50 dark:border-none">
                 <div className="relative">
                    <div className="absolute -inset-10 bg-primary/5 rounded-full animate-pulse" />
                    <div className="relative p-10 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] shadow-inner">
                        <Inbox className="w-16 h-16 text-zinc-300" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 italic tracking-tight">Signal Interface Ready</h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">Select a communication node from the manifest to initialize the reader protocol.</p>
                 </div>
                 <ArrowRight className="w-8 h-8 text-zinc-200 animate-bounce" />
              </div>
            )}
         </div>

      </div>

    </div>
  );
}
