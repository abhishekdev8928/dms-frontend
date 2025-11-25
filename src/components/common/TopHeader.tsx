import { useState, useEffect, useRef } from 'react';
import { Search, X, Settings, Folder, FileText, FileImage, FileVideo, FileArchive, Sparkles, BadgeCheck, CreditCard, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { search, quickSearch } from '../../config/api/searchApi';
import { logoutUser, getProfile, type ProfileResponse } from '../../config/api/authApi';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/config/store/authStore';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TopHeader = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);
  const logout = useAuthStore((state) => state.logout);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  // Get user profile
  const { data: profileData } = useQuery<ProfileResponse>({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!user,
  });

  const userProfile = profileData?.data;

  // Helper function to get formatted date and time
  const getFormattedDateTime = () => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => logoutUser(getRefreshToken() || undefined),
    onMutate: () => {
      toast.loading("Logging out...", {
        description: getFormattedDateTime(),
      });
    },
    onSuccess: () => {
      toast.dismiss();
      logout();
      toast.success("Logged out successfully", {
        description: "See you soon!",
      });
      setTimeout(() => {
        navigate("/auth/login");
      }, 500);
    },
    onError: (error: any) => {
      toast.dismiss();
      const errorMessage = error?.response?.data?.message || error.message || "Logout failed";
      toast.error("Logout failed", {
        description: errorMessage,
      });
    },
  });

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Quick search for suggestions
  const { data: quickSearchData } = useQuery({
    queryKey: ['quickSearch', searchQuery],
    queryFn: () => quickSearch({ query: searchQuery, limit: 5 }),
    enabled: searchQuery.length >= 1 && searchQuery.length < 2,
  });

  // Full search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () =>
      search({
        query: debouncedQuery,
        page: 1,
        limit: 20,
      }),
    enabled: debouncedQuery.length >= 2,
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(target)
      ) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const getFileIcon = (type: string, extension?: string) => {
    if (type === 'folder') return <Folder className="w-5 h-5 text-blue-600" />;
    if (extension === 'pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) return <FileImage className="w-5 h-5 text-green-600" />;
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension || '')) return <FileVideo className="w-5 h-5 text-purple-600" />;
    if (['zip', 'rar', '7z', 'tar'].includes(extension || '')) return <FileArchive className="w-5 h-5 text-orange-600" />;
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  // Parse path into breadcrumb array with folder IDs
  const parsePath = (path: string, ancestors?: any[]) => {
    if (!path) return [];
    
    // Remove leading/trailing slashes and split
    const pathParts = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
    
    // If ancestors array is provided, use it to get IDs
    if (ancestors && ancestors.length > 0) {
      return pathParts.map((name, index) => ({
        name,
        id: ancestors[index]?.id || null,
      }));
    }
    
    // Fallback: return parts without IDs
    return pathParts.map(name => ({ name, id: null }));
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (folderId: string | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (folderId) {
      setIsSearchActive(false);
      navigate(`/dashboard/folder/${folderId}`);
    }
  };

  return (
    <div className="w-full py-4 px-2 pb-0 pe-4">
      <div className="max-w-7xl mx-auto ">
        {/* Top Bar with Search */}
        <div className="flex w-full justify-between gap-4">
          {/* Search Bar Container */}
          <div className="w-[652px] h-[52px] relative">
            <div ref={searchInputRef}>
              <div
                className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all bg-[#F6FFFD] ${
                  isSearchActive 
                    ? ' shadow-lg ring-1 ring-gray-300' 
                    : ' hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <Search className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search Documents"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-600 text-base"
                />
                {searchQuery && (
                  <button onClick={handleClearSearch} className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Dropdown */}
            {isSearchActive && searchQuery.length > 0 && (
              <div 
                ref={searchContainerRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 overflow-visible"
                style={{ width: searchInputRef.current?.offsetWidth }}
              >
                {/* Search Results */}
                <div className="max-h-[400px] overflow-y-auto">
                  {searchQuery.length < 2 ? (
                    // Quick search suggestions
                    <div className="p-2">
                      {quickSearchData?.data?.suggestions?.map((suggestion: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(suggestion)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                          <Search className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  ) : isLoading ? (
                    // Loading state
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-600 text-sm">Searching...</p>
                    </div>
                  ) : searchResults?.data?.results?.length > 0 ? (
                    // Search results
                    <div className="p-2">
                      {searchResults.data.results.map((item: any) => {
                        const isFolder = item.type === "folder";
                        const targetPath = isFolder
                          ? `/dashboard/folder/${item._id}`
                          : `/dashboard/folder/${item.parent_id}`;

                        // Parse breadcrumb path
                        const breadcrumbs = parsePath(item.path, item.ancestors);

                        return (
                          <Link
                            key={item._id}
                            to={targetPath}
                            className="flex items-start gap-4 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                            onClick={() => setIsSearchActive(false)}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getFileIcon(item.type, item.extension)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </div>
                              
                              {/* Breadcrumb Path */}
                              {breadcrumbs.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 flex-wrap">
                                  {breadcrumbs.map((crumb, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                      {crumb.id ? (
                                        <button
                                          onClick={(e) => handleBreadcrumbClick(crumb.id, e)}
                                          className="hover:text-blue-600 hover:underline transition-colors"
                                        >
                                          {crumb.name}
                                        </button>
                                      ) : (
                                        <span>{crumb.name}</span>
                                      )}
                                      {index < breadcrumbs.length - 1 && (
                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>{item.createdBy?.username}</span>
                                <span className="text-gray-300">•</span>
                                <span>{format(new Date(item.updatedAt), "MMM d, yyyy")}</span>
                              </div>
                            </div>
                            <div className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 font-medium flex-shrink-0">
                              {item.type === "folder" ? "Folder" : item.extension?.toUpperCase()}
                            </div>
                          </Link>
                        );
                      })}

                      {searchResults?.data?.pagination && (
                        <div className="text-center py-3 text-sm text-gray-500 border-t border-gray-100 mt-2">
                          Showing <span className="font-semibold text-gray-700">{searchResults.data.results.length}</span> of{' '}
                          <span className="font-semibold text-gray-700">{searchResults.data.pagination.totalResults}</span> results
                        </div>
                      )}
                    </div>
                  ) : (
                    // No results
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Search className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-base font-medium text-gray-600">No results found</p>
                      <p className="text-sm mt-1 text-gray-500">Try different keywords</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings and Profile Avatar */}
          <div className='flex items-center justify-between gap-2'>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.62736 3.11857C7.68246 2.53891 7.95169 2.00062 8.38246 1.60885C8.81323 1.21709 9.37459 1 9.95686 1C10.5391 1 11.1005 1.21709 11.5313 1.60885C11.962 2.00062 12.2313 2.53891 12.2864 3.11857C12.3195 3.49303 12.4423 3.85399 12.6445 4.17091C12.8467 4.48783 13.1222 4.75138 13.4478 4.93925C13.7734 5.12712 14.1395 5.23378 14.5151 5.25019C14.8906 5.26661 15.2646 5.19231 15.6054 5.03357C16.1345 4.79335 16.734 4.75859 17.2874 4.93606C17.8407 5.11353 18.3082 5.49052 18.5989 5.99368C18.8896 6.49683 18.9826 7.09015 18.86 7.65814C18.7374 8.22614 18.4078 8.72819 17.9354 9.06657C17.6277 9.28242 17.3766 9.56918 17.2033 9.9026C17.0299 10.236 16.9394 10.6063 16.9394 10.9821C16.9394 11.3579 17.0299 11.7281 17.2033 12.0615C17.3766 12.395 17.6277 12.6817 17.9354 12.8976C18.4078 13.236 18.7374 13.738 18.86 14.306C18.9826 14.874 18.8896 15.4673 18.5989 15.9705C18.3082 16.4736 17.8407 16.8506 17.2874 17.0281C16.734 17.2056 16.1345 17.1708 15.6054 16.9306C15.2646 16.7718 14.8906 16.6975 14.5151 16.714C14.1395 16.7304 13.7734 16.837 13.4478 17.0249C13.1222 17.2128 12.8467 17.4763 12.6445 17.7932C12.4423 18.1102 12.3195 18.4711 12.2864 18.8456C12.2313 19.4252 11.962 19.9635 11.5313 20.3553C11.1005 20.7471 10.5391 20.9641 9.95686 20.9641C9.37459 20.9641 8.81323 20.7471 8.38246 20.3553C7.95169 19.9635 7.68246 19.4252 7.62736 18.8456C7.5943 18.471 7.47146 18.1099 7.26922 17.7928C7.06699 17.4758 6.79133 17.2122 6.46559 17.0243C6.13985 16.8364 5.77363 16.7298 5.39794 16.7135C5.02225 16.6972 4.64816 16.7716 4.30736 16.9306C3.77825 17.1708 3.17869 17.2056 2.62536 17.0281C2.07203 16.8506 1.60453 16.4736 1.31384 15.9705C1.02315 15.4673 0.930074 14.874 1.05272 14.306C1.17536 13.738 1.50496 13.236 1.97736 12.8976C2.28498 12.6817 2.53609 12.395 2.70945 12.0615C2.88281 11.7281 2.97331 11.3579 2.97331 10.9821C2.97331 10.6063 2.88281 10.236 2.70945 9.9026C2.53609 9.56918 2.28498 9.28242 1.97736 9.06657C1.50562 8.72802 1.17661 8.22617 1.05426 7.65856C0.931912 7.09094 1.02497 6.49811 1.31534 5.99529C1.60572 5.49246 2.07267 5.11555 2.62545 4.93781C3.17823 4.76008 3.77734 4.79421 4.30636 5.03357C4.64712 5.19231 5.0211 5.26661 5.39666 5.25019C5.77222 5.23378 6.13829 5.12712 6.4639 4.93925C6.7895 4.75138 7.06505 4.48783 7.26722 4.17091C7.4694 3.85399 7.59224 3.49303 7.62536 3.11857M12.9564 10.9826C12.9564 12.6394 11.6132 13.9826 9.95636 13.9826C8.2995 13.9826 6.95636 12.6394 6.95636 10.9826C6.95636 9.32572 8.2995 7.98257 9.95636 7.98257C11.6132 7.98257 12.9564 9.32572 12.9564 10.9826Z" stroke="#434343" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Profile Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm hover:shadow-md transition-shadow">
                  {getUserInitials(userProfile?.username, userProfile?.email)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getUserInitials(userProfile?.username, userProfile?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{userProfile?.username || 'User'}</span>
                      <span className="truncate text-xs text-muted-foreground">{userProfile?.email || user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/upgrade" className="cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/billing" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;