export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown content
  author: string;
  date: string; // ISO Date string
  tags: string[];
  imageUrl?: string;
  published: boolean;
  html?: string;
}
