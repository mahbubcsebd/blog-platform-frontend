'use server';

import { createPost, updatePost } from '@/utils/fetchPosts';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  htmlContent: z.string().optional(),
  contentType: z.enum(['MARKDOWN', 'EDITOR']),
  excerpt: z.string().optional(),
  status: z.enum(['PUBLISHED', 'SCHEDULED', 'DRAFT']),
  publishDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const UpdatePostSchema = PostSchema.extend({
  id: z.string().min(1, 'Post ID is required for update'),
});

function buildFormData(validatedData, previewImage) {
  const formData = new FormData();

  for (const key in validatedData) {
    let value = validatedData[key];

    if (value instanceof Date) {
      value = value.toISOString();
    } else if (Array.isArray(value) || typeof value === 'object') {
      value = JSON.stringify(value);
    }

    formData.append(key, value);
  }

  if (previewImage instanceof File) {
    formData.append('previewImage', previewImage);
  }

  return formData;
}

export async function createPostAction(formData, accessToken) {
  try {
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      htmlContent: formData.get('htmlContent'),
      contentType: formData.get('contentType'),
      excerpt: formData.get('excerpt') || '',
      status: formData.get('status'),
      publishDate: formData.get('publishDate'),
    };

    // Parse tags safely
    try {
      const tagsData = formData.get('tags');
      data.tags = tagsData ? JSON.parse(tagsData) : [];
    } catch {
      data.tags = [];
    }

    // Remove empty strings or undefined
    Object.keys(data).forEach((key) => {
      if (
        data[key] === null ||
        data[key] === undefined ||
        (typeof data[key] === 'string' && data[key].trim() === '')
      ) {
        delete data[key];
      }
    });

    const validatedData = PostSchema.parse(data);
    const previewImage = formData.get('previewImage');

    const formToSend = buildFormData(validatedData, previewImage);

    const response = await createPost(formToSend, accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to create post');
    }

    return {
      success: true,
      message:
        data.status === 'SCHEDULED'
          ? 'Post scheduled successfully!'
          : data.status === 'DRAFT'
          ? 'Draft saved successfully!'
          : 'Post published successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('createPostAction Error:', error);
    return { success: false, error: error.message || 'Something went wrong' };
  }
}

export async function updatePostAction(formData, accessToken) {
  try {
    const data = {
      id: formData.get('id'),
      title: formData.get('title'),
      content: formData.get('content'),
      htmlContent: formData.get('htmlContent'),
      contentType: formData.get('contentType'),
      excerpt: formData.get('excerpt') || '',
      status: formData.get('status'),
      publishDate: formData.get('publishDate'),
    };

    try {
      const tagsData = formData.get('tags');
      data.tags = tagsData ? JSON.parse(tagsData) : [];
    } catch {
      data.tags = [];
    }

    // Remove empty fields except id
    Object.keys(data).forEach((key) => {
      if (
        key !== 'id' &&
        (data[key] === null ||
          data[key] === undefined ||
          (typeof data[key] === 'string' && data[key].trim() === ''))
      ) {
        delete data[key];
      }
    });

    const validatedData = UpdatePostSchema.parse(data);
    const previewImage = formData.get('previewImage');

    const formToSend = buildFormData(validatedData, previewImage);

    const response = await updatePost(
      validatedData.id,
      formToSend,
      accessToken
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to update post');
    }

    return {
      success: true,
      message:
        data.status === 'SCHEDULED'
          ? 'Post updated and scheduled successfully!'
          : data.status === 'DRAFT'
          ? 'Draft updated successfully!'
          : 'Post updated successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('updatePostAction Error:', error);
    return { success: false, error: error.message || 'Something went wrong' };
  }
}
