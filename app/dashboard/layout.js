// app/dashboard/layout.js
'use client';
import DashboardRouteGuard from '@/components/guards/DashboardRouteGuard';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/posts', label: 'My Posts', icon: '📝' },
    { href: '/dashboard/create', label: 'Write Post', icon: '✍️' },
    { href: '/dashboard/drafts', label: 'Drafts', icon: '📄' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <DashboardRouteGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link href="/" className="text-xl font-bold text-gray-800">
                BlogDash
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-3.405-3.405A2.032 2.032 0 0118 12V8a6 6 0 10-12 0v4c0 .55-.22 1.05-.595 1.405L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                    width={1200}
                    height={1200}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-medium">
                    John Doe
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:static w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out z-30 min-h-screen`}
          >
            <nav className="p-6">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views</span>
                    <span className="font-semibold">1.2k</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-semibold">156</span>
                  </div>
                </div>
              </div>
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </DashboardRouteGuard>
  );
};

export default DashboardLayout;
