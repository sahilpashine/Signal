import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Zap, Target, MessageSquare, TrendingUp, BarChart3,
  ArrowRight, Check, ChevronRight, Sparkles, Brain,
  Users, Building2, Rocket, LineChart, Shield,
  Star, Play, Clock, Globe, Lock
} from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const { isAuthenticated, user } = useAuth();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-purple">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Signal</span>
          <Badge variant="outline" className="text-xs border-primary/40 text-primary ml-1 hidden sm:flex">Beta</Badge>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
          <a href="#compare" className="hover:text-white transition-colors">Compare</a>
          <a href="#personas" className="hover:text-white transition-colors">Who It's For</a>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/app">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Open Signal
              </Button>
            </Link>
          ) : (
            <>
              <a href={getLoginUrl()} className="text-sm text-muted-foreground hover:text-white transition-colors hidden sm:block">Sign in</a>
              <a href={getLoginUrl()}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                  Try Signal Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, oklch(0.62 0.22 270 / 0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, oklch(0.72 0.18 55 / 0.06) 0%, transparent 70%)" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(oklch(0.97 0.005 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.97 0.005 240) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-muted-foreground mb-8 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI-Powered GTM Intelligence for Product Marketers
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
