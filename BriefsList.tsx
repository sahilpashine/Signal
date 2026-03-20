import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  Search, PlusCircle, FileText, Clock, Trash2,
  ChevronRight, Sparkles, Filter, Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BriefsList() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data: briefs, isLoading } = trpc.briefs.list.useQuery();

  const deleteMutation = trpc.briefs.delete.useMutation({
    onSuccess: () => {
      toast.success("Brief deleted");
      utils.briefs.list.invalidate();
    },
    onError: () => toast.error("Failed to delete brief"),
  });

  const filtered = briefs?.filter((b) =>
    b.productName.toLowerCase().includes(search.toLowerCase()) ||
    b.productDescription.toLowerCase().includes(search.toLowerCase()) ||
    (b.industry?.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My Briefs</h1>
            <p className="text-sm text-muted-foreground">
              {briefs ? `${briefs.length} brief${briefs.length !== 1 ? "s" : ""} generated` : "Loading..."}
            </p>
          </div>
          <Link href="/app/new">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shrink-0">
              <PlusCircle className="w-4 h-4" />
              New Brief
            </Button>
          </Link>
        </div>

        {/* Search */}
        {briefs && briefs.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search briefs by product name, description, or industry..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : briefs && briefs.length === 0 ? (
          <div className="glass rounded-2xl border border-white/6 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No briefs yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Generate your first GTM brief by describing your product. Signal will create a complete strategy in seconds.
            </p>
            <Link href="/app/new">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <PlusCircle className="w-4 h-4" />
                Generate Your First Brief
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-xl border border-white/6 p-10 text-center">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No briefs match "{search}"</p>
            <button onClick={() => setSearch("")} className="text-xs text-primary hover:text-primary/80 mt-2">Clear search</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((brief) => (
              <div
                key={brief.id}
                className="glass rounded-xl border border-white/6 hover:border-white/12 p-5 transition-all duration-200 group cursor-pointer"
                onClick={() => navigate(`/app/brief/${brief.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1 truncate">{brief.productName}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                          {brief.productDescription}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {brief.industry && (
                            <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.industry}</Badge>
                          )}
                          {brief.stage && (
                            <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground">{brief.stage}</Badge>
                          )}
                          {brief.isShared && (
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">Shared</Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(brief.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: brief.id }); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-muted-foreground group-hover:text-white transition-colors p-1.5">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
