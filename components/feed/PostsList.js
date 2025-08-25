import { getAllPosts } from '@/utils/fetchPosts';
import LoadMoreButton from './LoadMoreButton';
import PostCard from './PostCard';

export default async function PostsList({ filters }) {
  const result = await getAllPosts({
    ...filters,
    limit: 12,
    page: 1,
    status: 'PUBLISHED',
  });

  if (!result.success) {
    return <div>❌ ডেটা লোডে সমস্যা হয়েছে</div>;
  }

  const posts = result.data || [];
  const totalCount = result.count || 0;

  return (
    <div className="">
      <p className="mb-5">{totalCount} Posts found.</p>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {result.hasMore && <LoadMoreButton filters={filters} />}
    </div>
  );
}
