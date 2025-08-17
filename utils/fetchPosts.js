const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Create Post
 */
export async function createPost(formData) {
  try {
    const res = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      body: formData, // Must be FormData
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

/**
 * Get All Posts with optional filters
 */
export async function getAllPosts({
  status,
  topic,
  tag,
  limit,
  offset,
  cache = 'no-store',
} = {}) {
  try {
    const query = new URLSearchParams();

    if (status) query.append('status', status);
    if (topic) query.append('topic', topic);
    if (tag) query.append('tag', tag);
    if (limit) query.append('limit', limit);
    if (offset) query.append('offset', offset);

    const res = await fetch(`${baseUrl}/posts?${query.toString()}`, {
      method: 'GET',
      cache,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch posts: ${errorText}`);
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Single Post by Slug
 */
export async function getPostBySlug(slug) {
  try {
    const res = await fetch(`${baseUrl}/posts/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch post: ${errorText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update Post by ID
 */
export async function updatePost(id, formData) {
  try {
    const res = await fetch(`${baseUrl}/posts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: formData, // Must be FormData, no manual Content-Type
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

/**
 * Delete Post by ID
 */
export async function deletePost(id) {
  try {
    const res = await fetch(`${baseUrl}/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
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
