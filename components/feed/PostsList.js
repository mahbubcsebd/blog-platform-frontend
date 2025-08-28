'use client';

import { getAllPosts } from '@/utils/fetchPosts';
import { useEffect, useState } from 'react';
import LoadMoreButton from './LoadMoreButton';
import PostCard from './PostCard';

export default function PostsList({ filters }) {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const result = await getAllPosts({
        ...filters,
        limit: 12,
        page: 1,
        status: 'PUBLISHED',
      });

      if (!result.success) {
        setError('ডেটা লোডে সমস্যা হয়েছে');
        return;
      }

      const fetchedPosts = result.data || [];
      const publishedPosts = fetchedPosts.filter(
        (post) => post.status === 'PUBLISHED'
      );

      setPosts(publishedPosts);
      setTotalCount(result.count || 0);
      setHasMore(result.hasMore || false);
      setError(null);
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts();
  }, [filters]);

  // Auto-refresh every 2 minutes to check for newly published posts
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if user is active (to avoid unnecessary API calls)
      if (document.visibilityState === 'visible') {
        fetchPosts();
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [filters]);

  if (loading && posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading posts...</p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">❌ {error}</p>
        <button
          onClick={fetchPosts}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">কোন পোস্ট পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-600">{totalCount} Posts found</p>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          {loading && posts.length > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              Refreshing...
            </span>
          )}
          <span className="opacity-50" title="Auto-refresh every 2 minutes">
            🔄 Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showScheduleInfo={false} />
        ))}
      </div>

      {hasMore && (
        <LoadMoreButton
          filters={{ ...filters, status: 'PUBLISHED' }}
          onLoadMore={(newPosts) => {
            setPosts((prev) => [...prev, ...newPosts]);
          }}
        />
      )}
    </div>
  );
}
