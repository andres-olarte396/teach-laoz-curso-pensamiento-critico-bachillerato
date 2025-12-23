import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  type: 'directory' | 'markdown';
  children?: MenuItem[];
}

export interface ContentResponse {
  path: string;
  name: string;
  type: string;
  extension?: string;
  content: string | null;
  html?: string;
  frontmatter?: Record<string, any>;
  toc?: any[];
  metadata: {
    size: number;
    lastModified: string;
    mimeType: string;
  };
}

export const apiService = {
  getMenu: async () => {
    const response = await apiClient.get<{ courses: MenuItem[] }>('/menu');
    return response.data;
  },
  
  getContent: async (path: string) => {
    const response = await apiClient.get<ContentResponse>(`/content/${path}`);
    return response.data;
  },
};
