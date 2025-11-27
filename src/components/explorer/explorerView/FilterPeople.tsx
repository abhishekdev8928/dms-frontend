
import  { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { UserItem } from "@/config/store/useAppConfigStore";

interface PeopleFilterProps {
  selectedUser: string;
  setSelectedUser: (value: string) => void;
  userData: UserItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  minWidth?: string;
}

export default function PeopleFilter({
  selectedUser,
  setSelectedUser,
  userData,
  placeholder = "Select person...",
  searchPlaceholder = "Search person...",
  emptyMessage = "No person found.",
  className = "",
  minWidth = "200px",
}: PeopleFilterProps) {
  const [open, setOpen] = useState(false);

  // Find selected user object
  const selectedUserObj = userData?.find((user) => user.email === selectedUser);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`h-12 justify-between text-[16px] text-[#434343] bg-white hover:bg-gray-50 ${className}`}
          style={{ minWidth }}
        >
          {selectedUserObj ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {selectedUserObj.profilePic}
              </div>
              <span className="truncate">{selectedUserObj.username}</span>
            </div>
          ) : (
            placeholder
          )}
          <svg 
            width="10" 
            className="ml-2 h-3 w-3 text-gray-400 flex-shrink-0" 
            height="5" 
            viewBox="0 0 10 5" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id="path-1-inside-1_381_583" fill="white">
              <path d="M0 0L5 5L10 0"/>
            </mask>
            <path d="M0 0L5 5L10 0" fill="#434343"/>
            <path d="M1.41421 -1.41421L0 -2.82843L-2.82843 0L-1.41421 1.41421L0 0L1.41421 -1.41421ZM5 5L3.58579 6.41421L5 7.82843L6.41421 6.41421L5 5ZM11.4142 1.41421L12.8284 0L10 -2.82843L8.58579 -1.41421L10 0L11.4142 1.41421ZM0 0L-1.41421 1.41421L3.58579 6.41421L5 5L6.41421 3.58579L1.41421 -1.41421L0 0ZM5 5L6.41421 6.41421L11.4142 1.41421L10 0L8.58579 -1.41421L3.58579 3.58579L5 5Z" fill="#434343" mask="url(#path-1-inside-1_381_583)"/>
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {userData?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.username} ${user.email}`}
                  onSelect={() => {
                    setSelectedUser(
                      user.email === selectedUser ? "" : user.email
                    );
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-2"
                >
                  <Check
                    className={`h-4 w-4 flex-shrink-0 ${
                      selectedUser === user.email
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {user.profilePic}
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className="font-medium text-sm truncate">
                      {user.username}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
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
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Basic usage:
<PeopleFilter
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  userData={userList}
/>

// With custom styling:
<PeopleFilter
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  userData={userList}
  className="border-2 border-blue-500"
  minWidth="250px"
/>

// With custom text:
<PeopleFilter
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  userData={userList}
  placeholder="Choose a team member..."
  searchPlaceholder="Find team member..."
  emptyMessage="No team members found."
/>
*/