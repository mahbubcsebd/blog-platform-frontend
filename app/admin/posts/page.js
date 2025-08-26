'use client';

import PostCard from '@/components/feed/PostCard';
import {
  getAllPosts,
  getScheduledPosts,
  triggerAutoPublish,
} from '@/utils/fetchPosts';
import { useEffect, useState } from 'react';
// import PostCard from './PostCard';

export default function AdminPostsList() {
  const [posts, setPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'scheduled', 'drafts', 'published'
  const [loading, setLoading] = useState(true);

  const fetchAllPosts = async () => {
    try {
      const result = await getAllPosts({ limit: 50 });
      if (result.success) {
        setPosts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchScheduledPosts = async () => {
    try {
      const result = await getScheduledPosts();
      if (result.success) {
        setScheduledPosts(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    }
  };

  const handleAutoPublish = async () => {
    try {
      setLoading(true);
      const result = await triggerAutoPublish();
      if (result.success) {
        // Refresh both lists
        await Promise.all([fetchAllPosts(), fetchScheduledPosts()]);
        alert(`${result.data.length} posts auto-published successfully!`);
      }
    } catch (error) {
      alert('Error triggering auto-publish');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchAllPosts(), fetchScheduledPosts()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Filter posts based on active tab
  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'scheduled':
        return scheduledPosts;
      case 'drafts':
        return posts.filter(
          (post) => post.status === 'DRAFT' && !post.isScheduled
        );
      case 'published':
        return posts.filter((post) => post.status === 'PUBLISHED');
      default:
        return posts;
    }
  };

  const filteredPosts = getFilteredPosts();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Posts Management</h2>

        <div className="flex gap-2">
          <button
            onClick={handleAutoPublish}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={loading}
          >
            🚀 Trigger Auto-Publish
          </button>

          <button
            onClick={() => {
              fetchAllPosts();
              fetchScheduledPosts();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Posts', count: posts.length },
            {
              key: 'published',
              label: 'Published',
              count: posts.filter((p) => p.status === 'PUBLISHED').length,
            },
            {
              key: 'drafts',
              label: 'Drafts',
              count: posts.filter((p) => p.status === 'DRAFT' && !p.isScheduled)
                .length,
            },
            {
              key: 'scheduled',
              label: 'Scheduled',
              count: scheduledPosts.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Scheduled Posts Info */}
      {activeTab === 'scheduled' && scheduledPosts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">
            📅 Upcoming Publications
          </h3>
          <div className="space-y-2">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-medium">{post.title}</span>
                <span className="text-blue-600">
                  {new Date(post.publishDate).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts found in this category
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              showScheduleInfo={true}
              isAdmin={true}
              onUpdate={() => {
                fetchAllPosts();
                fetchScheduledPosts();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
