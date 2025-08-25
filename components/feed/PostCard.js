import {
  BookmarkIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  HandThumbUpIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatViews(views) {
  if (!views) return '0';
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
}

export default function PostCard({ post, priority = false }) {
  // Map API response fields to component fields
  const {
    id,
    slug,
    title,
    excerpt,
    previewImageUrl,
    publishDate,
    createdAt,
    author,
    topic,
    tags = [],
    readCount = 0,
    readTime = 1,
    status,
    isScheduled,
    likes = 0,
    comments = 0,
  } = post;

  const postUrl = `/posts/${slug || id}`;

  // Use previewImageUrl first, then coverImageUrl, then default
  const imageUrl = previewImageUrl || '/images/default-post.jpg';

  // Use publishDate if available, otherwise createdAt
  const displayDate = publishDate || createdAt;

  return (
    <Link
      href={postUrl}
      className="bg-white border-b border-gray-100 transition-all duration-200 py-6 pt-4 rounded-md"
    >
      <div className="px-6">
        <div className="flex gap-6">
          {/* Content Section */}
          <div className="flex-1">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">
                  {typeof author === 'object'
                    ? `${author.firstName || ''} ${
                        author.lastName || ''
                      }`.trim() ||
                      author.email ||
                      'Unknown Author'
                    : author || 'Anonymous'}
                </span>
                {displayDate && (
                  <>
                    <span>·</span>
                    <time dateTime={displayDate}>
                      {formatDate(displayDate)}
                    </time>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              <Link
                href={postUrl}
                className="hover:text-gray-700 transition-colors"
              >
                {title}
              </Link>
            </h2>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-gray-600 text-base line-clamp-3 mb-4 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Meta Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Topic Badge */}
                {topic && (
                  <Link
                    href={`/blog?topic=${
                      typeof topic === 'object' ? topic.slug || topic.id : topic
                    }`}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {typeof topic === 'object'
                      ? topic.name || topic.title || 'Topic'
                      : topic}
                  </Link>
                )}

                {/* Read Time */}
                <span className="text-sm text-gray-500">
                  {readTime} min read
                </span>

                {/* Status Badge */}
                {(status === 'DRAFT' || isScheduled) && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {status === 'DRAFT' ? 'Draft' : 'Scheduled'}
                  </span>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <HandThumbUpIcon className="w-4 h-4" />
                  <span className="text-sm">{likes}</span>
                </button>

                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span className="text-sm">{comments}</span>
                </button>

                <div className="flex items-center gap-1 text-gray-500">
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-sm">{formatViews(readCount)}</span>
                </div>

                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <BookmarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.slice(0, 4).map((tag, index) => {
                  const tagSlug =
                    typeof tag === 'object' ? tag.slug || tag.id : tag;
                  const tagName =
                    typeof tag === 'object'
                      ? tag.name || tag.title || 'Tag'
                      : tag;

                  return (
                    <Link
                      key={tagSlug || index}
                      href={`/blog?tag=${tagName}`}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      #{tagName}
                    </Link>
                  );
                })}
                {tags.length > 4 && (
                  <span className="text-sm text-gray-400">
                    +{tags.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Image Section */}
          {imageUrl && imageUrl !== '/images/default-post.jpg' && (
            <div className="flex-shrink-0">
              <Link href={postUrl}>
                <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    priority={priority}
                    sizes="128px"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
