'use client';

import { useAuth } from '@/hooks/useAuth';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardPostCard from './components/DashboardPostCard';

const UserPostsPage = () => {
  const { isAuthenticated, loading, authenticatedFetch } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Loading states for individual actions
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [publishingPostId, setPublishingPostId] = useState(null);
  const [duplicatingPostId, setDuplicatingPostId] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/sign-in');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch user posts
  const fetchUserPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setPostsLoading(true);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/me/posts`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setPosts(data.data || []);
      } else {
        showMessage(data.message || 'Failed to load posts', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showMessage('Failed to load posts', 'error');
    } finally {
      setPostsLoading(false);
    }
  }, [isAuthenticated, authenticatedFetch]);

  useEffect(() => {
    if (isAuthenticated) fetchUserPosts();
  }, [isAuthenticated, fetchUserPosts]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // Handle Edit Post
  const handleEditPost = (post) => {
    router.push(`/dashboard/posts/edit/${post.slug || post.id}`);
  };

  // Handle Delete Post
  const handleDeletePost = async (post) => {
    setDeletingPostId(post.id);
    console.log(post.id);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${post.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
        showMessage('Post deleted successfully', 'success');
      } else {
        showMessage(data.message || 'Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      showMessage('Failed to delete post', 'error');
    } finally {
      setDeletingPostId(null);
    }
  };

  // Handle Publish Post
  const handlePublishPost = async (post) => {
    setPublishingPostId(post.id);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${post.id}/publish`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'PUBLISHED',
            publishDate: new Date().toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  status: 'PUBLISHED',
                  publishDate: new Date().toISOString(),
                }
              : p
          )
        );
        showMessage('Post published successfully', 'success');
      } else {
        showMessage(data.message || 'Failed to publish post', 'error');
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      showMessage('Failed to publish post', 'error');
    } finally {
      setPublishingPostId(null);
    }
  };

  // Handle Unpublish Post
  const handleUnpublishPost = async (post) => {
    setPublishingPostId(post.id);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${post.id}/unpublish`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'DRAFT',
            publishDate: null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id ? { ...p, status: 'DRAFT', publishDate: null } : p
          )
        );
        showMessage('Post unpublished successfully', 'success');
      } else {
        showMessage(data.message || 'Failed to unpublish post', 'error');
      }
    } catch (error) {
      console.error('Failed to unpublish post:', error);
      showMessage('Failed to unpublish post', 'error');
    } finally {
      setPublishingPostId(null);
    }
  };

  // Handle Duplicate Post
  const handleDuplicatePost = async (post) => {
    setDuplicatingPostId(post.id);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${post.id}/duplicate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new duplicated post to the list
        setPosts((prevPosts) => [data.data, ...prevPosts]);
        showMessage('Post duplicated successfully', 'success');
      } else {
        showMessage(data.message || 'Failed to duplicate post', 'error');
      }
    } catch (error) {
      console.error('Failed to duplicate post:', error);
      showMessage('Failed to duplicate post', 'error');
    } finally {
      setDuplicatingPostId(null);
    }
  };

  // Handle Schedule Post
  const handleSchedulePost = (post) => {
    // Navigate to schedule page or open modal
    router.push(`/dashboard/posts/schedule/${post.slug || post.id}`);
  };

  // Handle Share Post
  const handleSharePost = async (post) => {
    const postUrl = `${window.location.origin}/posts/${post.slug || post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: postUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(postUrl);
        showMessage('Post URL copied to clipboard', 'success');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(postUrl);
        showMessage('Post URL copied to clipboard', 'success');
      } catch (error) {
        showMessage('Failed to copy URL', 'error');
      }
    }
  };

  if (loading || postsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Authenticating...' : 'Loading posts...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
              <p className="text-gray-600 mt-2">
                Manage all your posts - drafts, published, and scheduled
              </p>
            </div>
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              New Post
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm">
              <span className="font-medium text-gray-900">{posts.length}</span>
              <span className="text-gray-500 ml-1">Total Posts</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {posts.filter((p) => p.status === 'PUBLISHED').length}
              </span>
              <span className="text-gray-500 ml-1">Published</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {posts.filter((p) => p.status === 'DRAFT').length}
              </span>
              <span className="text-gray-500 ml-1">Drafts</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {posts.filter((p) => p.isScheduled).length}
              </span>
              <span className="text-gray-500 ml-1">Scheduled</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mx-2">
            <div
              className={`${
                messageType === 'success'
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              } border px-4 py-3 rounded-lg flex items-center shadow-sm`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {messageType === 'success' ? (
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating content by writing your first post
              </p>
              <Link
                href="/dashboard/posts/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Post
              </Link>
            </div>
          ) : (
            <>
              {posts.map((post, index) => (
                <DashboardPostCard
                  key={post.id}
                  post={post}
                  priority={index < 3}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onPublish={handlePublishPost}
                  onUnpublish={handleUnpublishPost}
                  onDuplicate={handleDuplicatePost}
                  onSchedule={handleSchedulePost}
                  onShare={handleSharePost}
                  isDeleting={deletingPostId === post.id}
                  isPublishing={publishingPostId === post.id}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPostsPage;
