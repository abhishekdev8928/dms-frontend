import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { getBreadcrumbs } from '@/config/api/treeApi';

interface BreadcrumbItem {
  _id: string;
  name: string;
  type: string;
  path: string;
}

interface FolderBreadcrumbsProps {
  parentId: string;
  onNavigate: (id: string) => void;
  onNavigateHome?: () => void;
}

export default function FolderBreadcrumbs({ 
  parentId, 
  onNavigate,
  onNavigateHome 
}: FolderBreadcrumbsProps) {
  const { data: breadcrumbsData, isLoading } = useQuery({
    queryKey: ['breadcrumbs', parentId],
    queryFn: () => getBreadcrumbs(parentId || ''),
    enabled: !!parentId
  });

  const breadcrumbs: BreadcrumbItem[] = Array.isArray(breadcrumbsData) 
    ? breadcrumbsData 
    : (breadcrumbsData?.data || []);

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  if (breadcrumbs.length === 0) {
    return null;
  }

  const handleBreadcrumbClick = (crumb: BreadcrumbItem, index: number) => {
    if (index === 0 && onNavigateHome) {
      onNavigateHome();
    } else {
      onNavigate(crumb._id);
    }
  };

  return (
    <div className="px-6 py-4 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb._id}>
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="text-gray-900 text-2xl font-normal">
                    {crumb.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="text-gray-700 text-2xl hover:text-teal-600 transition-colors font-normal cursor-pointer"
                    onClick={() => handleBreadcrumbClick(crumb, index)}
                  >
                    <span>{crumb.name}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}