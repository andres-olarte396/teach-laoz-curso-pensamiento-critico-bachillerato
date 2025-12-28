import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Course {
  id: string;
  title: string;
  summary: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
  level: string;
  imageUrl?: string;
  published: boolean;
}

export const courseService = {
  getCourses: async () => {
    const response = await apiClient.get<{ courses: Course[] }>('/courses');
    return response.data.courses;
  },
};
