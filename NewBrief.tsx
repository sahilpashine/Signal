import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  Zap, Sparkles, ArrowRight, Building2, Rocket, Users,
  Target, MessageSquare, TrendingUp, Brain, Loader2
} from "lucide-react";

const INDUSTRIES = [
  "SaaS / Software", "Fintech", "Healthcare / MedTech", "E-commerce / Retail",
  "EdTech", "Marketing Tech", "Developer Tools", "HR Tech", "Legal Tech",
  "Real Estate Tech", "Logistics / Supply Chain", "AI / ML", "Other"
];

const STAGES = [
  "Pre-launch / Idea", "MVP / Beta", "Early Traction (0-100 customers)",
  "Growth (100-1K customers)", "Scale (1K+ customers)", "Enterprise"
];

const EXAMPLES = [
  {
    name: "Signal",
    desc: "Signal is an AI-powered GTM intelligence tool for product marketers. You describe any product, and Signal instantly generates a complete go-to-market brief including ICP, positioning statement, value propositions, channel-specific messaging, and competitive differentiation. It's built specifically for PMMs who need to move fast.",
    industry: "Marketing Tech",
    stage: "MVP / Beta",
  },
  {
    name: "Notion",
    desc: "Notion is an all-in-one workspace where teams write, plan, and organize their work. It combines notes, docs, wikis, and project management in a single flexible tool. Teams use it to replace Confluence, Jira, and Google Docs with one unified workspace.",
    industry: "SaaS / Software",
    stage: "Scale (1K+ customers)",
  },
  {
    name: "Figma",
    desc: "Figma is a collaborative design platform that lets product teams design, prototype, and hand off work in one place. Unlike desktop design tools, Figma runs entirely in the browser, enabling real-time collaboration between designers, developers, and stakeholders.",
    industry: "Developer Tools",
    stage: "Scale (1K+ customers)",
  },
];

export default function NewBrief() {
  const [, navigate] = useLocation();
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [charCount, setCharCount] = useState(0);

  const generateMutation = trpc.briefs.generate.useMutation({
    onSuccess: (data) => {
      toast.success("GTM brief generated successfully!");
      navigate(`/app/brief/${data.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate brief. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 20) {
      toast.error("Please describe your product in at least 20 characters");
      return;
    }
    generateMutation.mutate({
      productDescription: description.trim(),
      industry: industry || undefined,
      stage: stage || undefined,
    });
  };

  const handleExample = (ex: typeof EXAMPLES[0]) => {
    setDescription(ex.desc);
    setCharCount(ex.desc.length);
    setIndustry(ex.industry);
    setStage(ex.stage);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">New GTM Brief</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Describe your product and Signal will generate a complete go-to-market strategy in seconds.
          </p>
        </div>

        {/* What you'll get */}
        <div className="glass rounded-xl border border-white/6 p-5 mb-8">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">What Signal will generate</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { icon: Users, label: "ICP Analysis", color: "oklch(0.62 0.22 270)" },
              { icon: Target, label: "Positioning", color: "oklch(0.72 0.18 55)" },
              { icon: Zap, label: "Value Props", color: "oklch(0.65 0.20 160)" },
              { icon: MessageSquare, label: "Messaging", color: "oklch(0.60 0.22 320)" },
              { icon: TrendingUp, label: "Competitive Diff", color: "oklch(0.68 0.18 200)" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-lg text-center"
                style={{ background: `${color.replace(")", " / 0.06)")}` }}>
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Product Description <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Describe what your product does, who it's for, and the problem it solves. The more detail you provide, the better your GTM brief will be.
            </p>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setCharCount(e.target.value.length); }}
                placeholder="Example: My product is a B2B SaaS tool that helps sales teams automatically qualify leads by analyzing their LinkedIn activity and CRM data. It integrates with Salesforce and HubSpot and uses AI to score leads based on buying signals..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-input border border-border text-white placeholder:text-muted-foreground/50 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                disabled={generateMutation.isPending}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">
                {charCount} chars
              </div>
            </div>
            {charCount > 0 && charCount < 20 && (
              <p className="text-xs text-destructive mt-1">Please add more detail (minimum 20 characters)</p>
            )}
          </div>

          {/* Industry + Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Industry <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                style={{ color: industry ? "oklch(0.97 0.005 240)" : "oklch(0.60 0.015 240)" }}
                disabled={generateMutation.isPending}
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Stage <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                style={{ color: stage ? "oklch(0.97 0.005 240)" : "oklch(0.60 0.015 240)" }}
                disabled={generateMutation.isPending}
              >
                <option value="">Select stage...</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={generateMutation.isPending || description.trim().length < 20}
            className="w-full bg-primary hover:bg-primary/90 text-white gap-2 py-6 text-base glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signal is thinking like a PMM...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate GTM Brief
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {generateMutation.isPending && (
            <div className="glass rounded-xl border border-primary/20 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-white">Signal is analyzing your product...</span>
              </div>
              <div className="space-y-2">
                {[
                  "Identifying your ideal customer profile",
                  "Crafting positioning statement",
                  "Generating value propositions",
                  "Writing channel-specific messaging",
                  "Analyzing competitive differentiation",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Examples */}
        {!generateMutation.isPending && (
          <div className="mt-10">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Try an example</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => handleExample(ex)}
                  className="glass rounded-xl border border-white/6 hover:border-primary/30 p-4 text-left transition-all duration-200 cursor-pointer group"
                >
                  <div className="text-sm font-semibold text-white mb-1 group-hover:text-primary transition-colors">{ex.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{ex.desc.substring(0, 80)}...</div>
                  <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground mt-2">{ex.industry}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
