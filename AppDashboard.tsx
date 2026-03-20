import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Zap, PlusCircle, FileText, ArrowRight, Clock,
  Sparkles, TrendingUp, Target, Users, MessageSquare, ChevronRight, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function BriefCard({ brief, onDelete }: { brief: any; onDelete: () => void }) {
  const deleteMutation = trpc.briefs.delete.useMutation({
    onSuccess: () => {
      toast.success("Brief deleted");
      onDelete();
    },
    onError: () => toast.error("Failed to delete brief"),
  });

  return (
    <div className="glass rounded-xl border border-white/6 hover:border-white/12 p-5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{brief.productName}</h3>
          <div className="flex items-center gap-2 mt-1">
            {brief.industry && (
              <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.industry}</Badge>
            )}
            {brief.stage && (
              <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.stage}</Badge>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); deleteMutation.mutate({ id: brief.id }); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {brief.productDescription}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(brief.createdAt), { addSuffix: true })}
        </div>
        <Link href={`/app/brief/${brief.id}`}>
          <Button size="sm" variant="ghost" className="text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 h-7 px-2">
            View Brief <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AppDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: briefs, isLoading } = trpc.briefs.list.useQuery();

  const stats = [
    { label: "Briefs Generated", value: briefs?.length ?? 0, icon: FileText, color: "oklch(0.62 0.22 270)" },
    { label: "Products Analyzed", value: briefs?.length ?? 0, icon: Target, color: "oklch(0.72 0.18 55)" },
    { label: "Channels Covered", value: briefs ? briefs.length * 4 : 0, icon: MessageSquare, color: "oklch(0.65 0.20 160)" },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Ready to build your next GTM strategy? Signal has you covered.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl border border-white/6 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color.replace(")", " / 0.15)")}`, border: `1px solid ${color.replace(")", " / 0.25)")}` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link href="/app/new">
            <div className="glass rounded-xl border border-primary/20 hover:border-primary/40 p-6 cursor-pointer transition-all duration-200 group glow-purple">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Generate New Brief</h3>
                  <p className="text-sm text-muted-foreground">Describe your product and get a complete GTM strategy in seconds</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>
          </Link>

          <Link href="/app/briefs">
            <div className="glass rounded-xl border border-white/6 hover:border-white/12 p-6 cursor-pointer transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Browse All Briefs</h3>
                  <p className="text-sm text-muted-foreground">Search and manage your complete GTM brief history</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent briefs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Briefs</h2>
            {briefs && briefs.length > 0 && (
              <Link href="/app/briefs">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl border border-white/6 p-5 animate-pulse">
                  <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
                  <div className="h-3 bg-white/5 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : briefs && briefs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {briefs.slice(0, 6).map((brief) => (
                <BriefCard
                  key={brief.id}
                  brief={brief}
                  onDelete={() => utils.briefs.list.invalidate()}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/6 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No briefs yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Generate your first GTM brief by describing your product. Signal will do the rest.
              </p>
              <Link href="/app/new">
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                  <Zap className="w-4 h-4" />
                  Generate Your First Brief
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
