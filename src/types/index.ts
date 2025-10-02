export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  category: string;
  region: string;
  url?: string;
  isBreaking?: boolean;
  readTime: number;
  views: number;
  tags: string[];
}

export interface Region {
  id: string;
  name: string;
  code: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  status: number;
}

// NewsData.io API response types
export interface NewsDataArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[] | null;
  creator: string[] | null;
  video_url: string | null;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
}

export interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage: string | null;
}
