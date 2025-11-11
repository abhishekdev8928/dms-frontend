import { useState, useEffect, useRef } from 'react';
import { Search, X, Settings, Folder, FileText, FileImage, FileVideo, FileArchive, Sparkles, BadgeCheck, CreditCard, Bell, LogOut } from 'lucide-react';
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

  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto ">
        {/* Top Bar with Search */}
        <div className="flex w-full justify-between gap-4">
          {/* Search Bar Container */}
          <div className="w-[652px] h-[52px] relative">
            <div ref={searchInputRef}>
              <div
                className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all ${
                  isSearchActive 
                    ? 'bg-white shadow-lg ring-1 ring-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <Search className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search in Drive"
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
                          ? `/folder/${item._id}`
                          : `/folder/${item.parent_id}`;

                        return (
                          <Link
                            key={item._id}
                            to={targetPath}
                            className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                            onClick={() => setIsSearchActive(false)}
                          >
                            <div className="flex-shrink-0">
                              {getFileIcon(item.type, item.extension)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                <span>{item.createdBy?.name || "Unknown"}</span>
                                <span className="text-gray-300">•</span>
                                <span>{format(new Date(item.updatedAt), "MMM d, yyyy")}</span>
                              </div>
                            </div>
                            <div className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">
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
              <Settings className="w-5 h-5 text-gray-600" />
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
                      {/* <AvatarImage src={userProfile?.avatar} alt={userProfile?.username} /> */}
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