import { Button } from "@/components/ui/button";
import type { ViewMode } from "@/config/store/useAppConfigStore";

interface ViewToggleButtonsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showInfoPanel: boolean;
  onToggleInfoPanel: () => void;
}

export const ViewToggleButtons = ({
  viewMode,
  onViewModeChange,
  showInfoPanel,
  onToggleInfoPanel,
}: ViewToggleButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="icon"
          onClick={() => onViewModeChange("list")}
          className={
            viewMode === "list"
              ? "bg-[#035C4C] hover:bg-[#035C4C] rounded-e-[0px] border border-[#035C4C] py-5 px-5 border-2"
              : "border-2 rounded-e-[0px] border-[#434343] py-5 px-5"
          }
        >
          <svg
            width="20"
            height="16"
            viewBox="0 0 20 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1H1.01M1 8H1.01M1 15H1.01M6 1H19M6 8H19M6 15H19"
              stroke={viewMode === "list" ? "white" : "black"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="icon"
          onClick={() => onViewModeChange("grid")}
          className={
            viewMode === "grid"
              ? "bg-[#035C4C] hover:bg-[#035C4C]-600 rounded-s-[0px] border-[#035C4C] py-5 px-5 border-2"
              : "border-2 py-5 px-5 rounded-s-[0px] border-[#434343]"
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 1H2C1.44772 1 1 1.44772 1 2V7C1 7.55228 1.44772 8 2 8H7C7.55228 8 8 7.55228 8 7V2C8 1.44772 7.55228 1 7 1Z"
              stroke={viewMode === "list" ? "black" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 1H13C12.4477 1 12 1.44772 12 2V7C12 7.55228 12.4477 8 13 8H18C18.5523 8 19 7.55228 19 7V2C19 1.44772 18.5523 1 18 1Z"
              stroke={viewMode === "list" ? "black" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 12H13C12.4477 12 12 12.4477 12 13V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V13C19 12.4477 18.5523 12 18 12Z"
              stroke={viewMode === "list" ? "black" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 12H2C1.44772 12 1 12.4477 1 13V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V13C8 12.4477 7.55228 12 7 12Z"
              stroke={viewMode === "list" ? "black" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleInfoPanel}
        className={showInfoPanel ? "bg-gray-100" : ""}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 15V11M11 7H11.01M21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11Z"
            stroke="#434343"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  );
};
