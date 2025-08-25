// app/dashboard/page.js
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 12,
    totalViews: 2847,
    totalLikes: 156,
    drafts: 3,
  });

  const [recentPosts] = useState([
    {
      id: 1,
      title: 'Understanding React Server Components',
      status: 'published',
      views: 245,
      likes: 18,
      createdAt: '2025-01-15',
      category: 'Technology',
    },
    {
      id: 2,
      title: 'The Future of Web Development',
      status: 'draft',
      views: 0,
      likes: 0,
      createdAt: '2025-01-12',
      category: 'Technology',
    },
    {
      id: 3,
      title: 'Building Scalable Applications',
      status: 'published',
      views: 189,
      likes: 23,
      createdAt: '2025-01-10',
      category: 'Development',
    },
  ]);

  const [recentActivity] = useState([
    {
      type: 'post',
      action: 'published',
      title: 'React Server Components',
      time: '2 hours ago',
    },
    {
      type: 'like',
      action: 'received',
      title: 'Web Development Best Practices',
      time: '4 hours ago',
    },
    {
      type: 'comment',
      action: 'received',
      title: 'JavaScript Tips',
      time: '1 day ago',
    },
    {
      type: 'post',
      action: 'drafted',
      title: 'Node.js Performance',
      time: '2 days ago',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Writer! ✍️</h1>
        <p className="text-blue-100 text-lg">
          Here's what's happening with your blog today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalPosts}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">📝</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+2 this week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">👀</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalLikes}
              </p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+8 today</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.drafts}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">📄</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            <Link href="/dashboard/drafts" className="hover:underline">
              View all drafts
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
              <Link
                href="/dashboard/posts"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span>{post.category}</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">👀</span>
                    {post.views}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">❤️</span>
                    {post.likes}
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          <div className="p-6 space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full mt-1">
                  <span className="text-sm">
                    {activity.type === 'post' && '📝'}
                    {activity.type === 'like' && '❤️'}
                    {activity.type === 'comment' && '💬'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium capitalize">
                      {activity.action}
                    </span>{' '}
                    "{activity.title}"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/create"
            className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            <span className="text-2xl mr-3">✏️</span>
            <div>
              <div className="font-semibold">Write New Post</div>
              <div className="text-sm opacity-90">Start creating content</div>
            </div>
          </Link>

          <Link
            href="/dashboard/drafts"
            className="flex items-center p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg text-white hover:from-yellow-600 hover:to-yellow-700 transition-colors"
          >
            <span className="text-2xl mr-3">📄</span>
            <div>
              <div className="font-semibold">Continue Draft</div>
              <div className="text-sm opacity-90">Finish your stories</div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center p-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg text-white hover:from-gray-600 hover:to-gray-700 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <div className="font-semibold">Settings</div>
              <div className="text-sm opacity-90">Customize your profile</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
