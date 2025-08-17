// components/PostCard.jsx
import Image from 'next/image';
import Link from 'next/link';

export default function PostCard({ post }) {
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get author full name
  const getAuthorName = (author) => {
    return (
      `${author.firstName || ''} ${author.lastName || ''}`.trim() ||
      'Unknown Author'
    );
  };

  // Get content preview
  const getContentPreview = () => {
    if (post.excerpt) {
      return post.excerpt;
    }

    if (post.contentPreview) {
      return post.contentPreview;
    }

    if (post.contentType === 'MARKDOWN' && post.content) {
      return post.content.substring(0, 150) + '...';
    }

    return 'কোন বিবরণ নেই';
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Cover Image */}
      {post.previewImageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={post.previewImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        {/* Topic & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.topic && (
            <Link
              href={`/topics/${post.topic.slug}`}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
            >
              {post.topic.name}
            </Link>
          )}

          {post.tags?.slice(0, 2).map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug || tag.name}`}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}

          {post.tags?.length > 2 && (
            <span className="text-xs text-gray-500">
              +{post.tags.length - 2} আরও
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`} className="block group">
          <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt/Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">{getContentPreview()}</p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>{getAuthorName(post.author)}</span>
            <span>•</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>

          {/* Status Badge */}
          {post.status !== 'PUBLISHED' && (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                post.status === 'DRAFT'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {post.status}
            </span>
          )}
        </div>

        {/* Read More Link */}
        <div className="mt-4">
          <Link
            href={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center group"
          >
            আরও পড়ুন
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
