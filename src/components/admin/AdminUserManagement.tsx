
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminTabHeader from "./AdminTabHeader";
import { Users, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

const ROLE_MAP: Record<string, string> = {
  user: "Regular User",
  blog_editor: "Staff Writer",
  moderator: "Moderator",
  admin: "Admin",
};

const UI_TO_DB_ROLE: Record<string, string> = {
  "Regular User": "user",
  "Staff Writer": "staff_writer",
  "Moderator": "moderator",
  "Admin": "admin",
};

const PAGE_SIZE = 50;

const AdminUserManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pendingChange, setPendingChange] = useState<{ userId: string; username: string; newRole: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ userId: string; username: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users_paginated", {
        page_number: page,
        page_size: PAGE_SIZE,
        search_term: search,
      });
      if (error) throw error;
      return data as unknown as { users: UserRow[]; total_count: number };
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.rpc("set_user_role", {
        target_user_id: userId,
        new_role: role,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const users = data?.users || [];
  const totalCount = data?.total_count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleRoleSelect = (userId: string, username: string, uiLabel: string) => {
    const dbRole = UI_TO_DB_ROLE[uiLabel];
    if (!dbRole) return;
    setPendingChange({ userId, username, newRole: uiLabel });
  };

  const confirmRoleChange = () => {
    if (!pendingChange) return;
    const dbRole = UI_TO_DB_ROLE[pendingChange.newRole];
    mutation.mutate({ userId: pendingChange.userId, role: dbRole });
    setPendingChange(null);
  };

  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const confirmDeleteUser = async () => {
    if (!pendingDelete) return;
    setIsDeletingUser(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        body: { target_user_id: pendingDelete.userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`User ${pendingDelete.username} has been deleted`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setIsDeletingUser(false);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <AdminTabHeader title="User Management" icon={Users} description="Manage user roles and permissions" />

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--theme-text))] opacity-50" />
          <Input
            placeholder="Search by username or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-[hsl(var(--theme-background))] border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))]"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-background))] hover:opacity-90"
        >
          Search
        </Button>
      </div>

      <div className="text-sm text-[hsl(var(--theme-text))] opacity-70 mb-2">
        {totalCount} user{totalCount !== 1 ? "s" : ""} found
      </div>

      <div className="rounded-lg border border-[hsl(var(--theme-primary))] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[hsl(var(--theme-primary))]">
              <TableHead className="text-[hsl(var(--theme-primary))] font-bold">Username</TableHead>
              <TableHead className="text-[hsl(var(--theme-primary))] font-bold hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-[hsl(var(--theme-primary))] font-bold">Role</TableHead>
              <TableHead className="text-[hsl(var(--theme-primary))] font-bold hidden md:table-cell">Joined</TableHead>
              <TableHead className="text-[hsl(var(--theme-primary))] font-bold w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[hsl(var(--theme-text))] py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[hsl(var(--theme-text))] py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-[hsl(var(--theme-primary))]/30">
                  <TableCell className="text-[hsl(var(--theme-text))] font-medium">
                    <div className="flex items-center gap-2">
                      {user.avatar_url && (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      {user.username}
                    </div>
                  </TableCell>
                  <TableCell className="text-[hsl(var(--theme-text))] hidden sm:table-cell text-sm opacity-80">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <ThemedSelect
                      value={ROLE_MAP[user.role] || "Regular User"}
                      onValueChange={(val) => handleRoleSelect(user.id, user.username, val)}
                    >
                      <ThemedSelectTrigger className="w-[140px] h-8 text-xs">
                        <ThemedSelectValue />
                      </ThemedSelectTrigger>
                      <ThemedSelectContent>
                        <ThemedSelectItem value="Regular User">Regular User</ThemedSelectItem>
                        <ThemedSelectItem value="Staff Writer">Staff Writer</ThemedSelectItem>
                        <ThemedSelectItem value="Moderator">Moderator</ThemedSelectItem>
                        <ThemedSelectItem value="Admin">Admin</ThemedSelectItem>
                      </ThemedSelectContent>
                    </ThemedSelect>
                  </TableCell>
                  <TableCell className="text-[hsl(var(--theme-text))] hidden md:table-cell text-sm opacity-70">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete({ userId: user.id, username: user.username })}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-[hsl(var(--theme-text))]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingChange} onOpenChange={() => setPendingChange(null)}>
        <AlertDialogContent className="bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-primary))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(var(--theme-primary))]">Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--theme-text))]">
              Change <strong>{pendingChange?.username}</strong>'s role to <strong>{pendingChange?.newRole}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              className="bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-background))]"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
        <AlertDialogContent className="bg-[hsl(var(--theme-surface))] border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete User Account</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--theme-text))]">
              Permanently delete <strong>{pendingDelete?.username}</strong>'s account and all their data? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={isDeletingUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingUser ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserManagement;
