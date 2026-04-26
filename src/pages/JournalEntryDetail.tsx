import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useModerationJournal } from "@/hooks/useModerationJournal";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import SEOHead from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, User, Flag, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { marked } from "marked";
import { useState } from "react";

const JournalEntryDetail = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const { user } = useAuth();
  const { flagEntry } = useModerationJournal();
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  // Check if current user is admin/moderator
  const { data: userRoles } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      return (data || []) as Array<{ role: string }>;
    },
    enabled: !!user,
  });

  const isModOrAdmin = userRoles?.some(r => ["admin", "moderator"].includes(r.role)) || false;

  // Get profile by username
  const { data: profile } = useQuery({
    queryKey: ["profile-by-username", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, full_name")
        .eq("username", username!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  // Get journal entry
  const { data: entry, isLoading } = useQuery({
    queryKey: ["journal-entry", profile?.id, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_journal_entries")
        .select("*")
        .eq("user_id", profile!.id)
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && !!slug,
  });

  const handleFlag = () => {
    if (!entry || !flagReason.trim()) return;
    flagEntry.mutate({ entryId: entry.id, reason: flagReason.trim() });
    setFlagDialogOpen(false);
    setFlagReason("");
  };

  const renderContent = (content: string) => {
    const html = marked.parse(content, { async: false }) as string;
    return { __html: html };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
        <HeaderNavigation isScrolled={false} />
        <main className="flex-1 max-w-4xl mx-auto p-6 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
        <HeaderNavigation isScrolled={false} />
        <main className="flex-1 max-w-4xl mx-auto p-6 pt-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Journal Entry Not Found</h1>
          <Link to={username ? `/user/${username}` : "/blog"}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> {username ? `Back to ${username}'s Profile` : "Back to Blog"}
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex flex-col">
      <SEOHead
        title={`${entry.title} - Member Journal | Spit Hierarchy`}
        description={entry.excerpt || entry.title}
        canonicalUrl={`/journal/${username}/${slug}`}
      />
      <HeaderNavigation isScrolled={false} />

      <main className="flex-1 max-w-4xl mx-auto p-6 pt-24">
        {/* Back link */}
        <Link to={username ? `/user/${username}` : "/blog"} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> {username ? `Back to ${username}'s Profile` : "Back to Blog"}
        </Link>

        <Card className="bg-card border-border">
          <CardContent className="p-6 md:p-10 border-4 bg-black">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Member Journal
              </Badge>
              {isModOrAdmin && !(entry as any).is_flagged && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlagDialogOpen(true)}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <Flag className="w-3 h-3 mr-1" /> Flag
                </Button>
              )}
              {isModOrAdmin && (entry as any).is_flagged && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Flagged
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {entry.title}
            </h1>

            {/* Author info */}
            <div className="flex items-center gap-3 text-muted-foreground mb-8 pb-6 border-b border-border">
              <User className="w-4 h-4" />
              <Link to={`/user/${username}`} className="hover:text-foreground transition-colors font-medium">
                {profile?.full_name || username}
              </Link>
              <span>•</span>
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(entry.created_at), "MMMM d, yyyy")}</span>
            </div>

            {/* Content */}
            <div
              className="prose prose-invert max-w-none text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={renderContent(entry.content)}
            />
          </CardContent>
        </Card>
      </main>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will unpublish the entry and revert it to draft status.
            </p>
            <div>
              <Label htmlFor="flag-reason">Reason for flagging</Label>
              <Input
                id="flag-reason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="e.g., Inappropriate content, spam..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleFlag}
              disabled={!flagReason.trim() || flagEntry.isPending}
            >
              Flag & Unpublish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTopButton hasCommentBubble={false} />
      <Footer />
    </div>
  );
};

export default JournalEntryDetail;
