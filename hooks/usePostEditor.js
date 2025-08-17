import { createPostAction, updatePostAction } from '@/actions/post';
import { useCallback, useState } from 'react';

export function usePostEditor(mode, initialPost) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submitPost = useCallback(async (formData, isEdit = false) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = isEdit
        ? await updatePostAction(formData)
        : await createPostAction(formData);

      if (result.success) {
        setMessage(result.message);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Something went wrong');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const saveDraft = useCallback(async (formData, isEdit = false) => {
    setIsSaving(true);
    setError(null);

    try {
      formData.set('status', 'DRAFT');

      const result = isEdit
        ? await updatePostAction(formData)
        : await createPostAction(formData);

      if (result.success) {
        setMessage('Draft saved successfully!');
        setTimeout(() => setMessage(null), 3000);
        return { success: true };
      } else {
        setError(result.error || 'Failed to save draft');
        return { success: false };
      }
    } catch (err) {
      setError('Failed to save draft');
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSubmitting,
    isSaving,
    message,
    error,
    submitPost,
    saveDraft,
    clearMessage: () => setMessage(null),
    clearError: () => setError(null),
  };
}
