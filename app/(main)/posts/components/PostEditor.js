'use client';

import { createPostAction, updatePostAction } from '@/actions/post';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import PublishModal from './PublishModal';

// CodeMirror এবং এর থিম ও ভাষা ইম্পোর্ট করুন
// import MarkdownDisplay from '@/app/posts/_components/content-display/MarkdownDisplay';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react';
import MarkdownDisplay from '../_components/content-display/MarkdownDisplay';

const EditorShadcn = dynamic(() => import('@/components/EditorShadcn'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  ),
});

/**
 * PostEditor Component
 * @param {Object} props
 * @param {string} props.mode - 'create' or 'edit'
 * @param {Object|null} props.initialData - Initial post data for edit mode
 * @param {boolean} props.isLoading - Loading state
 */
export default function PostEditor({
  mode = 'create',
  initialData = null,
  isLoading = false,
}) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  // Transform the data structure to match component expectations
  const transformedInitialData = initialData
    ? {
        id: initialData.id,
        title: initialData.title,
        content: initialData.content,
        contentType: initialData.contentType,
        htmlContent: initialData.htmlContent,
        slug: initialData.slug,
        excerpt: initialData.excerpt,
        order: initialData.order,
        tags: initialData.tags || [],
        status: initialData.status,
        publishDate: initialData.publishDate,
        previewImage: initialData.previewImageUrl || null,
      }
    : null;

  // Safe parsing for editor content
  const getInitialEditorContent = () => {
    if (
      transformedInitialData?.content &&
      transformedInitialData?.contentType === 'EDITOR'
    ) {
      try {
        const parsedContent = JSON.parse(transformedInitialData.content);
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          return {
            json: parsedContent,
            html: transformedInitialData.htmlContent || '',
          };
        }
      } catch (error) {
        console.warn('Failed to parse initial editor content:', error);
      }
    }
    // Return default content that BlockNote expects
    return {
      json: [
        {
          id: 'initial-block',
          type: 'paragraph',
          props: {},
          content: [],
          children: [],
        },
      ],
      html: '',
    };
  };

  // State management
  const [title, setTitle] = useState(transformedInitialData?.title || '');
  const [contentType, setContentType] = useState(
    transformedInitialData?.contentType || 'MARKDOWN'
  );
  const [editorContent, setEditorContent] = useState(getInitialEditorContent);
  const [markdownContent, setMarkdownContent] = useState(
    transformedInitialData?.contentType === 'MARKDOWN'
      ? transformedInitialData?.content || ''
      : ''
  );
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImagePreview, setPreviewImagePreview] = useState(
    transformedInitialData?.previewImage || null
  );
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Re-initialize when initialData changes (for edit mode)
  useEffect(() => {
    if (transformedInitialData) {
      setTitle(transformedInitialData.title || '');
      setContentType(transformedInitialData.contentType || 'MARKDOWN');
      setMarkdownContent(
        transformedInitialData.contentType === 'MARKDOWN'
          ? transformedInitialData.content || ''
          : ''
      );
      setPreviewImagePreview(transformedInitialData.previewImage || null);

      // Reset editor content for edit mode
      if (transformedInitialData.contentType === 'EDITOR') {
        try {
          const parsedContent = JSON.parse(transformedInitialData.content);
          if (Array.isArray(parsedContent) && parsedContent.length > 0) {
            setEditorContent({
              json: parsedContent,
              html: transformedInitialData.htmlContent || '',
            });
          }
        } catch (error) {
          console.warn('Failed to parse editor content on data change:', error);
        }
      }
    }
  }, [initialData, transformedInitialData]);

  // Track changes for unsaved indicator
  useEffect(() => {
    const initialTitle = transformedInitialData?.title || '';
    const initialMarkdown =
      transformedInitialData?.contentType === 'MARKDOWN'
        ? transformedInitialData?.content || ''
        : '';

    let initialEditor = [];
    if (
      transformedInitialData?.content &&
      transformedInitialData?.contentType === 'EDITOR'
    ) {
      try {
        initialEditor = JSON.parse(transformedInitialData.content);
      } catch (error) {
        console.warn(
          'Error parsing initial editor content for comparison:',
          error
        );
      }
    }

    const hasChanges =
      title !== initialTitle ||
      markdownContent !== initialMarkdown ||
      JSON.stringify(editorContent.json) !== JSON.stringify(initialEditor);

    setHasUnsavedChanges(hasChanges);
  }, [title, markdownContent, editorContent, transformedInitialData]);

  const handleEditorChange = (content) => {
    setEditorContent(content || { json: [], html: '' });
  };

  const resetForm = () => {
    if (!isEditMode) {
      setTitle('');
      setEditorContent({
        json: [
          {
            id: 'reset-block',
            type: 'paragraph',
            props: {},
            content: [],
            children: [],
          },
        ],
        html: '',
      });
      setMarkdownContent('');
    }
    setPreviewImage(null);
    setPreviewImagePreview(transformedInitialData?.previewImage || null);
    setShowPublishModal(false);
  };

  const validateForm = (publishData) => {
    if (!title.trim()) throw new Error('Title is required');
    if (!publishData.slug.trim()) throw new Error('URL slug is required');

    const hasContent =
      contentType === 'EDITOR'
        ? Array.isArray(editorContent.json) && editorContent.json.length > 0
        : markdownContent.trim();

    if (!hasContent) throw new Error('Content is required');
  };

  const createFormData = (publishData) => {
    const formData = new FormData();
    formData.set('title', title.trim());
    formData.set('slug', publishData.slug.trim());
    formData.set('order', publishData.order || '0');
    formData.set('excerpt', publishData.excerpt || '');
    formData.set('contentType', contentType);

    if (Array.isArray(publishData.tags) && publishData.tags.length > 0) {
      formData.set(
        'tags',
        JSON.stringify(publishData.tags.map((tag) => tag.value || tag))
      );
    }

    if (publishData.isScheduling) {
      formData.set('status', 'SCHEDULED');
      formData.set('publishDate', publishData.publishDate.toISOString());
    } else {
      formData.set('status', 'PUBLISHED');
    }

    if (contentType === 'EDITOR') {
      const jsonContent = Array.isArray(editorContent.json)
        ? editorContent.json
        : [];
      formData.set('content', JSON.stringify(jsonContent));
      if (editorContent.html) formData.set('htmlContent', editorContent.html);
    } else if (contentType === 'MARKDOWN') {
      formData.set('content', markdownContent);
    }

    if (previewImage) formData.append('previewImage', previewImage);
    if (isEditMode && transformedInitialData?.id)
      formData.set('id', transformedInitialData.id);

    return formData;
  };

  const handleSubmit = async (publishData) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      validateForm(publishData);
      const formData = createFormData(publishData);

      const result = isEditMode
        ? await updatePostAction(formData)
        : await createPostAction(formData);

      if (result.success) {
        setMessage(result.message);
        setHasUnsavedChanges(false);
        resetForm();

        setTimeout(() => {
          router.push(`/posts/${publishData.slug}`);
        }, 1000);
      } else {
        setError(result.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Post operation error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('Title is required to save draft');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const draftData = {
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        tags: [],
        excerpt: '',
        order: '0',
        isScheduling: false,
        publishDate: new Date(),
      };

      const formData = createFormData(draftData);
      formData.set('status', 'DRAFT');

      const result = isEditMode
        ? await updatePostAction(formData)
        : await createPostAction(formData);

      if (result.success) {
        setMessage('Draft saved successfully!');
        setHasUnsavedChanges(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to save draft');
      }
    } catch (err) {
      setError('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPreviewImage = (file) => {
    setPreviewImage(file);
    setPreviewImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const clearPreviewImage = () => {
    setPreviewImage(null);
    setPreviewImagePreview(transformedInitialData?.previewImage || null);
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      if (
        typeof window !== 'undefined' &&
        window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="space-y-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header */}
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="hover:bg-slate-100 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {isEditMode ? 'Edit Story' : 'Write a Story'}
                  </h1>
                  {hasUnsavedChanges && (
                    <p className="text-xs text-amber-600 font-medium">
                      You have unsaved changes
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shadow-inner">
                  <Button
                    variant={contentType === 'EDITOR' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setContentType('EDITOR')}
                    className="rounded-lg font-medium"
                  >
                    Rich Text
                  </Button>
                  <Button
                    variant={contentType === 'MARKDOWN' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setContentType('MARKDOWN')}
                    className="rounded-lg font-medium"
                  >
                    Markdown
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {contentType === 'MARKDOWN' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="rounded-full"
                >
                  {showPreview ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || !title.trim()}
                className="rounded-full border-slate-300 hover:bg-slate-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowPublishModal(true)}
                disabled={isSubmitting || !title.trim()}
                className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isEditMode ? 'Update...' : 'Publish...'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto px-6 py-10 ${
          contentType === 'MARKDOWN' ? 'max-w-7xl' : 'max-w-5xl'
        }`}
      >
        {/* Status Messages */}
        {message && (
          <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-10">
          {/* Enhanced Title Input */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="p-8">
              <TextareaAutosize
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isEditMode
                    ? 'Update your story title...'
                    : 'Tell your story with a compelling title...'
                }
                className="w-full text-4xl md:text-5xl lg:text-6xl font-bold border-none outline-none resize-none bg-transparent focus:ring-0 text-slate-900 placeholder-slate-400 leading-tight"
                required
              />
              {title.length > 0 && (
                <div className="mt-4 text-sm text-slate-500">
                  {title.length} characters
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Content Editor */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            {contentType === 'MARKDOWN' ? (
              <div
                className={`${
                  showPreview ? 'grid grid-cols-1 lg:grid-cols-2' : ''
                } min-h-[600px]`}
              >
                {/* Markdown Editor */}
                <div
                  className={`${
                    showPreview ? 'border-r border-slate-200' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                      Markdown Editor
                    </h3>
                  </div>
                  <div className="overflow-hidden">
                    <CodeMirror
                      value={markdownContent}
                      height={showPreview ? 'calc(100vh - 400px)' : '600px'}
                      extensions={[markdown()]}
                      theme={oneDark}
                      onChange={(value) => setMarkdownContent(value || '')}
                      basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        autocompletion: true,
                        highlightSelectionMatches: false,
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                {showPreview && (
                  <div className="bg-white">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Live Preview
                      </h3>
                    </div>
                    <div className="p-8 overflow-y-auto max-h-[calc(100vh-400px)]">
                      <MarkdownDisplay
                        content={
                          markdownContent ||
                          '## Live Preview\n\nStart typing in the editor to see your content here.\n\n**Bold text**, *italic text*, and `code` will be rendered beautifully.'
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                    Rich Text Editor
                  </h3>
                </div>
                <div className="p-8 min-h-[500px]">
                  <EditorShadcn
                    onChange={handleEditorChange}
                    editable={true}
                    key={message ? 'reset' : 'editor'}
                    initialContent={editorContent.json}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        onPublish={handleSubmit}
        isSubmitting={isSubmitting}
        title={title}
        setPreviewImage={handleSetPreviewImage}
        previewImage={previewImage}
        previewImagePreview={previewImagePreview}
        clearPreviewImage={clearPreviewImage}
        isEditMode={isEditMode}
        initialData={transformedInitialData}
      />
    </div>
  );
}
