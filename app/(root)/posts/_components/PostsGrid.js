'use client';

import { getAllPosts } from '@/utils/fetchPosts';
import { useCallback, useEffect, useState } from 'react';
import PostCard from './PostCard';

export default function PostsGrid({
  initialPosts = [],
  filters = {},
  showLoadMore = true,
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [currentOffset, setCurrentOffset] = useState(initialPosts.length);

  const LIMIT = 6; // per-page limit

  // Fetch posts with proper callback
  const loadInitialPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllPosts({
        ...filters,
        status: 'PUBLISHED',
        limit: LIMIT,
        offset: 0,
        cache: 'no-store',
      });

      if (result.success) {
        setPosts(result.data);
        setCurrentOffset(result.data.length);
        setHasMore(result.data.length === LIMIT);
      } else {
        setError(result.error || 'পোস্ট লোড করতে সমস্যা হয়েছে');
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('পোস্ট লোড করতে সমস্যা হয়েছে');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAllPosts({
        ...filters,
        status: 'PUBLISHED',
        limit: LIMIT,
        offset: currentOffset,
        cache: 'no-store',
      });

      if (result.success && result.data?.length > 0) {
        setPosts((prev) => [...prev, ...result.data]);
        setCurrentOffset((prev) => prev + result.data.length);
        if (result.data.length < LIMIT) setHasMore(false);
      } else {
        setHasMore(false);
        if (result.error) setError(result.error);
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('পোস্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [filters, loading, hasMore, currentOffset]);

  // Reload posts when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setPosts([]);
      setCurrentOffset(0);
      setHasMore(true);
      loadInitialPosts();
    }
  }, [filters, loadInitialPosts]);

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          কোন পোস্ট পাওয়া যায়নি
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {showLoadMore && hasMore && !loading && (
        <div className="text-center">
          <button
            onClick={loadMorePosts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            আরও পোস্ট দেখুন
          </button>
        </div>
      )}

      {/* No More Posts */}
      {showLoadMore && !hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500">সব পোস্ট দেখানো হয়েছে</div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
