import {
  CalendarIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  HandThumbUpIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { TrashIcon as TrashSolidIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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

export default function DashboardPostCard({
  post,
  priority = false,
  onEdit,
  onDelete,
  onDuplicate,
  onSchedule,
  onPublish,
  onUnpublish,
  onShare,
  showActions = true,
  isDeleting = false,
  isPublishing = false,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Map API response fields to component fields
  const {
    id,
    slug,
    title,
    excerpt,
    previewImageUrl,
    publishDate,
    createdAt,
    updatedAt,
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
  const editUrl = `/dashboard/posts/edit/${slug || id}`;

  // Use previewImageUrl first, then default
  const imageUrl = previewImageUrl || '/images/default-post.jpg';

  // Use publishDate if available, otherwise createdAt
  const displayDate = publishDate || createdAt;
  const lastModified = updatedAt || createdAt;

  const isDraft = status === 'DRAFT';
  const isPublished = status === 'PUBLISHED';

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.(post);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    onEdit?.(post);
  };

  const handleDuplicate = () => {
    onDuplicate?.(post);
    setShowActionsMenu(false);
  };

  const handleSchedule = () => {
    onSchedule?.(post);
    setShowActionsMenu(false);
  };

  const handlePublish = () => {
    onPublish?.(post);
    setShowActionsMenu(false);
  };

  const handleUnpublish = () => {
    onUnpublish?.(post);
    setShowActionsMenu(false);
  };

  const handleShare = () => {
    onShare?.(post);
    setShowActionsMenu(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex gap-6">
          {/* Content Section */}
          <div className="flex-1">
            {/* Header with Status and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
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
                      : author || 'You'}
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

              {/* Action Buttons */}
              {showActions && (
                <div className="flex items-center gap-2">
                  {/* Primary Actions */}
                  <Link
                    href={editUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    onClick={handleEdit}
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </Link>

                  {/* Delete Button with Confirmation */}
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <TrashSolidIcon className="w-4 h-4" />
                            Confirm
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="inline-flex items-center px-2 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  )}

                  {/* More Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      className="inline-flex items-center px-2 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {showActionsMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="py-1">
                          {isDraft && (
                            <>
                              <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                              >
                                {isPublishing ? (
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                )}
                                {isPublishing ? 'Publishing...' : 'Publish Now'}
                              </button>
                              <button
                                onClick={handleSchedule}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <CalendarIcon className="w-4 h-4" />
                                Schedule
                              </button>
                            </>
                          )}

                          {isPublished && (
                            <button
                              onClick={handleUnpublish}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <ClockIcon className="w-4 h-4" />
                              Unpublish
                            </button>
                          )}

                          <button
                            onClick={handleDuplicate}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                            Duplicate
                          </button>

                          <button
                            onClick={handleShare}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <ShareIcon className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              <Link
                href={postUrl}
                className="hover:text-blue-600 transition-colors"
              >
                {title}
              </Link>
            </h3>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-gray-600 text-base line-clamp-2 mb-4 leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Status and Meta Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : isScheduled
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status === 'DRAFT'
                    ? 'Draft'
                    : isScheduled
                    ? 'Scheduled'
                    : status === 'PUBLISHED'
                    ? 'Published'
                    : status}
                </span>

                {/* Topic Badge */}
                {topic && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {typeof topic === 'object'
                      ? topic.name || topic.title || 'Topic'
                      : topic}
                  </span>
                )}

                {/* Read Time */}
                <span className="text-sm text-gray-500">
                  {readTime} min read
                </span>

                {/* Last Modified */}
                {lastModified && (
                  <span className="text-xs text-gray-400">
                    Modified: {formatDate(lastModified)}
                  </span>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-500">
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-sm">{formatViews(readCount)}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <HandThumbUpIcon className="w-4 h-4" />
                  <span className="text-sm">{likes}</span>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span className="text-sm">{comments}</span>
                </div>
              </div>

              {/* View Post Link */}
              <Link
                href={postUrl}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                View Post →
              </Link>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.slice(0, 3).map((tag, index) => {
                  const tagName =
                    typeof tag === 'object'
                      ? tag.name || tag.title || 'Tag'
                      : tag;

                  return (
                    <span
                      key={index}
                      className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded"
                    >
                      #{tagName}
                    </span>
                  );
                })}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Image Section */}
          {imageUrl && imageUrl !== '/images/default-post.jpg' && (
            <div className="flex-shrink-0">
              <Link href={postUrl}>
                <div className="w-32 h-32 relative overflow-hidden rounded-lg border border-gray-200">
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
    </div>
  );
}
