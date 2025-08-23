// app/admin/layout.js
'use client';
import AdminRouteGuard from '@/components/guards/AdminRouteGuard';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊', badge: null },
    { href: '/admin/posts', label: 'All Posts', icon: '📚', badge: '145' },
    { href: '/admin/categories', label: 'Categories', icon: '🏷️', badge: null },
    { href: '/admin/users', label: 'Users', icon: '👥', badge: '12' },
    {
      href: '/admin/settings',
      label: 'Site Settings',
      icon: '⚙️',
      badge: null,
    },
  ];

  const quickActions = [
    { label: 'New Post', icon: '➕', action: () => console.log('New post') },
    { label: 'Backup', icon: '💾', action: () => console.log('Backup') },
    { label: 'Analytics', icon: '📈', action: () => console.log('Analytics') },
  ];

  return (
    <AdminRouteGuard>
      <div
        className={`min-h-screen ${
          darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
        }`}
      >
        {/* Header */}
        <header
          className={`${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          } shadow-lg border-b sticky top-0 z-40`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-md ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
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
              <Link
                href="/admin"
                className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                <span className="text-blue-600">Admin</span>Panel
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Global search..."
                  className={`w-80 px-4 py-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-300'
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

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
                  5
                </span>
              </button>

              {/* Admin Profile */}
              <div className="flex items-center space-x-3">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
                <div className="hidden md:block">
                  <p
                    className={`text-sm font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:static w-72 h-full ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-xl transition-transform duration-300 ease-in-out z-30`}
          >
            <nav className="p-6">
              {/* Navigation Menu */}
              <div className="space-y-2 mb-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          pathname === item.href
                            ? 'bg-white bg-opacity-20'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <div
                className={`p-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                } rounded-xl`}
              >
                <h3
                  className={`text-sm font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  } mb-3`}
                >
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                        darkMode
                          ? 'text-gray-300 hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-white'
                      } transition-colors`}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-green-800">
                    System Status
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  All systems operational
                </p>
                <p className="text-xs text-green-600">Uptime: 99.9%</p>
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

          {/* Main Content Area */}
          <main className="flex-1 lg:ml-0">
            {/* Breadcrumb */}
            <div
              className={`px-6 py-4 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
              } border-b`}
            >
              <nav className="flex items-center space-x-2 text-sm">
                <Link
                  href="/admin"
                  className={`${
                    darkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Admin
                </Link>
                <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>
                  /
                </span>
                <span
                  className={`${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } font-medium`}
                >
                  {pathname.split('/').pop() || 'Dashboard'}
                </span>
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
};

export default AdminLayout;
