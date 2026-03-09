import React, { useState } from "react";
import { BookOpen, Lock, Plus, Edit2, Trash2, Eye, EyeOff, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMemberJournal, JournalEntry } from "@/hooks/useMemberJournal";
import { format } from "date-fns";
import { TextSkeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MemberJournalSectionProps {
  memberStatus: string | null | undefined;
}

const GOLD_STATUSES = ["gold", "platinum", "diamond"];

const MemberJournalSection = ({ memberStatus }: MemberJournalSectionProps) => {
  const isUnlocked = GOLD_STATUSES.includes(memberStatus || "");

  if (!isUnlocked) {
    return <LockedTeaser />;
  }

  return <JournalManager />;
};

const LockedTeaser = () => (
  <div className="bg-black border-4 border-[hsl(var(--theme-primary))]/30 rounded-lg p-6 mb-6 sm:mb-8 shadow-lg shadow-[hsl(var(--theme-primary))]/10 relative overflow-hidden">
    {/* Lock overlay */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
      <Lock className="h-10 w-10 text-[hsl(var(--theme-primary))]/60 mb-3" />
      <p className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-lg font-bold mb-1">
        Gold Members Only
      </p>
      <p className="text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)] text-sm text-center max-w-xs px-4">
        Reach Gold status by earning XP through daily use of the site to unlock your personal Hip-Hop journal.
      </p>
    </div>

    {/* Blurred preview content */}
    <div className="opacity-40">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
        <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
          My Hip-Hop Journal
        </h3>
      </div>
      <p className="text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)] mb-4">
        Document your listening journey, share your takes on albums, artists, and the culture. 
        Make entries public to share with the community or keep them private.
      </p>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[hsl(var(--theme-surface))]/30 rounded-lg p-4 border border-[hsl(var(--theme-border))]/20">
            <TextSkeleton width="w-48" height="h-5" className="mb-2" />
            <TextSkeleton width="w-full" height="h-3" className="mb-1" />
            <TextSkeleton width="w-3/4" height="h-3" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const JournalManager = () => {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useMemberJournal();
  const [isComposing, setIsComposing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsPublic(false);
    setIsComposing(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setIsPublic(entry.is_public);
    setIsComposing(true);
  };

  const handleSave = (status: "draft" | "published") => {
    if (!title.trim() || !content.trim()) return;
    if (editingEntry) {
      updateEntry.mutate({ id: editingEntry.id, title, content, is_public: isPublic, status }, { onSuccess: resetForm });
    } else {
      createEntry.mutate({ title, content, is_public: isPublic, status }, { onSuccess: resetForm });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
          <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            My Hip-Hop Journal
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TextSkeleton key={i} width="w-full" height="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-4 border-[hsl(var(--theme-primary))] shadow-lg shadow-[hsl(var(--theme-primary))]/20 rounded-lg p-6 mb-6 sm:mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
          <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            My Hip-Hop Journal
          </h3>
        </div>
        {!isComposing && (
          <Button
            size="sm"
            onClick={() => setIsComposing(true)}
            className="bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-textLight))] hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Entry
          </Button>
        )}
      </div>

      <p className="text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)] mb-4">
        Document your listening journey, share your takes on albums, artists, and the culture.
      </p>

      {/* Compose / Edit Form */}
      {isComposing && (
        <div className="bg-[hsl(var(--theme-surface))]/50 border border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 mb-4 space-y-3">
          <Input
            placeholder="Entry title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black border-[hsl(var(--theme-border))] text-foreground"
          />
          <Textarea
            placeholder="Share your thoughts on your hip-hop journey..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-black border-[hsl(var(--theme-border))] text-foreground"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Eye className="h-4 w-4 text-[hsl(var(--theme-primary))]" />
              ) : (
                <EyeOff className="h-4 w-4 text-[hsl(var(--theme-textMuted))]" />
              )}
              <span className="text-sm text-[hsl(var(--theme-textMuted))] font-[var(--theme-font-body)]">
                {isPublic ? "Public" : "Private"}
              </span>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm} className="text-[hsl(var(--theme-textMuted))]">
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={!title.trim() || !content.trim() || createEntry.isPending || updateEntry.isPending}
                className="border-[hsl(var(--theme-primary))]/50 text-[hsl(var(--theme-primary))]"
              >
                <Save className="h-3 w-3 mr-1" />
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("published")}
                disabled={!title.trim() || !content.trim() || createEntry.isPending || updateEntry.isPending}
                className="bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-textLight))] hover:opacity-90"
              >
                <Send className="h-3 w-3 mr-1" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 && !isComposing ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4 font-[var(--theme-font-body)]">
            Your journal is empty. Start documenting your hip-hop journey!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 hover:border-[hsl(var(--theme-primary))]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground font-[var(--theme-font-heading)] truncate">
                      {entry.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {entry.status === "published" ? "Published" : "Draft"}
                    </span>
                    {entry.is_public ? (
                      <Eye className="h-3 w-3 text-[hsl(var(--theme-primary))]" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-[hsl(var(--theme-textMuted))]" />
                    )}
                  </div>
                  <p className="text-sm text-[hsl(var(--theme-textMuted))] line-clamp-2 mb-1">
                    {entry.excerpt || entry.content.substring(0, 150)}
                  </p>
                  <span className="text-xs text-[hsl(var(--theme-primary))] font-bold">
                    {format(new Date(entry.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--theme-textMuted))] hover:text-[hsl(var(--theme-primary))]" onClick={() => handleEdit(entry)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--theme-textMuted))] hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete journal entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{entry.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteEntry.mutate(entry.id)} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberJournalSection;
