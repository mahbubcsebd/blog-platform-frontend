'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Edit3,
  FileText,
  Home,
  LogOut,
  PenTool,
  Plus,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Get user initials for avatar fallback
  const getUserInitials = (user) => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  // Check if user is admin or moderator
  const isAdminOrModerator =
    user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  // Check if link is active
  const isActiveLink = (href) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  // Public navigation items (always visible)
  const publicNavItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/posts',
      label: 'All Blogs',
      icon: BookOpen,
    },
  ];

  // Dashboard navigation items (for authenticated users)
  const dashboardNavItems = [
    {
      href: '/dashboard/create',
      label: 'Write Story',
      icon: Plus,
    },
  ];

  // Get navigation items based on authentication status
  const getNavItems = () => {
    const items = [...publicNavItems];

    if (isAuthenticated) {
      items.push(...dashboardNavItems);
    }

    return items;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <PenTool className="h-4 w-4 text-white" />
              </div>
              <span>BlogHub</span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Auth Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Welcome message - Desktop only */}
                <span className="hidden lg:block text-sm text-gray-600">
                  Welcome back,{' '}
                  <span className="font-medium">{user.firstName}</span>
                </span>

                {/* Admin Badge */}
                {isAdminOrModerator && (
                  <div className="hidden sm:flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-xs font-medium rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </div>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-auto px-2 rounded-full hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={user.avatar || ''}
                            alt={user.firstName || 'User'}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-medium text-gray-700">
                          {user.firstName}
                        </span>
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {isAdminOrModerator && (
                          <div className="flex items-center mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role}
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* Dashboard Links */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center cursor-pointer"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/drafts"
                        className="flex items-center cursor-pointer"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        <span>My Drafts</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Admin Section */}
                    {isAdminOrModerator && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                          Admin Panel
                        </DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="flex items-center cursor-pointer text-purple-700 hover:text-purple-800"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/posts"
                            className="flex items-center cursor-pointer text-purple-700 hover:text-purple-800"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Manage Posts</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/users"
                            className="flex items-center cursor-pointer text-purple-700 hover:text-purple-800"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Users</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/categories"
                            className="flex items-center cursor-pointer text-purple-700 hover:text-purple-800"
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Categories</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin/settings"
                            className="flex items-center cursor-pointer text-purple-700 hover:text-purple-800"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Site Settings</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Not authenticated - Show sign in/up buttons
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-gray-700 hover:text-blue-600"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden border-t pt-4 pb-4">
            <nav className="flex flex-wrap gap-2">
              {getNavItems().map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Admin Link */}
              {isAdminOrModerator && (
                <Link
                  href="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink('/admin')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
