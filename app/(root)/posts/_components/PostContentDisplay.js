'use client';

import BlockNoteDisplay from '@/components/content-display/BlockNoteDisplay';
import MarkdownDisplay from '@/components/content-display/MarkdownDisplay';
import { Suspense } from 'react';

// show html format
const HTMLDisplay = ({ content }) => (
  <div
    className="prose prose-lg max-w-none"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

const PostContentDisplay = ({ post }) => {
  // পোস্ট অবজেক্ট থেকে সম্ভাব্য সব ধরনের কন্টেন্ট ফিল্ড নিন
  const { content, contentType, htmlContent, excerpt } = post;

  // কন্টেন্ট রেন্ডার করার জন্য একটি ফাংশন তৈরি করা হলো
  const renderContent = () => {
    // ১. প্রথমে contentType অনুযায়ী কন্টেন্ট দেখানোর চেষ্টা করুন
    if (content) {
      if (contentType === 'EDITOR') {
        return <BlockNoteDisplay content={content} />;
      }
      if (contentType === 'MARKDOWN') {
        return <MarkdownDisplay content={content} />;
      }
    }

    // ২. যদি উপরের কোনোটি না পাওয়া যায়, তাহলে htmlContent (প্রি-রেন্ডার করা) দেখান
    if (htmlContent) {
      return <HTMLDisplay content={htmlContent} />;
    }

    // ৩. যদি কোনো কন্টেন্টই না থাকে, কিন্তু excerpt থাকে, তাহলে সেটি একটি সতর্কবার্তাসহ দেখান
    if (excerpt) {
      return (
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">{excerpt}</p>
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
            <p className="text-sm">
              <strong>Note:</strong> Only an excerpt is available. The full
              content may not have been saved properly.
            </p>
          </div>
        </div>
      );
    }

    // ৪. যদি কোনো কিছুই না পাওয়া যায়, তাহলে একটি চূড়ান্ত বার্তা দেখান
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No content available for this post.</p>
      </div>
    );
  };

  return (
    <div className="post-content">
      <Suspense
        fallback={
          <div className="p-4 text-center text-gray-500">
            Loading content...
          </div>
        }
      >
        {renderContent()}
      </Suspense>
    </div>
  );
};

export default PostContentDisplay;
