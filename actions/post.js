'use server';

import {
  createPost,
  duplicatePost,
  getScheduledPosts,
  publishPost,
  schedulePost,
  triggerAutoPublish,
  unpublishPost,
  updatePost,
} from '@/utils/fetchPosts';
import { z } from 'zod';

const PostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  htmlContent: z.string().optional(),
  contentType: z.enum(['MARKDOWN', 'EDITOR']).default('EDITOR'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'SCHEDULED']).default('DRAFT'),
  publishDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

const UpdatePostSchema = PostSchema.extend({
  id: z.string().min(1, 'Post ID is required for update'),
});

const SchedulePostSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
});

/**
 * Build FormData from validated data
 */
function buildFormData(validatedData, previewImage) {
  const formData = new FormData();

  // Handle each field appropriately
  Object.entries(validatedData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Handle preview image
  if (previewImage instanceof File) {
    formData.append('previewImage', previewImage);
  }

  return formData;
}

/**
 * Determine the appropriate message based on post status and scheduling
 */
function getSuccessMessage(data, isUpdate = false) {
  const action = isUpdate ? 'updated' : 'created';

  if (data.status === 'SCHEDULED' || data.isScheduled) {
    const publishDate = new Date(data.publishDate).toLocaleString();
    return `Post ${action} and scheduled for ${publishDate}!`;
  } else if (data.status === 'PUBLISHED') {
    return `Post ${action} and published successfully!`;
  } else {
    return `Draft ${action} successfully!`;
  }
}

/**
 * Safely parse form data with fallbacks
 */
function parseFormData(formData) {
  const data = {
    title: formData.get('title')?.toString().trim() || '',
    content: formData.get('content')?.toString() || '',
    htmlContent: formData.get('htmlContent')?.toString() || undefined,
    contentType: formData.get('contentType')?.toString() || 'EDITOR',
    excerpt: formData.get('excerpt')?.toString().trim() || '',
    status: formData.get('status')?.toString() || 'DRAFT',
    publishDate: formData.get('publishDate')?.toString() || null,
  };

  // Parse tags safely
  try {
    const tagsData = formData.get('tags');
    if (tagsData) {
      const parsed = JSON.parse(tagsData.toString());
      data.tags = Array.isArray(parsed)
        ? parsed.filter((tag) => tag && tag.trim())
        : [];
    } else {
      data.tags = [];
    }
  } catch (error) {
    console.warn('Failed to parse tags:', error);
    data.tags = [];
  }

  // Clean up empty fields but preserve important ones
  Object.keys(data).forEach((key) => {
    if (key !== 'tags' && key !== 'publishDate') {
      if (data[key] === '' || data[key] === undefined) {
        delete data[key];
      }
    }
  });

  return data;
}

/**
 * Create a new post
 */
export async function createPostAction(formData, accessToken) {
  console.log(formData);
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const data = parseFormData(formData);

    // Add ID for update operations if present
    const id = formData.get('id');
    if (id) {
      data.id = id.toString();
    }

    // Validate the data
    const validatedData = id
      ? UpdatePostSchema.parse(data)
      : PostSchema.parse(data);

    // Get preview image
    const previewImage = formData.get('previewImage');

    // Build form data for API
    const formToSend = buildFormData(validatedData, previewImage);

    // Make API call
    const response = await createPost(formToSend, accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to create post');
    }

    return {
      success: true,
      message: getSuccessMessage(response.data, false),
      data: response.data,
    };
  } catch (error) {
    console.error('createPostAction Error:', error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      return {
        success: false,
        error: errorMessages.join(', '),
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to create post',
    };
  }
}

/**
 * Update an existing post
 */
export async function updatePostAction(formData, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const data = parseFormData(formData);

    // ID is required for updates
    const id = formData.get('id');
    if (!id) {
      throw new Error('Post ID is required for update');
    }
    data.id = id.toString();

    // Validate the data
    const validatedData = UpdatePostSchema.parse(data);

    // Get preview image
    const previewImage = formData.get('previewImage');

    // Build form data for API
    const formToSend = buildFormData(validatedData, previewImage);

    // Make API call
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
      message: getSuccessMessage(response.data, true),
      data: response.data,
    };
  } catch (error) {
    console.error('updatePostAction Error:', error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      return {
        success: false,
        error: errorMessages.join(', '),
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to update post',
    };
  }
}

