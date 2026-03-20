import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "wouter";
import { useState } from "react";
import {
  Zap, Users, Target, MessageSquare, TrendingUp,
  Check, Copy, ChevronRight, Mail, Linkedin, Globe,
  Smartphone, ArrowRight, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { getLoginUrl } from "@/const";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function SharedBrief() {
  const params = useParams<{ token: string }>();
  const { data: brief, isLoading, error } = trpc.briefs.getByShareToken.useQuery(
    { token: params.token || "" },
    { enabled: !!params.token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center animate-pulse-glow">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading GTM brief...</p>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Brief not found</h2>
          <p className="text-muted-foreground mb-6">This brief may have been deleted or sharing has been disabled.</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Zap className="w-4 h-4" /> Try Signal Free
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const icp = brief.icpData ? JSON.parse(brief.icpData) : null;
  const valueProps = brief.valuePropositions ? JSON.parse(brief.valuePropositions) : [];
  const messaging = brief.channelMessaging ? JSON.parse(brief.channelMessaging) : {};
  const compDiff = brief.competitiveDiff ? JSON.parse(brief.competitiveDiff) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-white">Signal</span>
            </div>
          </Link>
          <a href={getLoginUrl()}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2 text-xs">
              Create Your Own Brief <ArrowRight className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </nav>

      <div className="container py-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs border-primary/40 text-primary">GTM Brief</Badge>
            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">Shared</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{brief.productName}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {brief.industry && <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.industry}</Badge>}
            {brief.stage && <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.stage}</Badge>}
            <span className="text-xs text-muted-foreground">
              Generated {format(new Date(brief.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <div className="mt-4 glass rounded-xl border border-white/6 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Product Description</div>
            <p className="text-sm text-white/80 leading-relaxed">{brief.productDescription}</p>
          </div>
        </div>

        {/* ICP */}
        {icp && (
          <div className="glass rounded-2xl border border-white/6 overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6" style={{ background: "oklch(0.62 0.22 270 / 0.06)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.62 0.22 270 / 0.15)", border: "1px solid oklch(0.62 0.22 270 / 0.30)" }}>
                <Users className="w-4 h-4" style={{ color: "oklch(0.62 0.22 270)" }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.62 0.22 270)" }}>ICP</div>
                <div className="text-sm font-semibold text-white">Ideal Customer Profile</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-white/90 leading-relaxed">{icp.profile}</p>
              <p className="text-sm text-white/70 leading-relaxed">{icp.demographics}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pain Points</div>
                  <ul className="space-y-1.5">{icp.painPoints?.map((p: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-white/80"><span className="text-destructive shrink-0">✕</span>{p}</li>
                  ))}</ul>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Motivations</div>
                  <ul className="space-y-1.5">{icp.motivations?.map((m: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-white/80"><Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />{m}</li>
                  ))}</ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Positioning */}
        {brief.positioningStatement && (
          <div className="glass rounded-2xl border border-white/6 overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6" style={{ background: "oklch(0.72 0.18 55 / 0.06)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.72 0.18 55 / 0.15)", border: "1px solid oklch(0.72 0.18 55 / 0.30)" }}>
                <Target className="w-4 h-4" style={{ color: "oklch(0.72 0.18 55)" }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.72 0.18 55)" }}>Positioning</div>
                <div className="text-sm font-semibold text-white">Positioning Statement</div>
              </div>
            </div>
            <div className="p-6 flex items-start justify-between gap-4">
              <blockquote className="text-lg font-medium text-white leading-relaxed italic border-l-4 pl-4" style={{ borderColor: "oklch(0.72 0.18 55)" }}>
                "{brief.positioningStatement}"
              </blockquote>
              <CopyButton text={brief.positioningStatement} />
            </div>
          </div>
        )}

        {/* Value Props */}
        {valueProps.length > 0 && (
          <div className="glass rounded-2xl border border-white/6 overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6" style={{ background: "oklch(0.65 0.20 160 / 0.06)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.20 160 / 0.15)", border: "1px solid oklch(0.65 0.20 160 / 0.30)" }}>
                <Zap className="w-4 h-4" style={{ color: "oklch(0.65 0.20 160)" }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.65 0.20 160)" }}>Value Props</div>
                <div className="text-sm font-semibold text-white">Value Propositions</div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {valueProps.map((vp: { title: string; description: string }, i: number) => (
                <div key={i} className="rounded-xl p-4 border border-white/6" style={{ background: "oklch(0.65 0.20 160 / 0.05)" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "oklch(0.65 0.20 160 / 0.20)", border: "1px solid oklch(0.65 0.20 160 / 0.40)" }}>
                      <span className="text-xs font-bold" style={{ color: "oklch(0.65 0.20 160)" }}>{i + 1}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{vp.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{vp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Channel Messaging */}
        {Object.keys(messaging).length > 0 && (
          <div className="glass rounded-2xl border border-white/6 overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6" style={{ background: "oklch(0.60 0.22 320 / 0.06)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.60 0.22 320 / 0.15)", border: "1px solid oklch(0.60 0.22 320 / 0.30)" }}>
                <MessageSquare className="w-4 h-4" style={{ color: "oklch(0.60 0.22 320)" }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.60 0.22 320)" }}>Messaging</div>
                <div className="text-sm font-semibold text-white">Messaging by Channel</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { icon: Mail, label: "Email Subject", key: "emailSubject", color: "oklch(0.62 0.22 270)" },
                { icon: Mail, label: "Email Opening", key: "emailBody", color: "oklch(0.62 0.22 270)" },
                { icon: Linkedin, label: "LinkedIn Ad", key: "linkedinAd", color: "oklch(0.55 0.20 250)" },
                { icon: Globe, label: "Landing Page Hero", key: "landingPageHero", color: "oklch(0.65 0.20 160)" },
                { icon: Globe, label: "Landing Page Subheadline", key: "landingPageSubheadline", color: "oklch(0.65 0.20 160)" },
                { icon: Smartphone, label: "Onboarding Message", key: "onboardingMessage", color: "oklch(0.72 0.18 55)" },
              ].map(({ icon: Icon, label, key, color }) => messaging[key] ? (
                <div key={key} className="rounded-xl p-4 border border-white/6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                    </div>
                    <CopyButton text={messaging[key]} />
                  </div>
                  <p className="text-sm text-white/85 leading-relaxed">{messaging[key]}</p>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Competitive Diff */}
        {compDiff.length > 0 && (
          <div className="glass rounded-2xl border border-white/6 overflow-hidden mb-10">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6" style={{ background: "oklch(0.68 0.18 200 / 0.06)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.68 0.18 200 / 0.15)", border: "1px solid oklch(0.68 0.18 200 / 0.30)" }}>
                <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.68 0.18 200)" }} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.68 0.18 200)" }}>Competitive Diff</div>
                <div className="text-sm font-semibold text-white">Competitive Differentiation</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {compDiff.map((diff: { differentiator: string; description: string; vsAlternative: string }, i: number) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/6" style={{ background: "oklch(0.68 0.18 200 / 0.04)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(0.68 0.18 200 / 0.15)", border: "1px solid oklch(0.68 0.18 200 / 0.30)" }}>
                    <ChevronRight className="w-4 h-4" style={{ color: "oklch(0.68 0.18 200)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{diff.differentiator}</h4>
                      <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{diff.vsAlternative}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{diff.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="glass rounded-2xl border border-primary/20 p-8 text-center glow-purple">
          <h3 className="text-xl font-bold text-white mb-2">Generate your own GTM brief</h3>
          <p className="text-sm text-muted-foreground mb-5">Signal creates complete GTM strategies in seconds. Free to start.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Zap className="w-4 h-4" /> Try Signal Free <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
