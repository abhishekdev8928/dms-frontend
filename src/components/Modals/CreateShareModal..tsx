import React, { useState } from "react";
import { X, Copy, Mail, ChevronDown } from "lucide-react";
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
import type { FileItem } from "@/types/documentTypes";

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
  type:string,
  visibility: Visibility;
  users?: UserPermission[];
  id:string
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

  console.log("from shared part:",item)
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

  const addUserToSelection = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => [...prev, userId]);
      setUserPermissions((prev) => [
        ...prev,
        { userId, permissions: ["view"] },
      ]);
    }
    setSearchValue("");
    setOpenUserPicker(false);
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    setUserPermissions((prev) => prev.filter((up) => up.userId !== userId));
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const toggleUserPermission = (userId: string, permission: Permission) => {
    setUserPermissions((prev) =>
      prev.map((up) => {
        if (up.userId === userId) {
          const hasPermission = up.permissions.includes(permission);
          return {
            ...up,
            permissions: hasPermission
              ? up.permissions.filter((p) => p !== permission)
              : [...up.permissions, permission],
          };
        }
        return up;
      })
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

  const handleSave = () => {
    if (!item) {
      console.error("No item selected for sharing");
      return;
    }

    const settings: ShareSettings = {
      type: item.type === "folder" ? "folder" : "file",
      id: item._id,
      visibility,
      ...(visibility === "restricted" && { users: userPermissions }),
    };

    console.log(settings);

    onSave(settings);
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

  // Get display name for the file/folder
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
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  onValueChange={(value) => {
                    setVisibility(value as Visibility);
                    setOpenVisibilityPicker(false);
                  }}
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
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy link
          </Button>
          <Button onClick={handleSave}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
