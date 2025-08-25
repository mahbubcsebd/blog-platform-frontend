// app/admin/topics/TopicsPage.js
'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  EyeIcon,
  FolderIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import TopicModal from './components/TopicModal';

const TopicsPage = () => {
  const { isAuthenticated, loading, authenticatedFetch, user } = useAuth();
  const router = useRouter();

  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('all');

  // Modals
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [showTopicDetails, setShowTopicDetails] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [deletingTopicId, setDeletingTopicId] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/sign-in');
    if (!loading && isAuthenticated && user?.role !== 'ADMIN')
      router.push('/dashboard');
  }, [loading, isAuthenticated, user, router]);

  // Fetch topics
  const fetchTopics = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;
    setTopicsLoading(true);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/topic`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setTopics(data.data || []);
        setFilteredTopics(data.data || []);
      } else showMessage(data.message || 'Failed to load topics', 'error');
    } catch (err) {
      console.error(err);
      showMessage('Failed to load topics', 'error');
    } finally {
      setTopicsLoading(false);
    }
  }, [isAuthenticated, user, authenticatedFetch]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') fetchTopics();
  }, [isAuthenticated, user, fetchTopics]);

  // Filters
  useEffect(() => {
    let filtered = topics;
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (parentFilter !== 'all') {
      filtered = filtered.filter(
        (t) =>
          (parentFilter === 'root' && !t.parentId) ||
          (parentFilter === 'child' && t.parentId)
      );
    }
    setFilteredTopics(filtered);
  }, [topics, searchTerm, parentFilter]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const handleAddTopic = () => {
    setEditingTopic(null);
    setShowTopicModal(true);
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setShowTopicModal(true);
  };

  const handleDeleteTopic = async (id) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    setDeletingTopicId(id);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/topic/${id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setTopics((prev) => prev.filter((t) => t.id !== id));
        showMessage('Topic deleted', 'success');
      } else showMessage(data.message || 'Failed', 'error');
    } catch (err) {
      console.error(err);
      showMessage('Failed', 'error');
    } finally {
      setDeletingTopicId(null);
    }
  };

  const handleViewTopic = (topic) => {
    setSelectedTopic(topic);
    setShowTopicDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
            <p className="text-gray-600 mt-1">
              Manage all topics and hierarchy
            </p>
          </div>
          <button
            onClick={handleAddTopic}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" /> Add Topic
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`${
              messageType === 'success'
                ? 'bg-green-100 border-green-400 text-green-700'
                : 'bg-red-100 border-red-400 text-red-700'
            } border px-4 py-3 rounded-lg flex items-center shadow-sm`}
          >
            <div className="flex-shrink-0">
              {messageType === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3 font-medium">{message}</div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="root">Root</option>
              <option value="child">Sub</option>
            </select>
            <FunnelIcon className="w-4 h-4 absolute right-2 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Topics Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {filteredTopics.length === 0 ? (
            <div className="p-12 text-center">
              <FolderIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No topics
              </h3>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {topic.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {topic.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {topic.parent?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(topic.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewTopic(topic)}
                        className="inline-flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" /> View
                      </button>
                      <button
                        onClick={() => handleEditTopic(topic)}
                        className="inline-flex items-center px-3 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        disabled={deletingTopicId === topic.id}
                        className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                          deletingTopicId === topic.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                        }`}
                      >
                        {deletingTopicId === topic.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <TrashIcon className="w-4 h-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Topic Modal */}
      <TopicModal
        open={showTopicModal}
        setOpen={setShowTopicModal} // onOpenChange এর পরিবর্তে setOpen
        topics={topics}
        topic={editingTopic} // editTopic এর পরিবর্তে topic
        onSuccess={(newTopic) => {
          if (editingTopic) {
            setTopics((prev) =>
              prev.map((t) => (t.id === newTopic.id ? newTopic : t))
            );
          } else {
            setTopics((prev) => [newTopic, ...prev]);
          }
          setEditingTopic(null);
        }}
      />
    </div>
  );
};

export default TopicsPage;
