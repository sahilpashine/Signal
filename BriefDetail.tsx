import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  Users, Target, Zap, MessageSquare, TrendingUp,
  Share2, Download, ArrowLeft, Copy, Check, Link2,
  Mail, Linkedin, Globe, Smartphone, ChevronRight,
  Loader2, Lock, Unlock
} from "lucide-react";
import { format } from "date-fns";

interface BriefData {
  id: number;
  productName: string;
  productDescription: string;
  industry?: string | null;
  stage?: string | null;
  icpData?: string | null;
  positioningStatement?: string | null;
  valuePropositions?: string | null;
  channelMessaging?: string | null;
  competitiveDiff?: string | null;
  shareToken?: string | null;
  isShared: boolean;
  createdAt: Date;
}

function SectionCard({ color, icon: Icon, label, title, children }: {
  color: string; icon: React.ElementType; label: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl border border-white/6 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6"
        style={{ background: `${color.replace(")", " / 0.06)")}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color.replace(")", " / 0.15)")}`, border: `1px solid ${color.replace(")", " / 0.30)")}` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</div>
          <div className="text-sm font-semibold text-white">{title}</div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function BriefContent({ brief }: { brief: BriefData }) {
  const icp = brief.icpData ? JSON.parse(brief.icpData) : null;
  const valueProps = brief.valuePropositions ? JSON.parse(brief.valuePropositions) : [];
  const messaging = brief.channelMessaging ? JSON.parse(brief.channelMessaging) : {};
  const compDiff = brief.competitiveDiff ? JSON.parse(brief.competitiveDiff) : [];

  const channelItems = [
    { icon: Mail, label: "Email Subject", key: "emailSubject", color: "oklch(0.62 0.22 270)" },
    { icon: Mail, label: "Email Opening", key: "emailBody", color: "oklch(0.62 0.22 270)" },
    { icon: Linkedin, label: "LinkedIn Ad", key: "linkedinAd", color: "oklch(0.55 0.20 250)" },
    { icon: Globe, label: "Landing Page Hero", key: "landingPageHero", color: "oklch(0.65 0.20 160)" },
    { icon: Globe, label: "Landing Page Subheadline", key: "landingPageSubheadline", color: "oklch(0.65 0.20 160)" },
    { icon: Smartphone, label: "Onboarding Message", key: "onboardingMessage", color: "oklch(0.72 0.18 55)" },
  ];

  return (
    <div className="space-y-6">
      {/* ICP */}
      {icp && (
        <SectionCard color="oklch(0.62 0.22 270)" icon={Users} label="ICP" title="Ideal Customer Profile">
          <div className="space-y-5">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Profile</div>
              <p className="text-sm text-white/90 leading-relaxed">{icp.profile}</p>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Demographics & Firmographics</div>
              <p className="text-sm text-white/80 leading-relaxed">{icp.demographics}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pain Points</div>
                <ul className="space-y-1.5">
                  {icp.painPoints?.map((p: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-white/80">
                      <span className="text-destructive shrink-0 mt-0.5">✕</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Motivations</div>
                <ul className="space-y-1.5">
                  {icp.motivations?.map((m: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-white/80">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Positioning */}
      {brief.positioningStatement && (
        <SectionCard color="oklch(0.72 0.18 55)" icon={Target} label="Positioning" title="Positioning Statement">
          <div className="flex items-start justify-between gap-4">
            <blockquote className="text-lg font-medium text-white leading-relaxed italic border-l-4 pl-4"
              style={{ borderColor: "oklch(0.72 0.18 55)" }}>
              "{brief.positioningStatement}"
            </blockquote>
            <CopyButton text={brief.positioningStatement} />
          </div>
        </SectionCard>
      )}

      {/* Value Propositions */}
      {valueProps.length > 0 && (
        <SectionCard color="oklch(0.65 0.20 160)" icon={Zap} label="Value Props" title="Value Propositions">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {valueProps.map((vp: { title: string; description: string }, i: number) => (
              <div key={i} className="rounded-xl p-4 border border-white/6"
                style={{ background: "oklch(0.65 0.20 160 / 0.05)" }}>
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "oklch(0.65 0.20 160 / 0.20)", border: "1px solid oklch(0.65 0.20 160 / 0.40)" }}>
                    <span className="text-xs font-bold" style={{ color: "oklch(0.65 0.20 160)" }}>{i + 1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{vp.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{vp.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Channel Messaging */}
      {Object.keys(messaging).length > 0 && (
        <SectionCard color="oklch(0.60 0.22 320)" icon={MessageSquare} label="Messaging" title="Messaging by Channel">
          <div className="space-y-4">
            {channelItems.map(({ icon: Icon, label, key, color }) => messaging[key] ? (
              <div key={key} className="rounded-xl p-4 border border-white/6 group">
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
        </SectionCard>
      )}

      {/* Competitive Differentiation */}
      {compDiff.length > 0 && (
        <SectionCard color="oklch(0.68 0.18 200)" icon={TrendingUp} label="Competitive Diff" title="Competitive Differentiation">
          <div className="space-y-4">
            {compDiff.map((diff: { differentiator: string; description: string; vsAlternative: string }, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/6"
                style={{ background: "oklch(0.68 0.18 200 / 0.04)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.68 0.18 200 / 0.15)", border: "1px solid oklch(0.68 0.18 200 / 0.30)" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "oklch(0.68 0.18 200)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{diff.differentiator}</h4>
                    <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{diff.vsAlternative}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{diff.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export default function BriefDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const briefId = parseInt(params.id || "0");
  const utils = trpc.useUtils();

  const { data: brief, isLoading, error } = trpc.briefs.getById.useQuery(
    { id: briefId },
    { enabled: !!briefId }
  );

  const toggleShareMutation = trpc.briefs.toggleShare.useMutation({
    onSuccess: (data) => {
      utils.briefs.getById.invalidate({ id: briefId });
      if (data.shareToken) {
        const shareUrl = `${window.location.origin}/share/${data.shareToken}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      } else {
        toast.success("Sharing disabled");
      }
    },
    onError: () => toast.error("Failed to update sharing settings"),
  });

  const exportMutation = trpc.briefs.exportPdf.useMutation({
    onSuccess: (data) => {
      // Trigger client-side PDF generation
      window.open(data.url, "_blank");
      toast.success("Brief exported successfully!");
    },
    onError: () => toast.error("Failed to export brief"),
  });

  const handleShare = () => {
    if (!brief) return;
    if (brief.isShared && brief.shareToken) {
      // Already shared — copy link
      const shareUrl = `${window.location.origin}/share/${brief.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } else {
      toggleShareMutation.mutate({ id: briefId, share: true });
    }
  };

  const handleDisableShare = () => {
    if (!brief) return;
    toggleShareMutation.mutate({ id: briefId, share: false });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading brief...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !brief) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground mb-4">Brief not found.</p>
          <Button variant="ghost" onClick={() => navigate("/app/briefs")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to briefs
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate("/app/briefs")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-4 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to briefs
          </button>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{brief.productName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {brief.industry && <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.industry}</Badge>}
                {brief.stage && <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.stage}</Badge>}
                <span className="text-xs text-muted-foreground">
                  Generated {format(new Date(brief.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {brief.isShared ? (
                <div className="flex items-center gap-2">
                  <button onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors px-3 py-1.5 rounded-lg border border-green-500/20 hover:border-green-500/40">
                    <Link2 className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <button onClick={handleDisableShare}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                    <Lock className="w-3.5 h-3.5" />
                    Disable
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={toggleShareMutation.isPending}
                  className="gap-2 border-white/10 text-white hover:bg-white/5 text-xs"
                >
                  {toggleShareMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                  Share
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportMutation.mutate({ id: briefId })}
                disabled={exportMutation.isPending}
                className="gap-2 border-white/10 text-white hover:bg-white/5 text-xs"
              >
                {exportMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Export
              </Button>
            </div>
          </div>

          {/* Product description */}
          <div className="mt-4 glass rounded-xl border border-white/6 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Product Description</div>
            <p className="text-sm text-white/80 leading-relaxed">{brief.productDescription}</p>
          </div>
        </div>

        {/* Brief content */}
        <BriefContent brief={brief} />
      </div>
    </AppLayout>
  );
}
