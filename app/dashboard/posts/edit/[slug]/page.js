'use client';

import PostEditor from '@/app/dashboard/components/PostEditor';
// import PostEditor from '@/components/PostEditor';
import { getPostBySlug } from '@/utils/fetchPosts';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// import PostEditor from '../../components/PostEditor';

// আপনার API function import করুন
// import { getPostBySlug } from '@/actions/post';

export default function EditPostPage() {
  const params = useParams();
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);

        // আপনার API call করুন
        const response = await getPostBySlug(params.slug);

        if (response.success) {
          setPostData(response.data.data);
        } else {
          setError(response.error || 'Failed to fetch post');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to fetch post data');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log(postData);

  return (
    <PostEditor mode="edit" initialData={postData} isLoading={isLoading} />
  );
}
