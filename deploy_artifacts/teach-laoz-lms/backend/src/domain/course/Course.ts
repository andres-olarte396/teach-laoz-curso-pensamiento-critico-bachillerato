export interface Course {
  id: string;      // Usually the folder name
  title: string;
  summary: string;
  author: string;
  date: string;    // ISO Date string
  tags: string[];
  category: string;
  imageUrl?: string;
  level?: 'Básico' | 'Intermedio' | 'Avanzado';
  published: boolean;
}
