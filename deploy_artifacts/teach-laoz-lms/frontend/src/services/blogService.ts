import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  html?: string;
}

export const blogService = {
  getPosts: async () => {
    const response = await apiClient.get<BlogPost[]>('/blog/posts');
    return response.data;
  },
  
  getPost: async (slug: string) => {
    const response = await apiClient.get<BlogPost>(`/blog/posts/${slug}`);
    return response.data;
  },
};
