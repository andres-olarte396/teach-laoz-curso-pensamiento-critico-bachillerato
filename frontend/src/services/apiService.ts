import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  type: 'directory' | 'markdown' | 'binary' | 'html' | 'evaluation';
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
  relatedAssets?: {
    type: 'audio' | 'video' | 'exercise' | 'evaluation' | 'script';
    path: string;
    name: string;
    url?: string;
  }[];
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

  saveProgress: async (courseId: string, lessonId: string, completed?: boolean) => {
    const response = await apiClient.post('/progress', { courseId, lessonId, completed });
    return response.data;
  },

  getProgress: async (courseId: string) => {
    const response = await apiClient.get<{ latest: any; all: any[] }>(`/progress/${courseId}`);
    return response.data;
  },

  getAllProgress: async () => {
    const response = await apiClient.get<any[]>('/progress/all');
    return response.data;
  },

  getCourseCompletion: async (courseId: string) => {
    const response = await apiClient.get<{ total: number; completed: number; percentage: number }>(`/progress/${courseId}/completion`);
    return response.data;
  },

  getConfig: async () => {
    const response = await apiClient.get<{ data: { social: { github: string, twitter: string, linkedin: string } } }>('/config');
    return response.data;
  },

  submitContact: async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await apiClient.post<{ message: string }>('/contact', data);
    return response.data;
  },

  getEvaluation: async (path: string) => {
    const response = await apiClient.get<{
      id: string;
      title: string;
      questions: {
        id: string;
        text: string;
        options: { id: string; text: string }[];
        correctAnswerId: string;
        feedback?: string;
      }[];
      metadata: Record<string, any>;
    }>(`/evaluation/${path}`);
    return response.data;
  },

  trackEvent: async (event: {
    userId: string;
    organizationId: string;
    courseId: string;
    lessonId?: string;
    type: 'course_started' | 'lesson_viewed' | 'lesson_completed' | 'evaluation_started' | 'evaluation_submitted';
    metadata?: Record<string, any>;
  }) => {
    const response = await apiClient.post<{ status: string }>('/events', event);
    return response.data;
  },

  getToken: () => {
    return null; // Deprecated
  },

  submitAIEvaluation: async (payload: { submissionId: string, question: string, answer: string, context: string[] }) => {
    const response = await apiClient.post<{ 
      success: boolean, 
      data: { result: any, score: number, passed: boolean } 
    }>('/evaluations/ai-proxy', payload, {
      timeout: 600000 // 10 minutes
    });
    return response.data;
  },

  getEvaluations: async () => {
    const response = await apiClient.get<any[]>('/admin/evaluations');
    return response.data;
  },
};