/**
 * Publish post immediately
 */
export async function publishPostAction(postId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    if (!postId) {
      throw new Error('Post ID is required');
    }

    const response = await publishPost(postId, accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to publish post');
    }

    return {
      success: true,
      message: 'Post published successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('publishPostAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to publish post',
    };
  }
}

/**
 * Unpublish post (move to draft)
 */
export async function unpublishPostAction(postId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    if (!postId) {
      throw new Error('Post ID is required');
    }

    const response = await unpublishPost(postId, accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to unpublish post');
    }

    return {
      success: true,
      message: 'Post moved to drafts successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('unpublishPostAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to unpublish post',
    };
  }
}

/**
 * Schedule post for future publishing
 */
export async function schedulePostAction(postId, scheduledDate, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const validatedData = SchedulePostSchema.parse({
      id: postId,
      scheduledDate: scheduledDate,
    });

    // Validate that the scheduled date is in the future
    const scheduleDate = new Date(validatedData.scheduledDate);
    const now = new Date();

    if (scheduleDate <= now) {
      throw new Error('Scheduled date must be in the future');
    }

    const response = await schedulePost(
      validatedData.id,
      validatedData.scheduledDate,
      accessToken
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to schedule post');
    }

    const publishDate = scheduleDate.toLocaleString();

    return {
      success: true,
      message: `Post scheduled for ${publishDate}!`,
      data: response.data,
    };
  } catch (error) {
    console.error('schedulePostAction Error:', error);

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      return {
        success: false,
        error: errorMessages.join(', '),
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to schedule post',
    };
  }
}

/**
 * Duplicate post
 */
export async function duplicatePostAction(postId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    if (!postId) {
      throw new Error('Post ID is required');
    }

    const response = await duplicatePost(postId, accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to duplicate post');
    }

    return {
      success: true,
      message: 'Post duplicated successfully! You can now edit the copy.',
      data: response.data,
    };
  } catch (error) {
    console.error('duplicatePostAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to duplicate post',
    };
  }
}

/**
 * Get all scheduled posts
 */
export async function getScheduledPostsAction(accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const response = await getScheduledPosts(accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch scheduled posts');
    }

    return {
      success: true,
      data: response.data || [],
      count: response.count || response.data?.length || 0,
    };
  } catch (error) {
    console.error('getScheduledPostsAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch scheduled posts',
      data: [],
      count: 0,
    };
  }
}

/**
 * Manually trigger auto-publish for scheduled posts
 */
export async function triggerAutoPublishAction(accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    const response = await triggerAutoPublish(accessToken);

    if (!response.success) {
      throw new Error(response.error || 'Failed to trigger auto-publish');
    }

    const publishedCount = response.data?.length || 0;

    return {
      success: true,
      message:
        publishedCount > 0
          ? `Successfully published ${publishedCount} scheduled post${
              publishedCount > 1 ? 's' : ''
            }!`
          : 'No posts were ready for publishing.',
      data: response.data || [],
      publishedCount,
    };
  } catch (error) {
    console.error('triggerAutoPublishAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to trigger auto-publish',
      publishedCount: 0,
      data: [],
    };
  }
}

/**
 * Delete a post
 */
export async function deletePostAction(postId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    if (!postId) {
      throw new Error('Post ID is required');
    }

    // Assuming you have a deletePost function in your utils
    // const response = await deletePost(postId, accessToken);

    // For now, returning a placeholder response
    return {
      success: false,
      error: 'Delete functionality not implemented yet',
    };
  } catch (error) {
    console.error('deletePostAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete post',
    };
  }
}

/**
 * Get post analytics/statistics
 */
export async function getPostAnalyticsAction(postId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    if (!postId) {
      throw new Error('Post ID is required');
    }

    // Placeholder for analytics functionality
    return {
      success: false,
      error: 'Analytics functionality not implemented yet',
      data: null,
    };
  } catch (error) {
    console.error('getPostAnalyticsAction Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get post analytics',
      data: null,
    };
  }
}
