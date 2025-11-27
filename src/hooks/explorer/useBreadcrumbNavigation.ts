


import { useNavigate } from "react-router-dom";

export const useBreadcrumbNavigation = () => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (id: string) => {
    navigate(`/dashboard/folder/${id}`);
  };

  const navigateTo = (id: string) => {
    navigate(`/dashboard/folder/${id}`);
  };

  return {
    handleBreadcrumbClick,
    navigateTo,
  };
};