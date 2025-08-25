'use client';

import { getAllPosts } from '@/utils/fetchPosts';
import { useState, useTransition } from 'react';
import PostCard from './PostCard';

export default function LoadMoreButton({
  currentPage,
  totalCount,
  totalPages,
  filters,
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(currentPage + 1);
  const [isPending, startTransition] = useTransition();

  const loadMore = async () => {
    if (loading || isPending || nextPage > totalPages) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getAllPosts({
        ...filters,
        limit: 12,
        page: nextPage,
        status: 'PUBLISHED',
      });

      if (result.success) {
        startTransition(() => {
          setPosts((prev) => [...prev, ...(result.data || [])]);
          setNextPage((prev) => prev + 1);
        });
      } else {
        setError(result.error || 'পোস্ট লোড করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      setError('নেটওয়ার্ক এরর হয়েছে');
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasMore = nextPage <= totalPages;
  const isLoading = loading || isPending;
  const loadedCount = posts.length;
  const remainingCount = totalCount - currentPage * 12 - loadedCount;

  return (
    <div className="space-y-8">
      {/* Additional Posts */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <PostCard key={post.id || `extra-${index}`} post={post} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-200
              ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                লোড হচ্ছে...
              </div>
            ) : (
              `আরো দেখুন (${Math.max(0, remainingCount)}টি বাকি)`
            )}
          </button>

          {/* Page Info */}
          <p className="text-sm text-gray-500 mt-2">
            পৃষ্ঠা {nextPage - 1} এর {totalPages}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={loadMore}
              className="text-red-700 hover:text-red-800 font-medium text-sm"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      )}

      {/* End Message */}
      {!hasMore && (
        <div className="text-center">
          <p className="text-gray-500 py-4">
            সব পোস্ট দেখানো হয়েছে ({totalCount}টি)
          </p>
        </div>
      )}
    </div>
  );
}
