import React, { useState, useEffect } from "react";
import { Copy, ChevronDown, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";
import { toast } from "sonner";

// Import hooks
import { useResourceAccess } from "@/hooks/queries/useShareQueries";
import { useShareMutations } from "@/hooks/mutations/useShareMutations";
import type { Permission, ResourceType } from "@/config/types/shareTypes";

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: IFileSystemItem | null;
}

const PERMISSION_LABELS: Record<Permission, string> = {
  view: "View",
  download: "Download",
  upload: "Upload",
  delete: "Delete",
  share: "Share",
};

const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  view: "Can open/preview the file",
  download: "Can download the file",
  upload: "Can upload new versions",
  delete: "Can delete the file",
  share: "Can share with others",
};

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onOpenChange,
  item,
}) => {
  const userList = useAppConfigStore((state) => state.userList);
  const currentUser = useAppConfigStore((state) => state.user);

  // Local state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<{ userId: string; permissions: Permission[] }[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Determine resource type and ID
  const resourceType: ResourceType = item?.type === "folder" ? "folder" : "document";
  const resourceId = item?._id || "";

  const {
    data: accessData,
    isLoading: isLoadingAccess,
    isFetching,
    refetch,
  } = useResourceAccess(resourceType, resourceId, {
    enabled: isOpen && !!resourceId,
    refetchOnMount: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const {
    shareResourceMutation,
    updatePermissionsMutation,
    removeAccessMutation,
  } = useShareMutations();

  // ✅ FIX: Better state management - Reset and refetch when modal opens
  useEffect(() => {
    if (isOpen && resourceId) {
      console.log("🔄 Modal opened - resetting state and refetching");
      
      // Reset state first
      setSelectedUsers([]);
      setUserPermissions([]);
      setExpandedUsers(new Set());
      setSearchValue("");
      setShowUserList(false);
      
      // Then refetch
      refetch();
    }
  }, [isOpen, resourceId]);

  // ✅ FIX: Sync fetched data with local state - with proper checks
  useEffect(() => {
    // Only sync when modal is open and we have data (not fetching)
    if (!isOpen || isFetching) return;

    console.log("📊 Syncing data:", accessData?.data?.usersWithAccess);

    if (accessData?.data?.usersWithAccess) {
      const users = accessData.data.usersWithAccess;
      
      if (users.length > 0) {
        const existingUsers = users.map((user) => user.userId);
        const existingPermissions = users.map((user) => ({
          userId: user.userId,
          permissions: user.permissions,
        }));

        console.log("✅ Setting users:", existingUsers);
        setSelectedUsers(existingUsers);
        setUserPermissions(existingPermissions);
      } else {
        // Explicitly handle empty case
        console.log("✅ No users with access - clearing state");
        setSelectedUsers([]);
        setUserPermissions([]);
      }
    }
  }, [accessData, isOpen, isFetching]);

  const addUserToSelection = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      const newPermissions: Permission[] = ["view"];

      setSelectedUsers((prev) => [...prev, userId]);
      setUserPermissions((prev) => [
        ...prev,
        { userId, permissions: newPermissions },
      ]);
      setExpandedUsers((prev) => new Set([...prev, userId]));
    }
    setSearchValue("");
    setShowUserList(false);
  };

  const removeSelectedUser = async (userId: string) => {
    const hasExistingAccess = accessData?.data?.usersWithAccess.some(
      (user) => user.userId === userId
    );

    if (hasExistingAccess && resourceId) {
      try {
        await removeAccessMutation.mutateAsync({
          resourceType,
          resourceId,
          userId,
        });
        // Don't need to manually refetch - mutation handles invalidation
      } catch (error) {
        return;
      }
    } else {
      // Just remove from local state if not saved yet
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
      setUserPermissions((prev) => prev.filter((up) => up.userId !== userId));
      setExpandedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const toggleUserPermission = (userId: string, permission: Permission) => {
    const userPerm = userPermissions.find((up) => up.userId === userId);
    if (!userPerm) return;

    const hasPermission = userPerm.permissions.includes(permission);
    const newPermissions = hasPermission
      ? userPerm.permissions.filter((p) => p !== permission)
      : [...userPerm.permissions, permission];

    if (newPermissions.length === 0) {
      toast.error("User must have at least one permission");
      return;
    }

    setUserPermissions((prev) =>
      prev.map((up) =>
        up.userId === userId ? { ...up, permissions: newPermissions } : up
      )
    );
  };

  const toggleExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getPermissionSummary = (permissions: Permission[]) => {
    if (permissions.length === 0) return "No access";
    if (permissions.length === 5) return "Full access";
    if (permissions.length === 1) return PERMISSION_LABELS[permissions[0]];
    return `${permissions.length} permissions`;
  };

  const handleSave = async () => {
    if (!item || !resourceId) {
      toast.error("No item selected for sharing");
      return;
    }

    const existingUserIds =
      accessData?.data?.usersWithAccess.map((user) => user.userId) || [];

    const newUsers = userPermissions.filter(
      (up) => !existingUserIds.includes(up.userId)
    );
    const updatedUsers = userPermissions.filter((up) =>
      existingUserIds.includes(up.userId)
    );

    try {
      // Share with new users
      if (newUsers.length > 0) {
        await shareResourceMutation.mutateAsync({
          resourceType,
          resourceId,
          users: newUsers,
        });
      }

      // Update existing users
      for (const user of updatedUsers) {
        const existingUser = accessData?.data?.usersWithAccess.find(
          (u) => u.userId === user.userId
        );

        const existingPerms = [...(existingUser?.permissions || [])].sort();
        const newPerms = [...user.permissions].sort();
        
        if (JSON.stringify(existingPerms) !== JSON.stringify(newPerms)) {
          await updatePermissionsMutation.mutateAsync({
            resourceType,
            resourceId,
            userId: user.userId,
            permissions: user.permissions,
          });
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleCopyLink = async () => {
    if (!item) return;
    try {
      const link = `${window.location.origin}/file/${item._id}`;
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = userList.filter((user) => {
    if (selectedUsers.includes(user.id)) return false;
    if (user.id === currentUser?.id) return false;
    if (accessData?.data?.owner && user.id === accessData.data.owner.userId) return false;

    const searchLower = searchValue.toLowerCase().trim();
    if (!searchLower) return true;

    const username = user.username.toLowerCase();
    const email = user.email.toLowerCase();
    
    return username.includes(searchLower) || email.includes(searchLower);
  });

  const getDisplayName = () => {
    if (!item) return "File";
    if (item.type === "folder") return item.name;
    return item.extension ? `${item.name}.${item.extension}` : item.name;
  };

  const isSaving =
    shareResourceMutation.isPending ||
    updatePermissionsMutation.isPending ||
    removeAccessMutation.isPending;

  // ✅ Show loading while fetching
  const isLoading = isLoadingAccess || isFetching;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Share "{getDisplayName()}"
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="px-6">
              <div className="mb-6 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Click to add users or search..."
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      if (!showUserList) setShowUserList(true);
                    }}
                    onFocus={() => setShowUserList(true)}
                    onClick={() => setShowUserList(true)}
                    onBlur={() => {
                      setTimeout(() => setShowUserList(false), 200);
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {showUserList && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {searchValue ? "No users found" : "No more users to add"}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addUserToSelection(user.id);
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profilePic} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-3">People with access</h3>

                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {accessData?.data?.owner && (
                      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={accessData.data.owner.profilePic} />
                          <AvatarFallback className="bg-slate-600 text-white">
                            {getInitials(accessData.data.owner.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {accessData.data.owner.username}
                            {accessData.data.owner.userId === currentUser?.id && " (you)"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {accessData.data.owner.email}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Owner</span>
                      </div>
                    )}

                    {selectedUsers.map((userId) => {
                      const user = userList.find((u) => u.id === userId);
                      const userPerm = userPermissions.find((up) => up.userId === userId);
                      const isExpanded = expandedUsers.has(userId);

                      if (!user || !userPerm) return null;

                      return (
                        <div key={userId} className="border rounded-lg hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 py-2 px-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profilePic} />
                              <AvatarFallback>
                                {getInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{user.username}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(userId)}
                              className="text-xs hover:bg-gray-100"
                            >
                              {getPermissionSummary(userPerm.permissions)}
                              <ChevronDown
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="px-4 py-3 bg-gray-50 border-t">
                              <div className="space-y-3 mb-3">
                                {(["view", "download", "upload", "delete", "share"] as Permission[]).map(
                                  (permission) => (
                                    <div key={permission} className="flex items-start gap-3">
                                      <Checkbox
                                        id={`${userId}-${permission}`}
                                        checked={userPerm.permissions.includes(permission)}
                                        onCheckedChange={() =>
                                          toggleUserPermission(userId, permission)
                                        }
                                        className="mt-1"
                                      />
                                      <Label
                                        htmlFor={`${userId}-${permission}`}
                                        className="cursor-pointer text-sm flex-1"
                                      >
                                        <div className="font-medium">
                                          {PERMISSION_LABELS[permission]}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {PERMISSION_DESCRIPTIONS[permission]}
                                        </div>
                                      </Label>
                                    </div>
                                  )
                                )}
                              </div>
                              <Separator className="my-3" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSelectedUser(userId)}
                                disabled={removeAccessMutation.isPending}
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {removeAccessMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  "Remove access"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {selectedUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No users have been given access yet. Add users above to share.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};