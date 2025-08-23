// import PostContentDisplay from '@/components/PostContentDisplay'; // Adjust path as needed
import { getPostBySlug } from '@/utils/fetchPosts';
import Image from 'next/image';
import PostContentDisplay from '../_components/PostContentDisplay';

const SinglePost = async ({ params }) => {
  const awaitedParams = await params;
  const { slug } = awaitedParams;

  try {
    const res = await getPostBySlug(slug);

    if (!res.data) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600">
              The post you're looking for doesn't exist.
            </p>
          </div>
        </div>
      );
    }

    const post = res.data;

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Post Header */}
        <header className="mb-8">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-96 mb-6 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={post.coverImage || '/image.png'}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {post.author.firstName} {post.author.lastName}
                </span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2">
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Topic */}
            {post.topic && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {post.topic.name}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.postTags && post.postTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.postTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                >
                  #{typeof tag === 'string' ? tag : tag.name || 'tag'}
                </span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-lg text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-gray-300 pl-6 italic">
              {post.excerpt}
            </div>
          )}
        </header>

        {/* Post Content */}
        <main className="prose-wrapper">
          <PostContentDisplay post={post} />
        </main>
      </article>
    );
  } catch (error) {
    console.error('Error fetching post:', error);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Post
          </h1>
          <p className="text-gray-600">
            There was an error loading this post. Please try again later.
          </p>
        </div>
      </div>
    );
  }
};

export default SinglePost;
