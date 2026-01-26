import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

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
  category: string; // Ensure this is here
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
