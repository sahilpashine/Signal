import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  Zap, PlusCircle, FileText, Settings, LogOut,
  ChevronRight, LayoutDashboard, Menu, X
} from "lucide-react";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center animate-pulse-glow">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Signal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6 glow-purple">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in to Signal</h2>
          <p className="text-muted-foreground mb-6">Create and manage your GTM briefs with AI-powered intelligence.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-white w-full gap-2">
              <Zap className="w-4 h-4" />
              Sign In to Continue
            </Button>
          </a>
          <Link href="/">
            <p className="text-sm text-muted-foreground mt-4 hover:text-white cursor-pointer transition-colors">← Back to homepage</p>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/new", icon: PlusCircle, label: "New Brief" },
    { href: "/app/briefs", icon: FileText, label: "My Briefs" },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/6">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-purple shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">Signal</div>
              <div className="text-xs text-muted-foreground leading-tight">GTM Intelligence</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || (href !== "/app" && location.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/6">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-light mb-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email || ""}</div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-all w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-white/6 bg-sidebar fixed top-0 bottom-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 flex flex-col bg-sidebar border-r border-white/6 z-10">
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/6 glass sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">Signal</span>
          </div>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
