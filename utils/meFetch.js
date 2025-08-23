const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getUserPosts(filters = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${baseUrl}/me/posts?${queryParams.toString()}`;

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
  }
}
