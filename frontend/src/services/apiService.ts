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

export interface Evidence {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  content: string;
  mediaUrl?: string;
  type: 'text' | 'image';
  createdAt: string;
}

export const apiService = {
  // ... existing methods ...

  async getEvidence(courseId: string, lessonId: string): Promise<Evidence[]> {
    const response = await apiClient.get(`/evidence/${courseId}/${encodeURIComponent(lessonId)}`);
    return response.data;
  },

  async updateProfile(data: { name?: string, email?: string, avatarUrl?: string }) {
     const response = await apiClient.put('/auth/me', data);
     return response.data;
  },

  async changePassword(data: { currentPassword: string, newPassword: string }) {
      const response = await apiClient.post('/auth/change-password', data);
      return response.data;
  },

  async addEvidence(courseId: string, lessonId: string, content: string, type: 'text' | 'image' = 'text', mediaUrl?: string): Promise<Evidence> {
    const response = await apiClient.post(`/evidence/${courseId}/${encodeURIComponent(lessonId)}`, { content, type, mediaUrl });
    return response.data;
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as { url: string; filename: string };
  },

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
    }>(`/evaluations/${path}`);
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
      status?: string,
      data: { result: any, score: number, passed: boolean } 
    }>('/evaluations/ai-proxy', payload, {
      timeout: 600000 // 10 minutes
    });
    return response.data;
  },

  getEvaluations: async (userId?: string) => {
    const url = userId 
      ? `/evaluations/admin/evaluations?userId=${encodeURIComponent(userId)}`
      : '/evaluations/admin/evaluations';
    const response = await apiClient.get<any[]>(url);
    return response.data;
  },

  getMyGrades: async () => {
      const response = await apiClient.get<any[]>('/evaluations/my-results');
      return response.data;
  },

  submitEvaluation: async (courseId: string, lessonId: string, answers: { questionId: string; selectedOptionId: string }[]) => {
    const response = await apiClient.post(`/evaluations/${courseId}/${encodeURIComponent(lessonId)}/submit`, { answers });
    return response.data;
  },

  getComments: async (resourceId: string) => {
    const response = await apiClient.get<any[]>(`/comments/${encodeURIComponent(resourceId)}`);
    return response.data;
  },

  addComment: async (resourceId: string, content: string, authorName?: string) => {
    const response = await apiClient.post(`/comments/${encodeURIComponent(resourceId)}`, { content, authorName });
    return response.data;
  },
};
