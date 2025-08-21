// app/blog/components/PostsLoading.jsx

function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-video bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-6">
        {/* Meta info skeleton */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Tags skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="flex gap-1">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-10"></div>
          </div>
        </div>

        {/* Read more skeleton */}
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

export default function PostsLoading() {
  return (
    <div className="space-y-8">
      {/* Results count skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
      </div>

      {/* Posts grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>

      {/* Load more button skeleton */}
      <div className="text-center">
        <div className="h-12 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}
