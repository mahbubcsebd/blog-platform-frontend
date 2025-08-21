import {
  CalendarIcon,
  EyeIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatViews(views) {
  if (!views) return '০';
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}হাজার`;
  return `${(views / 1000000).toFixed(1)}লক্ষ`;
}

export default function PostCard({ post, priority = false }) {
  // Map API response fields to component fields
  const {
    id,
    slug,
    title,
    excerpt,
    previewImageUrl, // From API
    coverImageUrl, // From API
    publishDate, // From API (instead of published_at)
    createdAt, // From API
    author,
    topic,
    tags = [],
    views_count = 0,
    readTime = 5, // From API
    status,
    isScheduled,
  } = post;

  const postUrl = `/posts/${slug || id}`;

  // Use previewImageUrl first, then coverImageUrl, then default
  const imageUrl =
    previewImageUrl || coverImageUrl || '/images/default-post.jpg';

  // Use publishDate if available, otherwise createdAt
  const displayDate = publishDate || createdAt;

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Featured Image */}
      <div className="relative aspect-video overflow-hidden">
        <Link href={postUrl}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* Status Badge */}
        {(status === 'DRAFT' || isScheduled) && (
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === 'DRAFT'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {status === 'DRAFT' ? 'খসড়া' : 'নির্ধারিত'}
            </span>
          </div>
        )}

        {/* Topic Badge */}
        {topic && (
          <div
            className={`absolute top-4 ${
              status === 'DRAFT' || isScheduled ? 'left-20' : 'left-4'
            }`}
          >
            <Link
              href={`/blog?topic=${
                typeof topic === 'object' ? topic.slug || topic.id : topic
              }`}
              className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              {typeof topic === 'object'
                ? topic.name || topic.title || 'Topic'
                : topic}
            </Link>
          </div>
        )}

        {/* Read Time */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
          {readTime} মিনিট
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {displayDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <time dateTime={displayDate}>{formatDate(displayDate)}</time>
            </div>
          )}

          {author && (
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              <span>
                {typeof author === 'object'
                  ? `${author.firstName || ''} ${
                      author.lastName || ''
                    }`.trim() ||
                    author.email ||
                    'Unknown Author'
                  : author}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <EyeIcon className="w-3 h-3" />
            <span>{formatViews(views_count)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          <Link
            href={postUrl}
            className="hover:text-blue-600 transition-colors"
          >
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">{excerpt}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => {
                const tagSlug =
                  typeof tag === 'object' ? tag.slug || tag.id : tag;
                const tagName =
                  typeof tag === 'object'
                    ? tag.name || tag.title || 'Tag'
                    : tag;

                return (
                  <Link
                    key={tagSlug || index}
                    href={`/blog?tag=${tagName}`} // Use tag name for URL as per your API
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    #{tagName}
                  </Link>
                );
              })}
              {tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Read More Button */}
        <Link
          href={postUrl}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:translate-x-1 transition-transform"
        >
          আরো পড়ুন →
        </Link>
      </div>
    </article>
  );
}
