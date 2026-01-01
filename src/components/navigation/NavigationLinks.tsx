import { NavLink } from "react-router-dom";
import { Star, Users } from "lucide-react";
import RequireRole from "../RequireRole";
import { ROLES } from "@/utils/constant";

export const NavigationLinks = () => {
  return (
    <>
      {/* Home Link */}
      <NavLink
        to="/dashboard/home"
        className={({ isActive }) =>
          `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            isActive ? "bg-[#F6FFFD]" : ""
          }`
        }
      >
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 20.0005V12.0005C13 11.7353 12.8946 11.4809 12.7071 11.2934C12.5196 11.1058 12.2652 11.0005 12 11.0005H8C7.73478 11.0005 7.48043 11.1058 7.29289 11.2934C7.10536 11.4809 7 11.7353 7 12.0005V20.0005M1 9.00048C0.99993 8.70955 1.06333 8.4221 1.18579 8.1582C1.30824 7.89429 1.4868 7.66028 1.709 7.47248L8.709 1.47248C9.06999 1.16739 9.52736 1 10 1C10.4726 1 10.93 1.16739 11.291 1.47248L18.291 7.47248C18.5132 7.66028 18.6918 7.89429 18.8142 8.1582C18.9367 8.4221 19.0001 8.70955 19 9.00048V18.0005C19 18.5309 18.7893 19.0396 18.4142 19.4147C18.0391 19.7898 17.5304 20.0005 17 20.0005H3C2.46957 20.0005 1.96086 19.7898 1.58579 19.4147C1.21071 19.0396 1 18.5309 1 18.0005V9.00048Z"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Home
      </NavLink>

     
      <RequireRole allowedRoles={[ROLES.SUPER_ADMIN]}>


        <NavLink
        to="/dashboard/department"
        className={({ isActive }) =>
          `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            isActive ? "bg-[#F6FFFD]" : ""
          }`
        }
      >
        <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 10H13M9 6H13M13 19V16C13 15.4696 12.7893 14.9609 12.4142 14.5858C12.0391 14.2107 11.5304 14 11 14C10.4696 14 9.96086 14.2107 9.58579 14.5858C9.21071 14.9609 9 15.4696 9 16V19M5 8H3C2.46957 8 1.96086 8.21071 1.58579 8.58579C1.21071 8.96086 1 9.46957 1 10V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H17M5 19V3C5 2.46957 5.21071 1.96086 5.58579 1.58579C5.96086 1.21071 6.46957 1 7 1H15C15.5304 1 16.0391 1.21071 16.4142 1.58579C16.7893 1.96086 17 2.46957 17 3V19"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Department
      </NavLink>





      </RequireRole>

      {/* Restore Link */}
      <NavLink
        to="/dashboard/restore"
        className={({ isActive }) =>
          `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            isActive ? "bg-[#F6FFFD]" : ""
          }`
        }
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 10C1 11.78 1.52784 13.5201 2.51677 15.0001C3.50571 16.4802 4.91131 17.6337 6.55585 18.3149C8.20038 18.9961 10.01 19.1743 11.7558 18.8271C13.5016 18.4798 15.1053 17.6226 16.364 16.364C17.6226 15.1053 18.4798 13.5016 18.8271 11.7558C19.1743 10.01 18.9961 8.20038 18.3149 6.55585C17.6337 4.91131 16.4802 3.50571 15.0001 2.51677C13.5201 1.52784 11.78 1 10 1C7.48395 1.00947 5.06897 1.99122 3.26 3.74L1 6M1 6V1M1 6H6M10 5V10L14 12"
            stroke="#1E1E1E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Restore
      </NavLink>

      {/* Starred Link */}
      <NavLink
        to="/dashboard/starred"
        className={({ isActive }) =>
          `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            isActive ? "bg-[#F6FFFD]" : ""
          }`
        }
      >
        <Star className="h-6 w-6" />
        Starred
      </NavLink>

      <NavLink
        to="/dashboard/shared-with-me"
        className={({ isActive }) =>
          `flex items-center text-[16px] text-[#1E1E1E] gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            isActive ? "bg-[#F6FFFD]" : ""
          }`
        }
      >
        <Users className="h-6 w-6" />
        Shared with me
      </NavLink>
    </>
  );
};