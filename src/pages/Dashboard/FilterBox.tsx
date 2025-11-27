// ============================================================================
// FILE LOCATION: RightPanelView/FilterBox.tsx (UPDATED)
// ============================================================================

import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PeopleFilter from "@/components/explorer/explorerView/FilterPeople";
import type { UserItem } from "@/config/store/useAppConfigStore";

const fileTypes = [
  { 
    value: "", 
    label: "All Types",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5 1.5V13.5M1.5 7.5H13.5" stroke="#434343" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    value: "docs", 
    label: "Docs", 
    icon: (
      <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.13411 0.800051H2.46745C2.02542 0.800051 1.6015 0.975646 1.28894 1.28821C0.976376 1.60077 0.800781 2.02469 0.800781 2.46672V15.8001C0.800781 16.2421 0.976376 16.666 1.28894 16.9786C1.6015 17.2911 2.02542 17.4667 2.46745 17.4667H12.4674C12.9095 17.4667 13.3334 17.2911 13.646 16.9786C13.9585 16.666 14.1341 16.2421 14.1341 15.8001V5.80005M9.13411 0.800051C9.39791 0.799624 9.65918 0.851387 9.90289 0.952359C10.1466 1.05333 10.3679 1.20152 10.5541 1.38838L13.5441 4.37838C13.7315 4.56464 13.8801 4.78617 13.9814 5.03019C14.0826 5.2742 14.1345 5.53586 14.1341 5.80005M9.13411 0.800051V4.96672C9.13411 5.18773 9.22191 5.39969 9.37819 5.55597C9.53447 5.71225 9.74643 5.80005 9.96745 5.80005L14.1341 5.80005" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    value: "folder", 
    label: "Folders", 
    icon: (
      <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8008 14.9667C16.2428 14.9667 16.6667 14.7911 16.9793 14.4786C17.2919 14.166 17.4674 13.7421 17.4674 13.3V4.96672C17.4674 4.52469 17.2919 4.10076 16.9793 3.7882C16.6667 3.47564 16.2428 3.30005 15.8008 3.30005H9.21745C8.93871 3.30278 8.66374 3.23556 8.4177 3.10453C8.17166 2.97351 7.96241 2.78286 7.80911 2.55005L7.13411 1.55005C6.98236 1.31961 6.77576 1.13045 6.53286 0.999546C6.28997 0.868644 6.01837 0.800094 5.74245 0.800049H2.46745C2.02542 0.800049 1.6015 0.975643 1.28894 1.2882C0.976376 1.60076 0.800781 2.02469 0.800781 2.46672V13.3C0.800781 13.7421 0.976376 14.166 1.28894 14.4786C1.6015 14.7911 2.02542 14.9667 2.46745 14.9667H15.8008Z" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    value: "image", 
    label: "Images",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8008 10.8L13.2291 8.22838C12.9166 7.91593 12.4927 7.7404 12.0508 7.7404C11.6088 7.7404 11.185 7.91593 10.8724 8.22838L3.30078 15.8M2.46745 0.800049H14.1341C15.0546 0.800049 15.8008 1.54624 15.8008 2.46672V14.1334C15.8008 15.0539 15.0546 15.8 14.1341 15.8H2.46745C1.54697 15.8 0.800781 15.0539 0.800781 14.1334V2.46672C0.800781 1.54624 1.54697 0.800049 2.46745 0.800049ZM7.46745 5.80005C7.46745 6.72052 6.72126 7.46672 5.80078 7.46672C4.88031 7.46672 4.13411 6.72052 4.13411 5.80005C4.13411 4.87957 4.88031 4.13338 5.80078 4.13338C6.72126 4.13338 7.46745 4.87957 7.46745 5.80005Z" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    value: "pdf", 
    label: "PDF",
    icon: (
      <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.13411 0.800051H2.46745C2.02542 0.800051 1.6015 0.975646 1.28894 1.28821C0.976376 1.60077 0.800781 2.02469 0.800781 2.46672V15.8001C0.800781 16.2421 0.976376 16.666 1.28894 16.9786C1.6015 17.2911 2.02542 17.4667 2.46745 17.4667H12.4674C12.9095 17.4667 13.3334 17.2911 13.646 16.9786C13.9585 16.666 14.1341 16.2421 14.1341 15.8001V5.80005M9.13411 0.800051C9.39791 0.799624 9.65918 0.851387 9.90289 0.952359C10.1466 1.05333 10.3679 1.20152 10.5541 1.38838L13.5441 4.37838C13.7315 4.56464 13.8801 4.78617 13.9814 5.03019C14.0826 5.2742 14.1345 5.53586 14.1341 5.80005M9.13411 0.800051V4.96672C9.13411 5.18773 9.22191 5.39969 9.37819 5.55597C9.53447 5.71225 9.74643 5.80005 9.96745 5.80005L14.1341 5.80005M5.80078 6.63338H4.13411M10.8008 9.96672H4.13411M10.8008 13.3001H4.13411" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    value: "video", 
    label: "Videos",
    icon: (
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.1341 0.800049H2.46745C1.54697 0.800049 0.800781 1.54624 0.800781 2.46672V14.1334C0.800781 15.0539 1.54697 15.8 2.46745 15.8H14.1341C15.0546 15.8 15.8008 15.0539 15.8008 14.1334V2.46672C15.8008 1.54624 15.0546 0.800049 14.1341 0.800049Z" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.80078 5.80255C5.80034 5.65466 5.83925 5.50932 5.91354 5.38144C5.98783 5.25356 6.09481 5.14776 6.2235 5.07489C6.35219 5.00202 6.49795 4.9647 6.64583 4.96678C6.7937 4.96886 6.93836 5.01026 7.06495 5.08672L11.2291 7.58422C11.3531 7.6581 11.4557 7.76292 11.527 7.8884C11.5983 8.01388 11.6358 8.15573 11.6358 8.30005C11.6358 8.44437 11.5983 8.58621 11.527 8.7117C11.4557 8.83718 11.3531 8.94199 11.2291 9.01588L7.06495 11.5134C6.9383 11.5899 6.79356 11.6313 6.64562 11.6333C6.49767 11.6354 6.35185 11.598 6.22313 11.525C6.09442 11.452 5.98745 11.3461 5.91322 11.2181C5.839 11.0901 5.80019 10.9447 5.80078 10.7967V5.80255Z" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    value: "zip", 
    label: "Zip Files",
    icon: (
      <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.84995 17.4667H12.4674C12.9095 17.4667 13.3334 17.2911 13.646 16.9786C13.9585 16.666 14.1341 16.2421 14.1341 15.8001V5.80006M14.1341 5.80006C14.1348 5.53598 14.0831 5.27439 13.9821 5.03038C13.8811 4.78638 13.7328 4.56478 13.5458 4.37839L10.5558 1.38839C10.3694 1.20132 10.1478 1.05302 9.90379 0.952042C9.65978 0.851063 9.39819 0.799407 9.13411 0.800055M14.1341 5.80006H9.96745C9.74643 5.80006 9.53447 5.71226 9.37819 5.55598C9.22191 5.3997 9.13411 5.18774 9.13411 4.96672V0.800055M9.13411 0.800055H2.46745C2.02542 0.800055 1.6015 0.97565 1.28894 1.28821C0.976376 1.60077 0.800781 2.02469 0.800781 2.46672V12.0501M4.13411 9.13339V8.30006M4.13411 14.1334V12.4667M4.13411 14.1334C3.21364 14.1334 2.46745 14.8796 2.46745 15.8001C2.46745 16.7205 3.21364 17.4667 4.13411 17.4667C5.05459 17.4667 5.80078 16.7205 5.80078 15.8001C5.80078 14.8796 5.05459 14.1334 4.13411 14.1334ZM4.13411 4.96672V4.13339" stroke="#434343" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
];

interface FilterButtonsProps {
  selectedTypeFilter: string;
  setSelectedTypeFilter: (value: string) => void;
  selectedUser: string;
  setSelectedUser: (value: string) => void;
  userData: UserItem[];
}

export default function FilterButtons({
  selectedTypeFilter,
  setSelectedTypeFilter,
  selectedUser,
  setSelectedUser,
  userData,
}: FilterButtonsProps) {
  const [openType, setOpenType] = useState(false);
  
  const clearTypeFilter = () => setSelectedTypeFilter("");
  const clearPersonFilter = () => setSelectedUser("");

  // Find selected type
  const selectedTypeObj = fileTypes.find((type) => type.value === selectedTypeFilter);

  return (
    <div className="flex py-6 pb-0 flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3">
        {/* Type Filter with Icons */}
        <Popover open={openType} onOpenChange={setOpenType}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openType}
              className="h-12 justify-between text-[16px] text-[#434343] bg-white hover:bg-gray-50 min-w-[180px]"
            >
              <div className="flex items-center gap-2">
                {selectedTypeObj?.icon && (
                  <span className="flex-shrink-0">{selectedTypeObj.icon}</span>
                )}
                <span>{selectedTypeObj?.label || "Select type..."}</span>
              </div>
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
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {fileTypes.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={type.label}
                      onSelect={() => {
                        setSelectedTypeFilter(type.value);
                        setOpenType(false);
                      }}
                      className="flex items-center gap-3 py-2"
                    >
                      <Check
                        className={`h-4 w-4 flex-shrink-0 ${
                          selectedTypeFilter === type.value
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      <span className="flex-shrink-0">{type.icon}</span>
                      <span>{type.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* People Filter - Now using reusable component */}
        <PeopleFilter
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          userData={userData}
        />
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