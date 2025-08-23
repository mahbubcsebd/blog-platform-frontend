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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import DateTimePicker from './DateTimePicker';
import ImageUpload from './ImageUpload';
import MultiSelect from './MultiSelect';

// Constants
const MOCK_TAGS = [
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'programming', label: 'Programming' },
];

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
  // Critical: Use consistent initial states to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [tags, setTags] = useState([]);
  const [excerpt, setExcerpt] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [publishDate, setPublishDate] = useState(null);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);

    // Initialize states after mounting
    if (initialData) {
      setTags(
        initialData.tags
          ? initialData.tags.map((tag) => ({ value: tag, label: tag }))
          : []
      );
      setExcerpt(initialData.excerpt || '');
      setIsScheduling(initialData.status === 'SCHEDULED' || false);

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
                  <MultiSelect
                    options={MOCK_TAGS}
                    selected={tags}
                    onChange={setTags}
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    Help readers discover your story with relevant tags
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
                  />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Appears in search results and social previews
                    </p>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        excerpt.length > 160 ? 'text-red-500' : 'text-gray-400'
                      )}
                    >
                      {excerpt.length}/160
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
                      />
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
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Ready to publish</span>
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
                disabled={isSubmitting}
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
