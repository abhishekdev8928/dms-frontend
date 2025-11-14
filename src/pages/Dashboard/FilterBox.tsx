import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

const fileTypes = [
  { value: "", label: "All Types" },
  { value: "folder", label: "Folders" },
  { value: "pdf", label: "PDF" },
  { value: "docs", label: "Docs" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "zip", label: "Zip Files" },
];

// ✅ Add proper TypeScript interface
interface User {
  id: string;
  name: string;
  email: string;
  profilePic: string;
}

interface FilterButtonsProps {
  selectedTypeFilter: string;
  setSelectedTypeFilter: (value: string) => void;
  selectedUser: string;
  setSelectedUser: (value: string) => void;
  userData?: { data: User[] };
}

export default function FilterButtons({
  selectedTypeFilter,
  setSelectedTypeFilter,
  selectedUser,
  setSelectedUser,
  userData,
}: FilterButtonsProps) {
  const [openPeople, setOpenPeople] = useState(false);
  const clearTypeFilter = () => setSelectedTypeFilter("");
  const clearPersonFilter = () => setSelectedUser("");
  const users = userData?.data || [];

  // ✅ Find selected user object
  const selectedUserObj = users.find((user) => user.email === selectedUser);

  return (
    <div className="flex py-6 flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3">
        {/* Type Filter */}
        <div className="relative inline-flex items-center">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="appearance-none h-9 px-4 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50"
          >
            {fileTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* People Filter */}
        <Popover open={openPeople} onOpenChange={setOpenPeople}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPeople}
              className="h-9 justify-between bg-white hover:bg-gray-50 min-w-[200px]"
            >
              {/* ✅ Show user name when selected */}
              {selectedUserObj ? (
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {selectedUserObj.profilePic}
                  </div>
                  <span className="truncate">
                    {selectedUserObj.name}
                  </span>
                </div>
              ) : (
                "Select person..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0">
            <Command>
              <CommandInput placeholder="Search person..." />
              <CommandList>
                <CommandEmpty>No person found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.name} ${user.email}`}
                      onSelect={() => {
                        setSelectedUser(
                          user.email === selectedUser ? "" : user.email
                        );
                        setOpenPeople(false);
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
                          {user.name}
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
      </div>

      {/* Clear All Filters Button */}
      {(selectedTypeFilter || selectedUser) && (
        <Button
          variant="ghost"
          onClick={() => {
            clearTypeFilter();
            clearPersonFilter();
          }}
          className="h-9 text-sm text-gray-600 hover:text-gray-900"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}