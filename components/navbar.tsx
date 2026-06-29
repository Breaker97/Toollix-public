"use client";

import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  LayoutGrid, 
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  SearchIcon,
  Mail,
  Ticket,
  FileImage,
  Terminal,
  QrCode,
  Palette
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ALL_TOOLS, CATEGORIES } from "@/lib/tools-data";
import { ToolIcon } from "@/lib/tool-icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export function Navbar({ branding }: { branding?: { siteLogo: string; logoWidth: number } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMegaCategory, setActiveMegaCategory] = useState("PDF Tools");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const isLoading = status === "loading";

  const filteredTools = searchQuery.length > 1 
    ? ALL_TOOLS.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search tools..."]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[60] w-full bg-[#f8f9fa] border-b border-zinc-200/50 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4 relative">
          
          {/* Logo Section */}
          <div className="flex-1 lg:flex-none flex justify-start">
            <Link href="/" className="flex items-center gap-0.5 group shrink-0">
              <div className="relative">
                <div className="relative p-1 transition-all duration-200">
                  {branding?.siteLogo ? (
                    <Image 
                      src={branding.siteLogo} 
                      alt="Toollix Logo" 
                      width={branding.logoWidth || 120}
                      height={40}
                      className="max-h-10 sm:max-h-12 object-contain"
                      style={{ width: 'auto', height: 'auto' }}
                      priority
                    />
                  ) : (
                    <div className="bg-primary p-1.5 rounded-xl">
                      <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tighter transition-colors">
                <span className="text-primary">toollix</span>
                <span className="text-[#c5a059]">.io</span>
              </span>
            </Link>
            
            {/* Desktop Nav - Links & Dropdowns */}
            <nav className="hidden lg:flex items-center gap-2 ml-8">
              <Link href="/pricing" className="h-9 px-4 flex items-center gap-2 font-bold hover:bg-primary/5 hover:text-primary transition-all rounded-full group text-sm">
                Pricing
              </Link>
              <Link href="/blog" className="h-9 px-4 flex items-center gap-2 font-bold hover:bg-primary/5 hover:text-primary transition-all rounded-full group text-sm">
                Blog
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="h-9 px-4 gap-1.5 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all rounded-full group flex items-center justify-center outline-none">
                  <LayoutGrid className="w-4 h-4" />
                  Browse Tools
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[900px] p-0 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden" 
                  align="start"
                >
                  <div className="flex h-[500px]">
                    {/* Left Pane - Categories */}
                    <div className="w-64 bg-zinc-50 dark:bg-zinc-900/50 p-4">
                      <div className="space-y-1">
                        {CATEGORIES.slice(1).map((cat) => {
                          const isActive = activeMegaCategory === cat.value;

                          return (
                            <div
                              key={cat.slug}
                              onMouseEnter={() => setActiveMegaCategory(cat.value)}
                              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                                  isActive 
                                    ? "bg-[#c5a059] text-white border-[#c5a059] translate-x-1 animate-in slide-in-from-left-2 duration-300" 
                                    : "hover:bg-zinc-200/50 text-zinc-600 dark:text-zinc-400 border-transparent"
                              }`}
                            >
                              <ToolIcon 
                                slug={cat.slug} 
                                className="w-8 h-8 !p-1.5" 
                                iconColor={isActive ? 'white' : undefined}
                                bgColor={isActive ? 'transparent' : undefined}
                              />
                              <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap italic">{cat.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane - Tool Grid */}
                    <div className="flex-1 p-8 overflow-y-auto">
                      <div className="flex items-center justify-between mb-8">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic leading-none">{activeMegaCategory}</h4>
                         <Link href={`/?cat=${CATEGORIES.find(c => c.value === activeMegaCategory)?.slug}#tools`} className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group italic">
                           Vector Stream <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                         </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {ALL_TOOLS.filter(t => t.category === activeMegaCategory).map((tool) => (
                          <Link 
                            key={tool.href}
                            href={tool.href}
                            className="group flex items-start gap-4 p-4 rounded-3xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
                          >
                            <div className="shrink-0 group-hover:scale-110 transition-transform">
                               <ToolIcon slug={tool.href.split('/').pop() || ''} className="w-12 h-12" />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                               <span className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{tool.title}</span>
                               <span className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{tool.description}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Search Section (Desktop & Mobile Expansion) */}
          {/* Search Section (Desktop & Mobile Expansion) */}
          <div ref={searchRef} className="hidden sm:flex flex-1 max-w-[200px] sm:max-w-md relative group mx-4">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? "scale-[1.02]" : ""}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? "text-primary" : "text-muted-foreground"}`} />
              <Input
                placeholder="Search tools..."
                className="pl-9 h-10 w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus-visible:ring-primary/20 focus-visible:bg-white transition-all text-[11px] font-black uppercase tracking-widest shadow-inner-soft"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-100 bg-background shadow-sm pointer-events-none group-focus-within:border-primary/30">
                <span className="text-[9px] opacity-40">CTRL</span>
                <span className="text-[11px] font-bold text-primary italic">K</span>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {isSearchFocused && filteredTools.length > 0 && (
               <div className="absolute top-full left-[-100px] sm:left-0 right-[-100px] sm:right-0 mt-2 p-2 bg-white dark:bg-zinc-900 border-none shadow-soft-2xl rounded-[2rem] animate-in fade-in slide-in-from-top-2">
                {filteredTools.map((tool) => (
                  <Link 
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted hover:text-primary transition-all group"
                    onClick={() => {
                        setSearchQuery("");
                        setIsSearchFocused(false);
                    }}
                  >
                    <ToolIcon slug={tool.href.split('/').pop() || ''} className="w-8 h-8 !p-1.5" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">{tool.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{tool.category}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons Section */}
          <div className="flex items-center gap-2">
            <Link href="/contact" className="h-9 px-3 hidden lg:flex items-center gap-1.5 font-bold hover:bg-primary/5 hover:text-primary transition-all rounded-xl group text-sm">
              Contact
            </Link>
            <span className="w-px h-6 bg-border/50 mx-1 hidden lg:block" />

            <span className="w-px h-6 bg-border/50 mx-1 hidden lg:block" />

            {isLoading ? (
              <div className="w-8 h-8 rounded-xl bg-muted animate-pulse border border-border/50" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative p-1 rounded-xl hover:bg-muted transition-all outline-none">
                  <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-primary font-bold text-xs shadow-inner">
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-4 rounded-3xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl" align="end">
                  <div className="flex items-center gap-3 p-2 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-primary font-bold shadow-sm">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-black leading-none">{session.user?.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  {session.user?.plan === 'free' && (
                    <div className="p-3 mb-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-[#CD9A32]/20">
                       <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1.5">
                         <Sparkles className="w-3 h-3" /> Get Pro Access
                       </p>
                       <p className="text-[10px] text-muted-foreground leading-tight mb-2">Unlock unlimited tools, batch processing, and no ads.</p>
                       <button
                         type="button"
                         onClick={() => router.push("/pricing")}
                         className="w-full h-8 text-[10px] rounded-lg font-black bg-[#CD9A32] text-white hover:opacity-90 shadow-md shadow-[#CD9A32]/20 transition-all px-3"
                       >
                         Upgrade Now
                       </button>
                    </div>
                  )}

                  <DropdownMenuGroup>
                    {session.user?.role === "admin" && (
                      <DropdownMenuItem 
                        onClick={() => router.push("/admin")}
                        className="rounded-xl flex items-center gap-2.5 p-2.5 cursor-pointer text-primary focus:text-primary focus:bg-[#CD9A32]/10"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm font-black">Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => router.push("/dashboard")}
                      className="rounded-xl flex items-center gap-2.5 p-2.5 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">My Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push("/dashboard")}
                      className="rounded-xl flex items-center gap-2.5 p-2.5 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push(session.user?.role === "admin" ? "/admin/settings" : "/dashboard")}
                      className="rounded-xl flex items-center gap-2.5 p-2.5 cursor-pointer"
                    >
                      <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 opacity-10" />
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-xl flex items-center gap-2.5 p-2.5 cursor-pointer text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/5">
                    <LogOut className="w-4 h-4 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/login" className="hidden sm:flex items-center justify-center h-9 px-4 font-bold text-sm rounded-xl hover:bg-muted hover:text-primary transition-all">
                  Log In
                </Link>
                <Link 
                  href="/login?mode=signup" 
                  className="hidden sm:flex items-center justify-center h-9 px-5 font-black text-sm rounded-xl text-white transition-all active:scale-95 shadow-lg shadow-[#c5a059]/30 bg-[#c5a059] hover:bg-[#b08b47]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                className="lg:hidden inline-flex items-center justify-center rounded-xl p-3.5 min-h-[48px] min-w-[48px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all outline-none"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </SheetTrigger>
               <SheetContent side="right" className="w-[300px] p-0 border-none bg-[#f8f9fa] dark:bg-zinc-950 shadow-soft-2xl">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 text-left">
                     <SheetTitle className="font-black text-2xl tracking-tighter transition-colors">
                       <span className="text-primary">toollix</span>
                       <span className="text-[#c5a059]">.io</span>
                     </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                           {session?.user?.plan !== 'pro' && (
                            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center min-h-[48px] px-4 rounded-2xl bg-white dark:bg-zinc-900 font-bold text-sm shadow-soft-xl">Pricing</Link>
                          )}
                          <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center min-h-[48px] px-4 rounded-2xl bg-white dark:bg-zinc-900 font-bold text-sm shadow-soft-xl">Blog</Link>
                          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center min-h-[48px] px-4 rounded-2xl bg-white dark:bg-zinc-900 font-bold text-sm shadow-soft-xl">Contact Support</Link>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 pl-2">Tool Categories</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {CATEGORIES.slice(1).map((cat) => (
                            <Link 
                                key={cat.slug} 
                                href={`/?cat=${cat.slug}#tools`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                 className="flex items-center gap-3 px-4 min-h-[48px] rounded-2xl bg-white dark:bg-zinc-900 border border-white/5 hover:bg-primary/5 hover:text-primary transition-all font-black uppercase text-[10px] tracking-widest shadow-soft-xl"
                            >
                              <div className="shrink-0">
                                <ToolIcon slug={cat.slug} className="w-8 h-8 !p-1.5" />
                              </div>
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 pl-2">Session & Account</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {session ? (
                            <>
                              <button 
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  router.push(session.user?.role === "admin" ? "/admin" : "/dashboard");
                                }}
                                 className="flex items-center gap-3 px-4 min-h-[48px] rounded-2xl bg-white dark:bg-zinc-900 border border-white/5 font-black uppercase text-[10px] tracking-widest text-primary shadow-soft-xl"
                              >
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                  <LayoutDashboard className="w-3.5 h-3.5" />
                                </div>
                                {session.user?.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                              </button>
                              <button 
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  signOut();
                                }}
                                className="flex items-center gap-3 px-4 min-h-[48px] rounded-2xl bg-primary/5 font-black uppercase text-[10px] tracking-widest text-primary border border-primary/5"
                              >
                                <div className="p-2 bg-primary/10 rounded-xl">
                                  <LogOut className="w-3.5 h-3.5" />
                                </div>
                                Sign Out
                              </button>
                            </>
                          ) : (
                            <>
                              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[48px] rounded-2xl bg-white dark:bg-zinc-900 font-bold text-sm shadow-soft-xl">
                                <div className="p-2 bg-background rounded-xl">
                                  <UserIcon className="w-3.5 h-3.5" />
                                </div>
                                Log In
                              </Link>
                               <Link href="/login?mode=signup" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 min-h-[48px] rounded-2xl bg-[#c5a059]/10 font-black text-sm text-[#b08b47] shadow-soft-xl">
                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                                </div>
                                Create Account
                              </Link>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 pl-2">Trust & Security</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-soft-xl">
                               <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                               <p className="text-[10px] font-black">Private</p>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-soft-xl">
                               <Zap className="w-4 h-4 text-orange-500 mb-1" />
                               <p className="text-[10px] font-black">Fast</p>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {session && session?.user?.plan !== 'pro' && (
                    <div className="p-6 bg-background shadow-[0_-1px_30px_rgba(0,0,0,0.03)]">
                       <p className="text-[10px] text-center text-muted-foreground font-medium mb-3">Professional tools for designers & developers.</p>
                       <Button onClick={() => {
                         setIsMobileMenuOpen(false);
                         router.push("/pricing");
                       }} className="w-full h-12 rounded-2xl font-black bg-[#CD9A32] text-white shadow-xl shadow-[#CD9A32]/20 transition-all active:scale-95">Upgrade to Pro</Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}
