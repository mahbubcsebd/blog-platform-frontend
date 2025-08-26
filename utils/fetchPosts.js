const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Create Post
 */
export async function createPost(formData, accessToken) {
  try {
    const res = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create post: ${errorText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePost(id, formData, accessToken) {
  try {
    const res = await fetch(`${baseUrl}/posts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`, // ✅ add token
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update post: ${errorText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: error.message };
  }
}

// delete post by id
export async function deletePost(id, accessToken) {
  try {
    const res = await fetch(`${baseUrl}/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // ✅ Add auth token
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete post: ${errorText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }
}

// Fetch posts with filters, pagination and error handling
export async function getAllPosts(filters = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${baseUrl}/posts?${queryParams.toString()}`;

    console.log('Fetching posts from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for better performance
      // next: {
      //   revalidate: 60, // Cache for 1 minute
      // },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('data' + data);

    if (!data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch posts');
    }

    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch posts',
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      count: 0,
      hasMore: false,
    };
  }
}

// get single post
export async function getPostBySlug(slug, includeContent = true) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const url = `${baseUrl}/posts/${slug}?includeContent=${includeContent}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Post not found',
          data: null,
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch post',
      data: null,
    };
  }
}

/**
 * ========================================
 * AUTO-PUBLISHING FUNCTIONS
 * ========================================
 */

/**
 * Get scheduled posts
 */
export async function getScheduledPosts(accessToken) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/scheduled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch scheduled posts',
      data: [],
    };
  }
}

/**
 * Trigger auto-publish manually
 */
export async function triggerAutoPublish(accessToken) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/auto-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error triggering auto-publish:', error);
    return {
      success: false,
      error: error.message || 'Failed to trigger auto-publish',
      data: [],
    };
  }
}

/**
 * Publish post immediately
 */
export async function publishPost(id, accessToken) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/${id}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to publish post: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error publishing post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unpublish post (move to draft)
 */
export async function unpublishPost(id, accessToken) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/${id}/unpublish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to unpublish post: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error unpublishing post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Schedule post for future publishing
 */
export async function schedulePost(id, scheduledDate, accessToken) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/${id}/schedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        scheduledDate: scheduledDate,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to schedule post: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error scheduling post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Duplicate post
 */
export async function duplicatePost(id, accessToken) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to duplicate post: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error duplicating post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ========================================
 * EXISTING FUNCTIONS (UNCHANGED)
 * ========================================
 */

/**
 * Fetch topics with post counts
 */
export async function getTopics() {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(`${baseUrl}/posts/topics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch topics',
      data: [],
    };
  }
}

/**
 * Fetch tags with post counts
 */
export async function getTags(options = {}) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const queryParams = new URLSearchParams();

    if (options.popular !== undefined) {
      queryParams.append('popular', options.popular.toString());
    }
    if (options.limit) {
      queryParams.append('limit', options.limit.toString());
    }

    const url = `${baseUrl}/posts/tags${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch tags',
      data: [],
    };
  }
}

/**
 * Fetch search suggestions
 */
export async function getSearchSuggestions(query, limit = 10) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
      };
    }

    const queryParams = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${baseUrl}/posts/search-suggestions?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch suggestions',
      data: [],
    };
  }
}

/**
 * Fetch related posts
 */
export async function getRelatedPosts(slug, limit = 6) {
  try {
    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    const response = await fetch(
      `${baseUrl}/posts/${slug}/related?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 300, // Cache for 5 minutes
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch related posts',
      data: [],
    };
  }
}
