import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Toollix",
  robots: {
    index: false,
    follow: false,
  },
};
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  ArrowLeft, 
  Settings as SettingsIcon, 
  FileText, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Mail, 
  Ticket, 
  Send, 
  Scale,
  Menu
} from "lucide-react";
import { RefreshButton } from "@/components/admin/RefreshButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#1e1e2d]">
      <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/50">
        <Link href="/" className="flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Platform
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">Control Panel</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Administrator</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto scrollbar-none">
        <div>
          <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Management</p>
          <div className="space-y-1">
            <NavLink href="/admin" icon={<LayoutDashboard className="w-4.5 h-4.5" />} label="Overview" color="text-blue-500" />
            <NavLink href="/admin/users" icon={<Users className="w-4.5 h-4.5" />} label="Identities" color="text-indigo-500" />
            <NavLink href="/admin/messages" icon={<Mail className="w-4.5 h-4.5" />} label="Support Inbox" color="text-pink-500" />
            <NavLink href="/admin/emails" icon={<Send className="w-4.5 h-4.5" />} label="Broadcasts" color="text-emerald-500" />
            <NavLink href="/admin/coupons" icon={<Ticket className="w-4.5 h-4.5" />} label="Coupons" color="text-yellow-500" />
            <NavLink href="/admin/articles" icon={<FileText className="w-4.5 h-4.5" />} label="Content" color="text-amber-500" />
            <NavLink href="/admin/legal" icon={<Scale className="w-4.5 h-4.5" />} label="Policies" color="text-emerald-500" />
            <NavLink href="/admin/settings" icon={<SettingsIcon className="w-4.5 h-4.5" />} label="Strategy" color="text-slate-500" />
          </div>
        </div>
        
        <div>
          <p className="px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Intelligence</p>
          <div className="space-y-1">
            <NavLink href="/admin/analytics" icon={<TrendingUp className="w-4.5 h-4.5" />} label="Visual Analytics" color="text-green-500" />
            <NavLink href="/admin/logs" icon={<Activity className="w-4.5 h-4.5" />} label="System Logs" color="text-red-500" />
            <NavLink href="/admin/reports" icon={<PieChart className="w-4.5 h-4.5" />} label="Raw Data" color="text-purple-500" />
          </div>
        </div>
      </nav>
      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 dark:bg-zinc-800/50 shadow-sm border border-white dark:border-zinc-700/50">
           <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
             {session?.user?.name?.[0]?.toUpperCase() || "A"}
           </div>
           <div className="flex flex-col min-w-0">
             <span className="text-sm font-bold truncate">{session?.user?.name}</span>
             <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Root Administrator</span>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f4f5fa] dark:bg-[#16161d] overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.03)] z-20">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Admin Header Bar */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-10 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-white/70 dark:bg-[#232333]/70 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-white/50 dark:border-zinc-800/50 w-full justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Nav Toggle */}
              <Sheet>
                <SheetTrigger
                  render={
                     <Button variant="ghost" size="icon" className="lg:hidden rounded-xl bg-muted/50">
                       <Menu className="w-5 h-5" />
                     </Button>
                  }
                />
                <SheetContent side="left" className="w-[300px] p-0 border-none shadow-2xl">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70 hidden sm:inline">Authority Session Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <RefreshButton />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
            <div className="max-w-7xl mx-auto">
               {children}
            </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 group"
    >
      <span className={`${color} transition-transform group-hover:scale-110`}>{icon}</span>
      <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{label}</span>
    </Link>
  );
}

