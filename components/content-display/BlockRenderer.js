import { Check, Copy } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const CodeBlock = ({ textContent, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg bg-gray-900">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-sm font-medium">
          {language !== 'text' ? language : 'Terminal'}
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-300" />
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 bg-gray-900 overflow-x-auto">
        <pre className="text-sm text-gray-100 font-mono leading-relaxed">
          <code>{textContent}</code>
        </pre>
      </div>
    </div>
  );
};

const BlockRenderer = ({ block }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!block || !block.type) return null;

  const content = block.content || [];
  const textContent = Array.isArray(content)
    ? content.map((item) => item.text || '').join('')
    : typeof content === 'string'
    ? content
    : '';

  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mb-6 leading-relaxed text-gray-700 text-base">
          {textContent}
        </p>
      );

    case 'heading':
      const level = block.props?.level || 1;
      const HeadingTag = `h${level}`;
      const headingClasses = {
        1: 'text-4xl font-bold mb-6 text-gray-900 leading-tight',
        2: 'text-3xl font-semibold mb-5 text-gray-800 leading-tight',
        3: 'text-2xl font-medium mb-4 text-gray-800 leading-tight',
        4: 'text-xl font-medium mb-3 text-gray-800 leading-tight',
        5: 'text-lg font-medium mb-3 text-gray-700 leading-tight',
        6: 'text-base font-semibold mb-2 text-gray-700 leading-tight',
      };
      return (
        <HeadingTag className={headingClasses[level] || headingClasses[3]}>
          {textContent}
        </HeadingTag>
      );

    case 'bulletListItem':
      return (
        <div className="mb-2">
          <ul className="list-none ml-0">
            <li className="flex items-start text-gray-700 leading-relaxed">
              <span className="text-blue-500 mr-3 mt-1.5 text-xs">●</span>
              <span className="flex-1">{textContent}</span>
            </li>
          </ul>
        </div>
      );

    case 'numberedListItem':
      return (
        <div className="mb-2">
          <ol className="list-decimal list-inside ml-0">
            <li className="text-gray-700 leading-relaxed pl-2">
              {textContent}
            </li>
          </ol>
        </div>
      );

    case 'codeBlock':
      const language = block.props?.language || 'text';
      return <CodeBlock textContent={textContent} language={language} />;

    case 'image':
      const src = block.props?.url;
      const alt = block.props?.caption || 'Image';
      const caption = block.props?.caption;
      return src ? (
        <figure className="mb-6">
          <Image
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200"
          />
          {caption && (
            <figcaption className="text-sm text-gray-600 text-center mt-3 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      ) : null;

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-blue-500 pl-6 py-2 mb-6 bg-gray-50 rounded-r-lg">
          <p className="text-gray-700 italic leading-relaxed text-lg">
            {textContent}
          </p>
        </blockquote>
      );

    case 'divider':
      return <hr className="border-0 h-px bg-gray-300 mb-6" />;

    case 'link':
      const url = block.props?.url || '#';
      const linkTitle = block.props?.title || '';
      return (
        <a
          href={url}
          title={linkTitle}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors duration-200"
        >
          {textContent}
        </a>
      );

    case 'table':
      const rows = block.content || [];
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  {row.content?.map((cell, cellIndex) => {
                    const cellContent =
                      cell.content?.[0]?.text || cell.text || '';
                    const isHeader = rowIndex === 0;
                    const CellTag = isHeader ? 'th' : 'td';

                    return (
                      <CellTag
                        key={cellIndex}
                        className={`px-6 py-3 text-left border-b border-gray-200 ${
                          isHeader
                            ? 'font-semibold text-gray-900 bg-gray-100'
                            : 'text-gray-700'
                        }`}
                      >
                        {cellContent}
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'accordion':
      const accordionTitle = block.props?.title || 'Accordion';

      return (
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">{accordionTitle}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isOpen && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="text-gray-700 leading-relaxed">{textContent}</div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="mb-4 text-gray-700 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
          <small className="text-gray-500 block mb-1">
            Unknown block type: {block.type}
          </small>
          {textContent}
        </div>
      );
  }
};

export default BlockRenderer;
