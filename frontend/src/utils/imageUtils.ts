import { API_BASE_URL } from '../config/apiConfig';

export const getAvatarSrc = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Check if url starts with /api and API_BASE_URL also ends with /api
  // to avoid double /api/api path construction.
  if (url.startsWith('/api') && API_BASE_URL.endsWith('/api')) {
      const base = API_BASE_URL.slice(0, -4); // Remove trailing /api
      return `${base}${url}`;
  }

  // If it starts with /, it's relative to root. We prepend API_BASE_URL
  return `${API_BASE_URL}${url}`;
};
