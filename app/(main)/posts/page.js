// app/blog/page.jsx
import { getAllPosts } from '@/utils/fetchPosts';
import { Suspense } from 'react';
import PostsGrid from './_components/PostsGrid';

export const metadata = {
  title: 'ব্লগ | আমাদের সাইট',
  description: 'সর্বশেষ ব্লগ পোস্টগুলি পড়ুন',
};

// Skeleton loader
function PostsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Server Component for initial posts
async function InitialPosts({ filters }) {
  const result = await getAllPosts({
    ...filters,
    cache: 'no-store', // এখানে চাইলে revalidate / force-cache দিতে পারো
  });

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">
          পোস্ট লোড করতে সমস্যা হয়েছে
        </div>
        <p className="text-gray-600 mb-4">
          {result.error || 'সার্ভার থেকে ডাটা আনতে পারছি না'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  const initialPosts = result.data || [];
  const totalCount = result.count || 0;

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600">
          {totalCount > 0
            ? `মোট ${totalCount}টি পোস্ট পাওয়া গেছে`
            : 'কোন পোস্ট পাওয়া যায়নি'}
        </p>
      </div>

      <PostsGrid
        initialPosts={initialPosts}
        filters={filters}
        showLoadMore={true}
      />
    </>
  );
}

export default async function BlogPage({ searchParams }) {
  const filters = {
    status: 'PUBLISHED',
    topic: searchParams.topic || undefined,
    tag: searchParams.tag || undefined,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ব্লগ পোস্টসমূহ
        </h1>

        {/* Active filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {searchParams.topic && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              বিষয়: {searchParams.topic}
            </span>
          )}
          {searchParams.tag && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              ট্যাগ: {searchParams.tag}
            </span>
          )}
        </div>
      </div>

      {/* Posts */}
      <Suspense fallback={<PostsLoading />}>
        <InitialPosts filters={filters} />
      </Suspense>
    </div>
  );
}

// Always SSR
export const dynamic = 'force-dynamic';

// Optional pre-generation
export function generateStaticParams() {
  return [{}, { topic: 'technology' }, { topic: 'lifestyle' }];
}
