'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import DateTimePicker from './DateTimePicker';
import EnhancedTagInput from './EnhancedTagInput';
import ImageUpload from './ImageUpload';

const PublishModal = ({
  open,
  onOpenChange,
  onPublish,
  isSubmitting,
  title,
  setPreviewImage,
  previewImage,
  previewImagePreview,
  clearPreviewImage,
  isEditMode = false,
  initialData = null,
}) => {
  // State management
  const [mounted, setMounted] = useState(false);
  const [tags, setTags] = useState([]);
  const [excerpt, setExcerpt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [publishDate, setPublishDate] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Fetch topics from API
  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await fetch('/api/topics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data.data || []);
      } else {
        console.error('Failed to fetch topics');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    fetchTopics();

    // Initialize states after mounting
    if (initialData) {
      setTags(initialData.tags || []);
      setExcerpt(initialData.excerpt || '');
      setIsScheduling(initialData.status === 'SCHEDULED' || false);
      setSelectedTopic(initialData.topicId || '');

      // Handle date only after mounting to prevent SSR mismatch
      if (initialData.publishDate) {
        setPublishDate(new Date(initialData.publishDate));
      } else {
        setPublishDate(new Date());
      }
    } else {
      // Default values for create mode
      setTags([]);
      setExcerpt('');
      setIsScheduling(false);
      setSelectedTopic('');
      setPublishDate(new Date());
    }
  }, [initialData, isEditMode]);

  const handlePublishClick = () => {
    if (!mounted || !publishDate) return;

    onPublish({
      isScheduling,
      publishDate,
      tags,
      excerpt,
      previewImage,
      topicId: selectedTopic,
    });
  };

  // Reset modal state when closed (only for create mode)
  useEffect(() => {
    if (!mounted) return;

    if (!open && !isEditMode) {
      const timer = setTimeout(() => {
        setTags([]);
        setExcerpt('');
        setIsScheduling(false);
        setSelectedTopic('');
        setPublishDate(new Date());
        if (clearPreviewImage) clearPreviewImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, clearPreviewImage, isEditMode, mounted]);

  const getPublishButtonText = () => {
    if (isSubmitting) {
      if (isEditMode) {
        return isScheduling ? 'Updating Schedule...' : 'Updating...';
      }
      return isScheduling ? 'Scheduling...' : 'Publishing...';
    }

    if (isEditMode) {
      return isScheduling ? 'Update Schedule' : 'Update Post';
    }

    return isScheduling ? 'Schedule Post' : 'Publish Now';
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || !publishDate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="publish-modal-content w-[95vw] max-w-6xl h-[90vh] max-h-[90vh] bg-white border-0 shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="pb-6 border-b border-gray-100 flex-shrink-0">
          <DialogTitle className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Update Story' : 'Publish Story'}
          </DialogTitle>
          <p className="text-gray-600 text-lg mt-2">
            {isEditMode
              ? 'Modify your story settings and update'
              : 'Configure your story settings before publishing'}
          </p>
        </DialogHeader>

        {/* Two Column Layout with Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Topic Selection */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Story Category
                </Label>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-400 transition-colors">
                  <Select
                    value={selectedTopic}
                    onValueChange={setSelectedTopic}
                  >
                    <SelectTrigger className="border-0 p-0 h-auto text-base">
                      <SelectValue
                        placeholder={
                          loadingTopics
                            ? 'Loading categories...'
                            : 'Select a category for your story'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <div className="flex items-center space-x-2">
                            <span>{topic.name}</span>
                            {topic.parent && (
                              <span className="text-xs text-gray-500">
                                in {topic.parent.name}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-3">
                    Choose the most relevant category for better discoverability
                  </p>
                </div>
              </div>

              {/* Preview Image Upload */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Story Preview Image
                </Label>
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                  <ImageUpload
                    label=""
                    setImage={setPreviewImage}
                    imagePreview={previewImagePreview || ''}
                    className="w-full h-48"
                  />
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    This image appears when your story is shared on social media
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Tags
                </Label>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-400 transition-colors">
                  <EnhancedTagInput
                    tags={tags}
                    onChange={setTags}
                    placeholder="Add tags to help readers find your story..."
                    maxTags={10}
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    Add up to 10 tags. Press Enter or comma to create a new tag
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Excerpt */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Story Excerpt
                </Label>
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-400 transition-colors">
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a compelling description that will hook your readers..."
                    rows={6}
                    className="border-0 resize-none focus:ring-0 p-0 text-base"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Appears in search results and social previews
                    </p>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        excerpt.length > 160
                          ? 'text-red-500'
                          : excerpt.length > 120
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                      )}
                    >
                      {excerpt.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                  Publication Settings
                </Label>

                {/* Scheduling Toggle */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {isScheduling
                          ? 'Scheduled Publication'
                          : 'Immediate Publication'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {isScheduling
                          ? 'Your story will be published at the scheduled time'
                          : 'Your story will be live immediately after publishing'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsScheduling(!isScheduling)}
                      className="min-w-[100px] rounded-lg"
                    >
                      {isScheduling ? 'Publish Now' : 'Schedule'}
                    </Button>
                  </div>

                  {/* Date Time Picker */}
                  {isScheduling && (
                    <div className="pt-4 border-t border-gray-100">
                      <DateTimePicker
                        date={publishDate}
                        setDate={setPublishDate}
                        minDate={new Date()}
                      />
                      {publishDate && publishDate <= new Date() && (
                        <p className="text-sm text-red-500 mt-2">
                          Please select a future date and time
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-gray-100 pt-6 flex-shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    !title.trim()
                      ? 'bg-red-400'
                      : !selectedTopic && !isEditMode
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  )}
                ></div>
                <span className="text-sm text-gray-600">
                  {!title.trim()
                    ? 'Title required'
                    : !selectedTopic && !isEditMode
                    ? 'Category recommended'
                    : 'Ready to publish'}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg border-2 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublishClick}
                disabled={
                  isSubmitting ||
                  !title.trim() ||
                  (isScheduling && publishDate && publishDate <= new Date())
                }
                className={cn(
                  'px-8 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200',
                  isScheduling
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {isSubmitting && (
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {getPublishButtonText()}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
