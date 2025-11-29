import React, { useState, useEffect } from "react";
import { X, Copy, Mail, ChevronDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppConfigStore } from "@/config/store/useAppConfigStore";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type { FileItem } from "@/types/documentTypes";
import * as ACLApi from "@/config/api/accessControlListApi"; // Import the ACL API

type Visibility = "public" | "private" | "restricted";
type Permission =
  | "view"
  | "download"
  | "upload"
  | "delete"
  | "change_visibility";

interface UserPermission {
  userId: string;
  permissions: Permission[];
}

interface ShareSettings {
  type: string;
  visibility: Visibility;
  users?: UserPermission[];
  id: string;
}

const PERMISSION_LABELS: Record<Permission, string> = {
  view: "View",
  download: "Download",
  upload: "Upload",
  delete: "Delete",
  change_visibility: "Change Visibility",
};

const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  view: "Can open/preview the file",
  download: "Can download the file",
  upload: "Can upload new versions",
  delete: "Can delete the file",
  change_visibility: "Can update Public/Private/Restricted settings",
};

export const ShareModal = ({
  isOpen,
  onOpenChange,
  onSave,
  initialSettings,
  item,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: ShareSettings) => void;
  initialSettings?: ShareSettings;
  item: FileItem | null;
}) => {
  const userList = useAppConfigStore((state) => state.userList);

  const [visibility, setVisibility] = useState<Visibility>(
    initialSettings?.visibility || "private"
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    initialSettings?.users?.map((u) => u.userId) || []
  );
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>(
    initialSettings?.users || []
  );
  const [openUserPicker, setOpenUserPicker] = useState(false);
  const [openVisibilityPicker, setOpenVisibilityPicker] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingACL, setExistingACL] = useState<ACLApi.ACL | null>(null);

  // Fetch existing ACL when modal opens
  useEffect(() => {
    const fetchACL = async () => {
      if (!item || !isOpen) return;

      setLoading(true);
      try {
        const response = await ACLApi.getACL(item._id);
        if (response.success && response.data) {
          setExistingACL(response.data);
          setVisibility(response.data.visibility);
          
          // Map users from ACL
          const aclUsers = response.data.users.map(u => ({
            userId: u.userId,
            permissions: u.permissions as Permission[]
          }));
          setUserPermissions(aclUsers);
          setSelectedUsers(aclUsers.map(u => u.userId));
        }
      } catch (error: any) {
        // ACL might not exist yet, which is fine
        if (error.response?.status !== 404) {
          console.error("Error fetching ACL:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchACL();
  }, [item, isOpen]);

  const addUserToSelection = async (userId: string) => {
    if (!selectedUsers.includes(userId) && item) {
      const newPermissions: Permission[] = ["view"];
      
      setSelectedUsers((prev) => [...prev, userId]);
      setUserPermissions((prev) => [
        ...prev,
        { userId, permissions: newPermissions },
      ]);

      // If ACL exists and visibility is restricted, add user immediately
      if (existingACL && visibility === "restricted") {
        try {
          await ACLApi.addUser(item._id, userId, newPermissions);
          toast({
            title: "User added",
            description: "User has been granted access with view permission",
          });
        } catch (error) {
          console.error("Error adding user:", error);
          toast({
            title: "Error",
            description: "Failed to add user. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
    setSearchValue("");
    setOpenUserPicker(false);
  };

  const removeSelectedUser = async (userId: string) => {
    if (!item) return;

    // Remove from local state
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    setUserPermissions((prev) => prev.filter((up) => up.userId !== userId));
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });

    // If ACL exists, remove user from backend
    if (existingACL) {
      try {
        await ACLApi.removeUser(item._id, userId);
        toast({
          title: "Access removed",
          description: "User access has been removed",
        });
      } catch (error) {
        console.error("Error removing user:", error);
        toast({
          title: "Error",
          description: "Failed to remove user access",
          variant: "destructive",
        });
      }
    }
  };

  const toggleUserPermission = async (userId: string, permission: Permission) => {
    if (!item) return;

    const userPerm = userPermissions.find(up => up.userId === userId);
    if (!userPerm) return;

    const hasPermission = userPerm.permissions.includes(permission);
    const newPermissions = hasPermission
      ? userPerm.permissions.filter((p) => p !== permission)
      : [...userPerm.permissions, permission];

    // Update local state
    setUserPermissions((prev) =>
      prev.map((up) => {
        if (up.userId === userId) {
          return { ...up, permissions: newPermissions };
        }
        return up;
      })
    );

    // Update backend if ACL exists
    if (existingACL && visibility === "restricted") {
      try {
        await ACLApi.updateUserPermissions(item._id, userId, newPermissions);
      } catch (error) {
        console.error("Error updating permissions:", error);
        toast({
          title: "Error",
          description: "Failed to update permissions",
          variant: "destructive",
        });
      }
    }
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

  const handleVisibilityChange = async (newVisibility: Visibility) => {
    if (!item) return;

    const oldVisibility = visibility;
    setVisibility(newVisibility);
    setOpenVisibilityPicker(false);

    // Update backend if ACL exists
    if (existingACL) {
      try {
        await ACLApi.updateVisibility(item._id, newVisibility);
        toast({
          title: "Visibility updated",
          description: `Resource is now ${newVisibility}`,
        });
      } catch (error) {
        console.error("Error updating visibility:", error);
        setVisibility(oldVisibility); // Revert on error
        toast({
          title: "Error",
          description: "Failed to update visibility",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!item) {
      toast({
        title: "Error",
        description: "No item selected for sharing",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const resourceType = item.type === "folder" ? "folder" : "file";

      // Check if ACL exists
      if (!existingACL) {
        // Create new ACL based on visibility
        let aclResponse;
        
        if (visibility === "public") {
          aclResponse = await ACLApi.createPublicACL(item._id, resourceType);
          console.log("Created public ACL:", aclResponse);
        } else if (visibility === "private") {
          aclResponse = await ACLApi.createPrivateACL(item._id, resourceType);
          console.log("Created private ACL:", aclResponse);
        } else if (visibility === "restricted") {
          // Create ACL with users
          aclResponse = await ACLApi.createACL({
            resourceId: item._id,
            type: resourceType,
            visibility: "restricted",
            users: userPermissions.map(up => ({
              userId: up.userId,
              permissions: up.permissions
            })),
          });
          console.log("Created restricted ACL:", aclResponse);
        }

        if (aclResponse?.success) {
          setExistingACL(aclResponse.data);
          toast({
            title: "Success",
            description: "Sharing settings created successfully",
          });
        }
      } else {
        // For existing ACL, ensure all changes are synced
        console.log("Syncing existing ACL changes...");
        
        // Update visibility if changed
        if (existingACL.visibility !== visibility) {
          await ACLApi.updateVisibility(item._id, visibility);
          console.log("Updated visibility to:", visibility);
        }

        // For restricted visibility, sync all user permissions
        if (visibility === "restricted") {
          // Get current users in ACL
          const currentUserIds = existingACL.users.map(u => u.userId);
          const newUserIds = userPermissions.map(u => u.userId);

          // Add new users
          for (const userPerm of userPermissions) {
            if (!currentUserIds.includes(userPerm.userId)) {
              await ACLApi.addUser(item._id, userPerm.userId, userPerm.permissions);
              console.log("Added user:", userPerm.userId);
            } else {
              // Update existing user permissions
              await ACLApi.updateUserPermissions(item._id, userPerm.userId, userPerm.permissions);
              console.log("Updated permissions for:", userPerm.userId);
            }
          }

          // Remove users not in the list anymore
          for (const userId of currentUserIds) {
            if (!newUserIds.includes(userId)) {
              await ACLApi.removeUser(item._id, userId);
              console.log("Removed user:", userId);
            }
          }
        }

        toast({
          title: "Success",
          description: "Sharing settings updated successfully",
        });
      }

      const settings: ShareSettings = {
        type: resourceType,
        id: item._id,
        visibility,
        ...(visibility === "restricted" && { users: userPermissions }),
      };

      console.log("Final settings:", settings);
      onSave(settings);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving ACL:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save sharing settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!item) return;

    try {
      const link = `${window.location.origin}/file/${item._id}`;
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const availableUsers = userList.filter(
    (user) => !selectedUsers.includes(user.id)
  );

  const getDisplayName = () => {
    if (!item) return "File";
    if (item.type === "folder") return item.name;
    return item.extension ? `${item.name}.${item.extension}` : item.name;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Share "{getDisplayName()}"
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
              {/* Add People Section - Only for Restricted */}
              {visibility === "restricted" && (
                <div className="mb-6">
                  <Popover open={openUserPicker} onOpenChange={setOpenUserPicker}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          placeholder="Add people, groups, spaces and calendar events"
                          value={searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            setOpenUserPicker(true);
                          }}
                          className="pr-10"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search users..."
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            {availableUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.username} ${user.email}`}
                                onSelect={() => addUserToSelection(user.id)}
                                className="flex items-center gap-3 py-3 cursor-pointer"
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={user.profilePic}
                                    alt={user.username}
                                  />
                                  <AvatarFallback>
                                    {getInitials(user.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden flex-1">
                                  <span className="font-medium text-sm truncate">
                                    {user.username}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* People with Access */}
              {visibility === "restricted" && selectedUsers.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">People with access</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Owner (You) */}
                    <div className="flex items-center gap-3 py-2 px-2 rounded hover:bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Abhishek Sharma (you)</p>
                        <p className="text-xs text-muted-foreground truncate">
                          abhishek.sharma@digihost.in
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">Owner</span>
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.map((userId) => {
                      const user = userList.find((u) => u.id === userId);
                      const userPerm = userPermissions.find(
                        (up) => up.userId === userId
                      );
                      const isExpanded = expandedUsers.has(userId);

                      if (!user || !userPerm) return null;

                      return (
                        <div key={userId} className="border rounded-lg">
                          {/* User Header */}
                          <div className="flex items-center gap-3 py-2 px-2 hover:bg-muted">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={user.profilePic}
                                alt={user.username}
                              />
                              <AvatarFallback>
                                {getInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{user.username}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(userId)}
                              className="h-8"
                            >
                              <span className="text-xs mr-1">
                                {getPermissionSummary(userPerm.permissions)}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </div>

                          {/* Expanded Permissions */}
                          {isExpanded && (
                            <div className="px-4 py-3 bg-muted/30 border-t">
                              <div className="space-y-3">
                                {(
                                  [
                                    "view",
                                    "download",
                                    "upload",
                                    "delete",
                                    "change_visibility",
                                  ] as Permission[]
                                ).map((permission) => (
                                  <div
                                    key={permission}
                                    className="flex items-start gap-3"
                                  >
                                    <Checkbox
                                      id={`${userId}-${permission}`}
                                      checked={userPerm.permissions.includes(
                                        permission
                                      )}
                                      onCheckedChange={() =>
                                        toggleUserPermission(userId, permission)
                                      }
                                      className="mt-0.5"
                                    />
                                    <Label
                                      htmlFor={`${userId}-${permission}`}
                                      className="cursor-pointer flex-1"
                                    >
                                      <div className="font-medium text-sm">
                                        {PERMISSION_LABELS[permission]}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {PERMISSION_DESCRIPTIONS[permission]}
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-3" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSelectedUser(userId)}
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Remove access
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* General Access */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">General access</h3>

                <Popover
                  open={openVisibilityPicker}
                  onOpenChange={setOpenVisibilityPicker}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3 px-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-green-100">
                          <AvatarFallback className="bg-green-100">
                            {visibility === "restricted"
                              ? "🔒"
                              : visibility === "public"
                              ? "🌐"
                              : "👤"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-medium text-sm">
                            {visibility === "restricted"
                              ? "Restricted"
                              : visibility === "public"
                              ? "Anyone with the link"
                              : "Private"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {visibility === "restricted"
                              ? "Only people with access can open with the link"
                              : visibility === "public"
                              ? "Anyone on the Internet with the link can view"
                              : "Only you can access"}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-2" align="start">
                    <RadioGroup
                      value={visibility}
                      onValueChange={handleVisibilityChange}
                    >
                      <div className="space-y-1">
                        {/* Restricted */}
                        <Label
                          htmlFor="restricted"
                          className="flex items-center gap-3 p-3 rounded hover:bg-muted cursor-pointer"
                        >
                          <RadioGroupItem value="restricted" id="restricted" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">Restricted</div>
                            <div className="text-xs text-muted-foreground">
                              Only people with access can open with the link
                            </div>
                          </div>
                        </Label>

                        {/* Public */}
                        <Label
                          htmlFor="public"
                          className="flex items-center gap-3 p-3 rounded hover:bg-muted cursor-pointer"
                        >
                          <RadioGroupItem value="public" id="public" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Anyone with the link
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Anyone on the Internet with the link can view
                            </div>
                          </div>
                        </Label>

                        {/* Private */}
                        <Label
                          htmlFor="private"
                          className="flex items-center gap-3 p-3 rounded hover:bg-muted cursor-pointer"
                        >
                          <RadioGroupItem value="private" id="private" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">Private</div>
                            <div className="text-xs text-muted-foreground">
                              Only you can access
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </PopoverContent>
                </Popover>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};