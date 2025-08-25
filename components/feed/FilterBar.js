'use client';

import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

// You can fetch these dynamically from your API or keep them static
const TOPICS = [
  { value: 'technology', label: 'প্রযুক্তি' },
  { value: 'lifestyle', label: 'জীবনযাত্রা' },
  { value: 'business', label: 'ব্যবসা' },
  { value: 'health', label: 'স্বাস্থ্য' },
  { value: 'education', label: 'শিক্ষা' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'সর্বশেষ' },
  { value: 'oldest', label: 'পুরনো' },
  { value: 'title_asc', label: 'শিরোনাম (ক-য)' },
  { value: 'title_desc', label: 'শিরোনাম (য-ক)' },
  { value: 'published_latest', label: 'প্রকাশিত (নতুন)' },
  { value: 'published_oldest', label: 'প্রকাশিত (পুরনো)' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'MARKDOWN', label: 'মার্কডাউন' },
  { value: 'EDITOR', label: 'এডিটর' },
  { value: 'HTML', label: 'HTML' },
];

export default function FilterBar({
  initialFilters,
  availableTopics,
  availableTags,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialFilters?.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // Use dynamic topics if available, otherwise fallback to static
  const topicOptions = availableTopics?.length > 0 ? availableTopics : TOPICS;

  const updateURL = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : '/blog', { scroll: false });
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      const currentFilters = {
        topic: searchParams.get('topic'),
        tag: searchParams.get('tag'),
        sort: searchParams.get('sort') || 'latest',
        search: searchParams.get('search'),
        contentType: searchParams.get('contentType'),
        hasImage: searchParams.get('hasImage'),
      };

      updateURL({
        ...currentFilters,
        [key]: value === currentFilters[key] ? null : value,
      });
    },
    [searchParams, updateURL]
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      handleFilterChange('search', searchQuery.trim());
    },
    [searchQuery, handleFilterChange]
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    router.push('/blog');
  }, [router]);

  const activeFiltersCount = [
    searchParams.get('topic'),
    searchParams.get('tag'),
    searchParams.get('search'),
    searchParams.get('contentType'),
    searchParams.get('hasImage'),
  ].filter(Boolean).length;

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            placeholder="পোস্ট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 relative"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          ফিল্টার
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">ফিল্টার অপশন</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Topics */}
            <div>
              <h4 className="font-medium mb-3">বিষয়</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {topicOptions.map((topic) => (
                  <label
                    key={topic.value || topic.slug}
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={
                        searchParams.get('topic') ===
                        (topic.slug || topic.value)
                      }
                      onChange={() =>
                        handleFilterChange('topic', topic.slug || topic.value)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">
                      {topic.name || topic.label}
                      {topic.postCount && (
                        <span className="text-gray-500 ml-1">
                          ({topic.postCount})
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h4 className="font-medium mb-3">সাজানো</h4>
              <div className="space-y-2">
                {SORT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={
                        (searchParams.get('sort') || 'latest') === option.value
                      }
                      onChange={() => handleFilterChange('sort', option.value)}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <h4 className="font-medium mb-3">অতিরিক্ত</h4>
              <div className="space-y-3">
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    কন্টেন্ট টাইপ
                  </label>
                  <select
                    value={searchParams.get('contentType') || ''}
                    onChange={(e) =>
                      handleFilterChange('contentType', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">সব</option>
                    {CONTENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Has Image Filter */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchParams.get('hasImage') === 'true'}
                    onChange={() =>
                      handleFilterChange(
                        'hasImage',
                        searchParams.get('hasImage') === 'true' ? null : 'true'
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">শুধু ছবি সহ পোস্ট</span>
                </label>
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchParams.get('topic') && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {topicOptions.find(
                (t) => (t.slug || t.value) === searchParams.get('topic')
              )?.name ||
                topicOptions.find(
                  (t) => (t.slug || t.value) === searchParams.get('topic')
                )?.label ||
                searchParams.get('topic')}
              <button
                onClick={() => handleFilterChange('topic', null)}
                className="ml-2 hover:text-blue-600"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('tag') && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              #{searchParams.get('tag')}
              <button
                onClick={() => handleFilterChange('tag', null)}
                className="ml-2 hover:text-purple-600"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('search') && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
              "{searchParams.get('search')}"
              <button
                onClick={() => handleFilterChange('search', null)}
                className="ml-2 hover:text-green-600"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('contentType') && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              {
                CONTENT_TYPE_OPTIONS.find(
                  (opt) => opt.value === searchParams.get('contentType')
                )?.label
              }
              <button
                onClick={() => handleFilterChange('contentType', null)}
                className="ml-2 hover:text-orange-600"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('hasImage') === 'true' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              ছবি সহ
              <button
                onClick={() => handleFilterChange('hasImage', null)}
                className="ml-2 hover:text-gray-600"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
