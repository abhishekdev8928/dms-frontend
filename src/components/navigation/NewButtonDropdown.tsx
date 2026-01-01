import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import RequireRole from "@/components/RequireRole";
import { ROLES } from "@/utils/constant";

interface NewButtonDropdownProps {
  parentId?: string;
  fileUploadPending: boolean;
  folderUploadPending: boolean;
  onUserClick: () => void;
  onFileUploadClick: () => void;
  onFolderUploadClick: () => void;
  onCreateFolderClick: () => void;
  onCreateDepartmentClick: () => void;
}

export const NewButtonDropdown = ({
  parentId,
  fileUploadPending,
  folderUploadPending,
  onUserClick,
  onFileUploadClick,
  onFolderUploadClick,
  onCreateFolderClick,
  onCreateDepartmentClick,
}: NewButtonDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="shadow-[0px_4px_4px_0px_#035C4C40] text-[20px] h-[50px] w-[127px] justify-center gap-2"
          disabled={fileUploadPending || folderUploadPending}
        >
          {fileUploadPending || folderUploadPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[240px] p-[10px]">
        <RequireRole allowedRoles={[ROLES.SUPER_ADMIN]}>
          <DropdownMenuItem
            className="py-2 cursor-pointer hover:bg-[#F6FFFD] mb-1"
            onClick={onUserClick}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 11C12.7614 11 15 8.76142 15 6C15 3.23858 12.7614 1 10 1C7.23858 1 5 3.23858 5 6C5 8.76142 7.23858 11 10 11Z"
                stroke="#434343"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 19C1 16.8783 1.84285 14.8434 3.34315 13.3431C4.84344 11.8429 6.87827 11 9 11H11C13.1217 11 15.1566 11.8429 16.6569 13.3431C18.1571 14.8434 19 16.8783 19 19"
                stroke="#434343"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex-1">
              <div className="text-[16px] roboto">Add Users</div>
            </div>
          </DropdownMenuItem>
        </RequireRole>

        <DropdownMenuItem
          className={`py-2 cursor-pointer ${
            !parentId ? "opacity-50 cursor-not-allowed" : ""
          } hover:bg-[#F6FFFD] mb-1`}
          onClick={onFileUploadClick}
          disabled={fileUploadPending || !parentId}
        >
          <svg width="15" height="19" viewBox="0 0 15 19" fill="none">
            <path
              d="M9.13411 0.800051H2.46745C2.02542 0.800051 1.6015 0.975646 1.28894 1.28821C0.976376 1.60077 0.800781 2.02469 0.800781 2.46672V15.8001C0.800781 16.2421 0.976376 16.666 1.28894 16.9786C1.6015 17.2911 2.02542 17.4667 2.46745 17.4667H12.4674C12.9095 17.4667 13.3334 17.2911 13.646 16.9786C13.9585 16.666 14.1341 16.2421 14.1341 15.8001V5.80005M9.13411 0.800051C9.39791 0.799624 9.65918 0.851387 9.90289 0.952359C10.1466 1.05333 10.3679 1.20152 10.5541 1.38838L13.5441 4.37838C13.7315 4.56464 13.8801 4.78617 13.9814 5.03019C14.0826 5.2742 14.1345 5.53586 14.1341 5.80005M9.13411 0.800051V4.96672C9.13411 5.18773 9.22191 5.39969 9.37819 5.55597C9.53447 5.71225 9.74643 5.80005 9.96745 5.80005L14.1341 5.80005M7.46745 9.13338V14.1334M7.46745 9.13338L9.96745 11.6334M7.46745 9.13338L4.96745 11.6334"
              stroke="#434343"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1">
            <div className="text-[16px] roboto">File Upload</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={`py-2 cursor-pointer ${
            !parentId ? "opacity-50 cursor-not-allowed" : ""
          } hover:bg-[#F6FFFD] mb-1`}
          onClick={onFolderUploadClick}
          disabled={folderUploadPending || !parentId}
        >
          <svg width="19" height="16" viewBox="0 0 19 16" fill="none">
            <path
              d="M9.13411 6.63338V11.6334M9.13411 6.63338L6.63411 9.13338M9.13411 6.63338L11.6341 9.13338M15.8008 14.9667C16.2428 14.9667 16.6667 14.7911 16.9793 14.4786C17.2919 14.166 17.4674 13.7421 17.4674 13.3V4.96672C17.4674 4.52469 17.2919 4.10076 16.9793 3.7882C16.6667 3.47564 16.2428 3.30005 15.8008 3.30005H9.21745C8.93871 3.30278 8.66374 3.23556 8.4177 3.10453C8.17166 2.97351 7.96241 2.78286 7.80911 2.55005L7.13411 1.55005C6.98236 1.31961 6.77576 1.13045 6.53286 0.999546C6.28997 0.868644 6.01837 0.800094 5.74245 0.800049H2.46745C2.02542 0.800049 1.6015 0.975643 1.28894 1.2882C0.976376 1.60076 0.800781 2.02469 0.800781 2.46672V13.3C0.800781 13.7421 0.976376 14.166 1.28894 14.4786C1.6015 14.7911 2.02542 14.9667 2.46745 14.9667H15.8008Z"
              stroke="#434343"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1">
            <div className="text-[16px] roboto">Folder Upload</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={`py-2 cursor-pointer ${
            !parentId ? "opacity-50 cursor-not-allowed" : ""
          } hover:bg-[#F6FFFD] mb-1`}
          onClick={onCreateFolderClick}
          disabled={!parentId}
        >
          <svg width="19" height="16" viewBox="0 0 19 16" fill="none">
            <path
              d="M9.13411 6.63338V11.6334M6.63411 9.13338H11.6341M15.8008 14.9667C16.2428 14.9667 16.6667 14.7911 16.9793 14.4786C17.2919 14.166 17.4674 13.7421 17.4674 13.3V4.96672C17.4674 4.52469 17.2919 4.10076 16.9793 3.7882C16.6667 3.47564 16.2428 3.30005 15.8008 3.30005H9.21745C8.93871 3.30278 8.66374 3.23556 8.4177 3.10453C8.17166 2.97351 7.96241 2.78286 7.80911 2.55005L7.13411 1.55005C6.98236 1.31961 6.77576 1.13045 6.53286 0.999546C6.28997 0.868644 6.01837 0.800094 5.74245 0.800049H2.46745C2.02542 0.800049 1.6015 0.975643 1.28894 1.2882C0.976376 1.60076 0.800781 2.02469 0.800781 2.46672V13.3C0.800781 13.7421 0.976376 14.166 1.28894 14.4786C1.6015 14.7911 2.02542 14.9667 2.46745 14.9667H15.8008Z"
              stroke="#434343"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1">
            <div className="text-[16px] roboto">Create Folder</div>
          </div>
        </DropdownMenuItem>

        <RequireRole allowedRoles={[ROLES.SUPER_ADMIN]}>
          <DropdownMenuItem
            className="py-2 cursor-pointer hover:bg-[#F6FFFD] mb-1"
            onClick={onCreateDepartmentClick}
          >
            <svg width="15" height="19" viewBox="0 0 15 19" fill="none">
              <path
                d="M0.800781 15.3834V2.88338C0.800781 2.33085 1.02027 1.80094 1.41098 1.41024C1.80168 1.01954 2.33158 0.800049 2.88411 0.800049H13.3008C13.5218 0.800049 13.7338 0.887846 13.89 1.04413C14.0463 1.20041 14.1341 1.41237 14.1341 1.63338V16.6334C14.1341 16.8544 14.0463 17.0664 13.89 17.2226C13.7338 17.3789 13.5218 17.4667 13.3008 17.4667H2.88411C2.33158 17.4667 1.80168 17.2472 1.41098 16.8565C1.02027 16.4658 0.800781 15.9359 0.800781 15.3834ZM0.800781 15.3834C0.800781 14.8308 1.02027 14.3009 1.41098 13.9102C1.80168 13.5195 2.33158 13.3 2.88411 13.3H14.1341"
                stroke="#434343"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex-1">
              <div className="text-[16px] roboto">Create Department</div>
            </div>
          </DropdownMenuItem>
        </RequireRole>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};