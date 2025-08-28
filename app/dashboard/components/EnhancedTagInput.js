'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, Tag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const EnhancedTagInput = ({
  tags = [],
  onChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  className = '',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Popular/suggested tags - you can fetch this from your API
  const popularTags = [
    'react',
    'nextjs',
    'typescript',
    'javascript',
    'nodejs',
    'web-development',
    'frontend',
    'backend',
    'tutorial',
    'programming',
    'design',
    'ui-ux',
    'css',
    'html',
    'api',
    'database',
    'mongodb',
    'postgresql',
    'docker',
    'aws',
    'deployment',
    'testing',
    'performance',
  ];

  // Fetch tag suggestions from API (you can implement this)
  const fetchTagSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      // Filter popular tags based on input
      const filtered = popularTags
        .filter(
          (tag) =>
            tag.toLowerCase().includes(query.toLowerCase()) &&
            !tags.some(
              (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
            )
        )
        .slice(0, 5);

      setSuggestions(filtered);
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced suggestions fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTagSuggestions(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, tags]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagValue) => {
    if (!tagValue || !tagValue.trim()) return;

    const trimmedTag = tagValue.trim();

    // Check for duplicates (case insensitive)
    if (tags.some((tag) => tag.toLowerCase() === trimmedTag.toLowerCase())) {
      return;
    }

    // Check max tags limit
    if (tags.length >= maxTags) {
      return;
    }

    onChange([...tags, trimmedTag]);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ',':
        e.preventDefault();
        addTag(inputValue);
        break;
      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          removeTag(tags.length - 1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Remove commas and prevent them from being typed
    const cleanValue = value.replace(/,/g, '');
    setInputValue(cleanValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Tags and Input Container */}
      <div
        className={cn(
          'min-h-[2.5rem] p-3 border rounded-lg bg-white cursor-text transition-colors',
          'hover:border-gray-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100',
          disabled && 'bg-gray-50 cursor-not-allowed',
          tags.length >= maxTags && 'border-orange-300 bg-orange-50'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Render existing tags */}
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 pr-1 py-1 text-sm font-medium"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}

          {/* Input field */}
          {tags.length < maxTags && (
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={tags.length === 0 ? placeholder : ''}
              disabled={disabled}
              className="border-0 p-0 h-auto focus:ring-0 flex-1 min-w-[120px] bg-transparent"
            />
          )}
        </div>

        {/* Tag counter */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Press Enter or comma to add tag</span>
          </div>
          <span
            className={cn(
              'text-xs font-medium',
              tags.length >= maxTags ? 'text-orange-600' : 'text-gray-400'
            )}
          >
            {tags.length}/{maxTags} tags
          </span>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {loadingSuggestions ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading suggestions...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Suggested Tags
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          ) : inputValue.length >= 2 ? (
            <div className="p-3">
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 transition-colors flex items-center space-x-2 border border-dashed border-gray-300 rounded"
              >
                <Plus className="w-3 h-3 text-blue-600" />
                <span className="text-sm">
                  Create "
                  <span className="font-medium text-blue-600">
                    {inputValue}
                  </span>
                  " tag
                </span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EnhancedTagInput;
