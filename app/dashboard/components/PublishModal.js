'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, Globe } from 'lucide-react';
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

// Utility Functions
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const checkSlugUniqueness = async (slug, currentSlug = null) => {
  if (!slug) return false;
  if (slug === currentSlug) return true; // Same slug in edit mode
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Math.random() > 0.3; // Mock logic - replace with actual API call
};

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
  const [slug, setSlug] = useState('');
  const [tags, setTags] = useState([]);
  const [excerpt, setExcerpt] = useState('');
  const [order, setOrder] = useState('0');
  const [slugStatus, setSlugStatus] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [publishDate, setPublishDate] = useState(null); // Initialize as null first

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);

    // Initialize states after mounting
    if (initialData) {
      setSlug(initialData.slug || '');
      setTags(
        initialData.tags
          ? initialData.tags.map((tag) => ({ value: tag, label: tag }))
          : []
      );
      setExcerpt(initialData.excerpt || '');
      setOrder(initialData.order?.toString() || '0');
      setIsSlugManuallyEdited(isEditMode);
      setIsScheduling(initialData.status === 'SCHEDULED' || false);

      // Handle date only after mounting to prevent SSR mismatch
      if (initialData.publishDate) {
        setPublishDate(new Date(initialData.publishDate));
      } else {
        setPublishDate(new Date());
      }
    } else {
      // Default values for create mode
      setSlug('');
      setTags([]);
      setExcerpt('');
      setOrder('0');
      setIsSlugManuallyEdited(false);
      setIsScheduling(false);
      setPublishDate(new Date());
    }
  }, [initialData, isEditMode]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!mounted) return;

    if (open && title && !isSlugManuallyEdited) {
      const newSlug = generateSlug(title);
      setSlug(newSlug);
      if (newSlug) {
        setSlugStatus('checking');
        checkSlugUniqueness(newSlug, initialData?.slug).then((isUnique) => {
          setSlugStatus(isUnique ? 'available' : 'taken');
        });
      }
    }
  }, [open, title, isSlugManuallyEdited, initialData?.slug, mounted]);

  const handleSlugChange = (e) => {
    if (!mounted) return;

    const newSlug = generateSlug(e.target.value);
    setSlug(newSlug);
    setIsSlugManuallyEdited(true);

    if (newSlug) {
      setSlugStatus('checking');
      checkSlugUniqueness(newSlug, initialData?.slug).then((isUnique) => {
        setSlugStatus(isUnique ? 'available' : 'taken');
      });
    } else {
      setSlugStatus('');
    }
  };

  const handlePublishClick = () => {
    if (!mounted || !publishDate) return;

    onPublish({
      isScheduling,
      publishDate,
      slug,
      tags,
      excerpt,
      order,
      previewImage,
    });
  };

  // Reset modal state when closed (only for create mode)
  useEffect(() => {
    if (!mounted) return;

    if (!open && !isEditMode) {
      const timer = setTimeout(() => {
        setSlug('');
        setTags([]);
        setExcerpt('');
        setOrder('0');
        setSlugStatus('');
        setIsSlugManuallyEdited(false);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {isEditMode ? 'Update your story' : 'Ready to publish?'}
          </DialogTitle>
          <p className="text-slate-600 mt-2">
            {isEditMode
              ? 'Make changes to your published story'
              : 'Configure your story settings and publish to the world'}
          </p>
        </DialogHeader>

        <div className="space-y-8 py-6 overflow-y-auto max-h-[60vh]">
          {/* Preview Image Upload */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <ImageUpload
              label="📸 Story Preview Image"
              setImage={setPreviewImage}
              imagePreview={previewImagePreview || ''}
              className="w-full h-40"
            />
            <p className="text-xs text-slate-500 mt-2">
              This image will be shown when your story is shared on social media
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slug Input */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <Label
                htmlFor="slug"
                className="mb-3 block font-semibold text-slate-700"
              >
                🔗 Story URL *
              </Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  placeholder="my-awesome-post"
                  className={cn(
                    'pl-4 pr-12 h-12 rounded-lg border-2 transition-all',
                    slugStatus === 'taken' && 'border-red-300 bg-red-50',
                    slugStatus === 'available' &&
                      'border-emerald-300 bg-emerald-50',
                    slugStatus === 'checking' && 'border-blue-300 bg-blue-50'
                  )}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {slugStatus === 'checking' && (
                    <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  )}
                  {slugStatus === 'available' && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                  {slugStatus === 'taken' && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">×</span>
                    </div>
                  )}
                </div>
              </div>

              {slugStatus === 'checking' && (
                <p className="text-xs text-blue-600 mt-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Checking availability...
                </p>
              )}
              {slugStatus === 'available' && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Perfect! This URL is available
                </p>
              )}
              {slugStatus === 'taken' && (
                <p className="text-xs text-red-600 mt-2 flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  This URL is already taken
                </p>
              )}

              <p className="text-xs text-slate-500 mt-2">
                yoursite.com/posts/
                <span className="font-mono font-semibold">
                  {slug || 'your-url'}
                </span>
              </p>
            </div>

            {/* Order */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <Label
                htmlFor="order"
                className="mb-3 block font-semibold text-slate-700"
              >
                📊 Display Order
              </Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                min="0"
                className="h-12 rounded-lg border-2 border-slate-200 focus:border-blue-400"
              />
              <p className="text-xs text-slate-500 mt-2">
                Lower numbers appear first in listings
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <Label
              htmlFor="tags"
              className="mb-3 block font-semibold text-slate-700"
            >
              🏷️ Tags
            </Label>
            <MultiSelect
              options={MOCK_TAGS}
              selected={tags}
              onChange={setTags}
            />
            <p className="text-xs text-slate-500 mt-2">
              Help readers discover your story with relevant tags
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <Label
              htmlFor="excerpt"
              className="mb-3 block font-semibold text-slate-700"
            >
              📝 Story Excerpt
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief, compelling description that will hook your readers..."
              rows={4}
              className="resize-none rounded-lg border-2 border-slate-200 focus:border-blue-400"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">
                This appears in search results and social media previews
              </p>
              <span className="text-xs text-slate-400">
                {excerpt.length}/160
              </span>
            </div>
          </div>

          {/* Scheduling */}
          {isScheduling && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <Label className="mb-3 block font-semibold text-slate-700 flex items-center">
                ⏰ Schedule Publication
              </Label>
              <DateTimePicker date={publishDate} setDate={setPublishDate} />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col gap-2">
            {!isScheduling ? (
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsScheduling(true)}
              >
                📅 Schedule for later instead
              </Button>
            ) : (
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsScheduling(false)}
              >
                🚀 Publish immediately instead
              </Button>
            )}
            <p className="text-xs text-slate-500">
              {isScheduling
                ? 'Your story will be published automatically at the scheduled time'
                : 'Your story will be live immediately after publishing'}
            </p>
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none rounded-xl border-2 border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublishClick}
              disabled={isSubmitting || !slug || slugStatus === 'taken'}
              className={cn(
                'flex-1 sm:flex-none rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200',
                isScheduling
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
              )}
            >
              {isSubmitting && (
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {getPublishButtonText()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishModal;
