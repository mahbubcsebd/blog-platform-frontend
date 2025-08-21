// app/blog/page.jsx
import FeedHeader from '@/components/feed/FeedHeader';
import FilterBar from '@/components/feed/FilterBar';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';
import PostsList from '@/components/feed/PostsList';
import { Suspense } from 'react';

// export const metadata = {
//   title: 'ব্লগ ফিড | আমাদের সাইট',
//   description: 'সর্বশেষ ব্লগ পোস্টগুলি দেখুন এবং ফিল্টার করুন',
// };

// Server component for handling initial data
async function FeedContent({ searchParams }) {
  const params = await searchParams;

  const filters = {
    topic: params?.topic || null,
    tag: params?.tag || null,
    sort: params?.sort || 'latest',
    search: params?.search || null,
  };

  return (
    <>
      <FilterBar initialFilters={filters} />
      <Suspense fallback={<PostCardSkeleton />} key={JSON.stringify(filters)}>
        <PostsList filters={filters} />
      </Suspense>
    </>
  );
}

export default async function FeedPage({ searchParams }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <FeedHeader />
        <FeedContent searchParams={searchParams} />
      </div>
    </div>
  );
}

// Enable ISR with revalidation
export const revalidate = 60; // Revalidate every minute
