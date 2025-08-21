// app/admin/page.js
'use client';
import Link from 'next/link';
import { useState } from 'react';

const AdminDashboardPage = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    totalPosts: 3429,
    totalViews: 45678,
    pendingPosts: 23,
    serverUptime: '99.9%',
    storageUsed: '2.3 GB',
  });

  const [recentUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      joined: '2024-08-19',
      status: 'active',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      joined: '2024-08-18',
      status: 'active',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      joined: '2024-08-17',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      joined: '2024-08-16',
      status: 'active',
    },
  ]);

  const [recentPosts] = useState([
    {
      id: 1,
      title: 'Understanding React Hooks',
      author: 'John Doe',
      status: 'published',
      date: '2024-08-19',
      views: 234,
    },
    {
      id: 2,
      title: 'CSS Grid vs Flexbox',
      author: 'Jane Smith',
      status: 'pending',
      date: '2024-08-18',
      views: 0,
    },
    {
      id: 3,
      title: 'JavaScript ES2024 Features',
      author: 'Mike Johnson',
      status: 'draft',
      date: '2024-08-17',
      views: 156,
    },
    {
      id: 4,
      title: 'Web Performance Optimization',
      author: 'Sarah Wilson',
      status: 'published',
      date: '2024-08-16',
      views: 189,
    },
  ]);

  const [systemAlerts] = useState([
    {
      type: 'warning',
      message: 'Server storage is 85% full',
      time: '2 hours ago',
      severity: 'medium',
    },
    {
      type: 'info',
      message: 'Scheduled backup completed successfully',
      time: '6 hours ago',
      severity: 'low',
    },
    {
      type: 'error',
      message: 'Failed login attempts detected',
      time: '1 day ago',
      severity: 'high',
    },
    {
      type: 'success',
      message: 'System update installed',
      time: '2 days ago',
      severity: 'low',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100 text-lg">
              Manage your blog platform efficiently
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
              <p className="text-sm text-purple-100">Last login</p>
              <p className="font-semibold">Today, 9:30 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {systemStats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">↗ +15%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {systemStats.totalPosts.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">↗ +8%</span>
            <span className="text-gray-500 ml-2">from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Views</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {systemStats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">👀</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">↗ +22%</span>
            <span className="text-gray-500 ml-2">from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {systemStats.pendingPosts}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/posts"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Review Posts →
            </Link>
          </div>
        </div>
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Users
                </h2>
                <Link
                  href="/admin/users"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage Users
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {user.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {user.joined}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-blue-600">
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Posts
                </h2>
                <Link
                  href="/admin/posts"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage Posts
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>by {post.author}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : post.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span>👀 {post.views}</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Uptime</span>
                <span className="font-semibold text-green-600">
                  {systemStats.serverUptime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="font-semibold text-orange-600">
                  {systemStats.storageUsed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-semibold text-blue-600">127</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-lg">🔧</span>
                <span className="text-blue-900 font-medium">
                  System Settings
                </span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-lg">💾</span>
                <span className="text-green-900 font-medium">Backup Data</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                <span className="text-lg">📊</span>
                <span className="text-purple-900 font-medium">
                  View Analytics
                </span>
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              System Alerts
            </h3>
            <div className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : alert.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : alert.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-sm">
                      {alert.type === 'error' && '🚨'}
                      {alert.type === 'warning' && '⚠️'}
                      {alert.type === 'info' && 'ℹ️'}
                      {alert.type === 'success' && '✅'}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          alert.severity === 'high'
                            ? 'text-red-800'
                            : alert.severity === 'medium'
                            ? 'text-yellow-800'
                            : alert.type === 'success'
                            ? 'text-green-800'
                            : 'text-blue-800'
                        }`}
                      >
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users/new"
            className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            <span className="text-2xl mr-3">👤</span>
            <div>
              <div className="font-semibold">Add User</div>
              <div className="text-sm opacity-90">Create new account</div>
            </div>
          </Link>

          <Link
            href="/admin/posts"
            className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white hover:from-green-600 hover:to-green-700 transition-colors"
          >
            <span className="text-2xl mr-3">📝</span>
            <div>
              <div className="font-semibold">Manage Posts</div>
              <div className="text-sm opacity-90">Review & moderate</div>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white hover:from-purple-600 hover:to-purple-700 transition-colors"
          >
            <span className="text-2xl mr-3">📊</span>
            <div>
              <div className="font-semibold">Analytics</div>
              <div className="text-sm opacity-90">View detailed stats</div>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center p-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg text-white hover:from-gray-600 hover:to-gray-700 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <div className="font-semibold">Settings</div>
              <div className="text-sm opacity-90">System configuration</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
