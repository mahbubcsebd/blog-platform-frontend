'use server';

import { createPost, updatePost } from '@/utils/fetchPosts';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  htmlContent: z.string().optional(),
  contentType: z.enum(['MARKDOWN', 'EDITOR']),
  excerpt: z.string().optional(),
  status: z.enum(['PUBLISHED', 'SCHEDULED', 'DRAFT']),
  publishDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().default(0),
});

const UpdatePostSchema = PostSchema.extend({
  id: z.string().min(1, 'Post ID is required for update'),
});

export async function createPostAction(formData) {
  try {
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      htmlContent: formData.get('htmlContent'),
      contentType: formData.get('contentType'),
      excerpt: formData.get('excerpt') || '',
      status: formData.get('status'),
      publishDate: formData.get('publishDate'),
      order: parseInt(formData.get('order') || '0', 10),
    };

    try {
      const tagsData = formData.get('tags');
      data.tags = tagsData ? JSON.parse(tagsData) : [];
    } catch {
      data.tags = [];
    }

    // Clean up empty fields
    Object.keys(data).forEach((key) => {
      if (
        data[key] === null ||
        data[key] === undefined ||
        (typeof data[key] === 'string' && data[key].trim() === '')
      ) {
        delete data[key];
      }
    });

    // Validate with zod
    const validatedData = PostSchema.parse(data);

    const previewImage = formData.get('previewImage');
    const formToSend = new FormData();

    // Rebuild FormData for actual API call (because createPost expects FormData now)
    for (const key in validatedData) {
      formToSend.append(key, validatedData[key]);
    }

    if (data.tags) {
      formToSend.set('tags', JSON.stringify(data.tags));
    }

    if (previewImage instanceof File) {
      formToSend.append('previewImage', previewImage);
    }

    const response = await createPost(formToSend);

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
    return {
      success: false,
      error: error.message || 'Something went wrong',
    };
  }
}

export async function updatePostAction(formData) {
  try {
    const data = {
      id: formData.get('id'),
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      htmlContent: formData.get('htmlContent'),
      contentType: formData.get('contentType'),
      excerpt: formData.get('excerpt') || '',
      status: formData.get('status'),
      publishDate: formData.get('publishDate'),
      order: parseInt(formData.get('order') || '0', 10),
    };

    try {
      const tagsData = formData.get('tags');
      data.tags = tagsData ? JSON.parse(tagsData) : [];
    } catch {
      data.tags = [];
    }

    // Clean up empty fields except id
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

    // Validate with zod
    const validatedData = UpdatePostSchema.parse(data);

    const previewImage = formData.get('previewImage');
    const formToSend = new FormData();

    // Rebuild FormData for actual API call
    for (const key in validatedData) {
      formToSend.append(key, validatedData[key]);
    }

    if (data.tags) {
      formToSend.set('tags', JSON.stringify(data.tags));
    }

    if (previewImage instanceof File) {
      formToSend.append('previewImage', previewImage);
    }

    const response = await updatePost(validatedData.id, formToSend);

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
    return {
      success: false,
      error: error.message || 'Something went wrong',
    };
  }
}
