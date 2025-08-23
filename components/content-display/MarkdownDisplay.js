'use client';

import { Check, ChevronDown, Copy } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Syntax highlighting theme
import 'highlight.js/styles/atom-one-light.css';
import Image from 'next/image';

// Separate component for code blocks to handle useState properly
const CodeBlock = ({ node, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeString = node?.children[0]?.children[0]?.value || '';
  const language =
    node?.children[0]?.properties?.className?.[0]?.split('-')[1] || 'text';

  const handleCopy = async () => {
    if (!codeString || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group my-6 bg-[#282c34] rounded-xl shadow-lg">
      <div className="bg-gray-800 text-gray-400 text-xs rounded-t-xl flex items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="font-sans">{language}</span>
        <div className="relative">
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Copy code"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <span
            className={`absolute -top-8 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-md transition-all duration-300 ${
              isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            aria-live="polite"
          >
            Copied!
          </span>
        </div>
      </div>

      <pre
        {...props}
        className="!p-4 !mt-0 !bg-transparent overflow-x-auto text-sm leading-relaxed"
      >
        {children}
      </pre>
    </div>
  );
};

const MarkdownDisplay = ({ content }) => {
  const components = {
    // Improved styling for heading and text elements
    h1: ({ node, ...props }) => (
      <h1
        className="text-3xl md:text-4xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="text-2xl md:text-3xl font-semibold mt-7 mb-4 pb-2 border-b border-gray-200"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl md:text-2xl font-semibold mt-6 mb-3" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-base md:text-lg leading-relaxed my-4" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a
        className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside my-4 pl-4 space-y-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside my-4 pl-4 space-y-2" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-base md:text-lg" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-500 bg-blue-50/50 text-blue-900 italic my-6 px-4 py-2"
        {...props}
      />
    ),
    img: ({ node, ...props }) => (
      <Image
        alt="markdown img"
        className="max-w-full h-auto rounded-lg my-6 shadow-md border"
        {...props}
      />
    ),
    hr: ({ node, ...props }) => (
      <hr className="my-8 border-gray-200" {...props} />
    ),

    // Professional table design
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table
          className="w-full border-collapse border border-gray-300"
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
    th: ({ node, ...props }) => (
      <th
        className="border border-gray-300 px-4 py-2 text-left font-semibold"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-gray-300 px-4 py-2" {...props} />
    ),

    // Custom accordion component
    details: ({ node, children, ...props }) => {
      const summary = children[0];
      const content = children.slice(1);
      return (
        <details
          className="group last:mb-0 mb-4 border rounded-lg bg-white shadow-sm overflow-hidden"
          {...props}
        >
          {summary}
          <div className="p-4 border-t border-gray-200">{content}</div>
        </details>
      );
    },
    summary: ({ node, ...props }) => (
      <summary
        className="w-full py-3 px-4 font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50 transition-colors"
        {...props}
      >
        <span className="flex-grow">{props.children}</span>
        <ChevronDown
          className="group-open:rotate-180 transition-transform duration-300 flex-shrink-0"
          size={20}
        />
      </summary>
    ),

    // Use the separate CodeBlock component
    pre: CodeBlock,

    code({ node, inline, className, children, ...props }) {
      if (inline) {
        return (
          <code
            className="bg-gray-200 text-gray-800 rounded px-1.5 py-0.5 font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;
