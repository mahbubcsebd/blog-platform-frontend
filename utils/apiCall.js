// React context/state e access token rakho
const [accessToken, setAccessToken] = useState(null);

// API calls e bearer token use koro
const apiCall = async () => {
  const response = await fetch('/api/protected', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Refresh token er jonno
  });

  if (response.status === 401) {
    // Token expired, refresh koro
    await refreshAccessToken();
  }
};

// Refresh token function
const refreshAccessToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // HTTP-only refresh token send korbe
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } else {
      // Logout user
      setAccessToken(null);
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Refresh failed:', error);
  }
};
