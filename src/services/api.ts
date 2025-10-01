import axios from "axios";
import type {
  NewsArticle,
  Region,
  APIResponse,
  NewsDataResponse,
  NewsDataArticle,
} from "../types";

// NewsData.io API configuration
const NEWSDATA_API_KEY = "pub_42ef347d7456452eb39635a1a0aa542b";
const NEWSDATA_BASE_URL = "https://newsdata.io/api/1";

// API instance
// Removed unused 'api' declaration.

// Helper function to convert NewsData.io article to our NewsArticle format
const convertNewsDataArticle = (article: NewsDataArticle): NewsArticle => {
  return {
    id: article.article_id,
    title: article.title || "No title available",
    content: article.content || article.description || "No content available",
    summary: article.description || article.title.substring(0, 150) + "...",
    author: article.creator?.[0] || article.source_id || "Unknown",
    publishedAt: article.pubDate,
    imageUrl:
      article.image_url ||
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800",
    category: article.category?.[0] || "General",
    region: getRegionFromKeywords(article.keywords, article.country),
    isBreaking: isBreakingNews(article.keywords, article.title),
    readTime: calculateReadTime(article.content || article.description || ""),
    views: Math.floor(Math.random() * 2000) + 100, // Mock views since API doesn't provide this
    tags: article.keywords?.slice(0, 5) || [],
  };
};

// Helper function to determine region from keywords and country
const getRegionFromKeywords = (
  keywords: string[] | null,
  country: string[]
): string => {
  if (keywords) {
    const regionKeywords = [
      "punjab",
      "haryana",
      "delhi",
      "chandigarh",
      "himachal",
      "rajasthan",
      "uttar pradesh",
    ];
    for (const keyword of keywords) {
      const foundRegion = regionKeywords.find(
        (region) =>
          keyword.toLowerCase().includes(region) ||
          region.includes(keyword.toLowerCase())
      );
      if (foundRegion) {
        return foundRegion.charAt(0).toUpperCase() + foundRegion.slice(1);
      }
    }
  }
  return country?.[0] === "in" ? "India" : "General";
};

// Helper function to determine if news is breaking
const isBreakingNews = (keywords: string[] | null, title: string): boolean => {
  const breakingKeywords = ["breaking", "urgent", "alert", "live", "update"];
  const titleWords = title.toLowerCase();

  if (keywords) {
    return keywords.some((keyword) =>
      breakingKeywords.some((breaking) =>
        keyword.toLowerCase().includes(breaking)
      )
    );
  }

  return breakingKeywords.some((keyword) => titleWords.includes(keyword));
};

// Helper function to calculate read time
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(" ").length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// Mock data for demonstration
const mockRegions: Region[] = [
  { id: "1", name: "Punjab", code: "PB" },
  { id: "2", name: "Haryana", code: "HR" },
  { id: "3", name: "Himachal Pradesh", code: "HP" },
  { id: "4", name: "Delhi", code: "DL" },
  { id: "5", name: "Chandigarh", code: "CH" },
  { id: "6", name: "Rajasthan", code: "RJ" },
  { id: "7", name: "Uttar Pradesh", code: "UP" },
];

// Generate more mock news for pagination testing
const generateMockNews = (count: number): NewsArticle[] => {
  const baseNews = [
    {
      title:
        "Punjab Announces New Agricultural Reforms: Major Relief for Farmers",
      content:
        "The Punjab government has announced a new scheme for farmers...",
      summary:
        "Punjab government announces significant agricultural sector reforms.",
      author: "Rahul Sharma",
      category: "Agriculture",
      region: "Punjab",
      isBreaking: true,
      tags: ["Agriculture", "Punjab", "Government"],
    },
    {
      title: "Haryana Launches New IT Policy: Job Opportunities for Youth",
      content:
        "Haryana government has created a new policy to promote the IT sector...",
      summary: "New policy announced for IT sector development in Haryana.",
      author: "Priya Gupta",
      category: "Technology",
      region: "Haryana",
      isBreaking: false,
      tags: ["IT", "Haryana", "Employment"],
    },
    {
      title: "Delhi Pollution Levels Drop: AQI Shows Improvement",
      content:
        "Air quality in Delhi has shown improvement compared to last week...",
      summary: "Significant improvement recorded in Delhi's Air Quality Index.",
      author: "Amit Kumar",
      category: "Environment",
      region: "Delhi",
      isBreaking: false,
      tags: ["Pollution", "Delhi", "Environment"],
    },
  ];

  const mockNews: NewsArticle[] = [];
  for (let i = 0; i < count; i++) {
    const baseArticle = baseNews[i % baseNews.length];
    mockNews.push({
      id: `mock-${i + 1}`,
      title: `${baseArticle.title} - Update ${i + 1}`,
      content: baseArticle.content,
      summary: baseArticle.summary,
      author: baseArticle.author,
      publishedAt: new Date(Date.now() - i * 60000).toISOString(),
      imageUrl: `https://images.unsplash.com/photo-${1574323347407 + i}?w=800`,
      category: baseArticle.category,
      region: baseArticle.region,
      isBreaking: baseArticle.isBreaking && i < 3,
      readTime: Math.floor(Math.random() * 8) + 2,
      views: Math.floor(Math.random() * 2000) + 100,
      tags: baseArticle.tags,
    });
  }
  return mockNews;
};

const mockNews: NewsArticle[] = generateMockNews(50); // Generate 50 articles for pagination testing

export const newsAPI = {
  // Get all regions
  getRegions: async (): Promise<APIResponse<Region[]>> => {
    return new Promise((resolve) => {
      resolve({
        data: mockRegions,
        message: "Regions fetched successfully",
        status: 200,
      });
    });
  },

  // Get news by region with pagination
  getNewsByRegion: async (
    regionCode: string,
    page: number = 1,
    size: number = 10
  ): Promise<APIResponse<NewsArticle[]>> => {
    try {
      let query = "india";

      // Map region codes to search queries
      const regionQueries: { [key: string]: string } = {
        PB: "punjab",
        HR: "haryana",
        DL: "delhi",
        HP: "himachal pradesh",
        CH: "chandigarh",
        RJ: "rajasthan",
        UP: "uttar pradesh",
      };

      if (regionCode !== "all" && regionQueries[regionCode]) {
        query = regionQueries[regionCode];
      }

      // Calculate offset for pagination (NewsData.io uses nextPage token, but we'll simulate)
      const response = await axios.get<NewsDataResponse>(
        `${NEWSDATA_BASE_URL}/news`,
        {
          params: {
            apikey: NEWSDATA_API_KEY,
            country: "in",
            q: query,
            language: "en",
            size: size,
          },
        }
      );

      const articles = response.data.results.map(convertNewsDataArticle);

      return {
        data: articles,
        message: "News fetched successfully",
        status: 200,
      };
    } catch (error) {
      console.error("Error fetching news:", error);
      // Fallback to mock data on error with pagination
      let filteredNews = mockNews.filter(
        (article) =>
          article.region.toLowerCase().includes(regionCode.toLowerCase()) ||
          regionCode === "all"
      );

      // Apply pagination to mock data
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      filteredNews = filteredNews.slice(startIndex, endIndex);

      return {
        data: filteredNews,
        message: "News fetched from fallback",
        status: 200,
      };
    }
  },

  // Get breaking news
  getBreakingNews: async (): Promise<APIResponse<NewsArticle[]>> => {
    try {
      const response = await axios.get<NewsDataResponse>(
        `${NEWSDATA_BASE_URL}/news`,
        {
          params: {
            apikey: NEWSDATA_API_KEY,
            country: "in",
            q: "breaking OR urgent OR live",
            language: "en",
            size: 5,
          },
        }
      );

      const articles = response.data.results.map(convertNewsDataArticle);

      return {
        data: articles,
        message: "Breaking news fetched successfully",
        status: 200,
      };
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      // Fallback to mock data
      const breakingNews = mockNews.filter((article) => article.isBreaking);
      return {
        data: breakingNews,
        message: "Breaking news fetched from fallback",
        status: 200,
      };
    }
  },

  // Get featured news
  getFeaturedNews: async (
    limit: number = 10
  ): Promise<APIResponse<NewsArticle[]>> => {
    try {
      const response = await axios.get<NewsDataResponse>(
        `${NEWSDATA_BASE_URL}/news`,
        {
          params: {
            apikey: NEWSDATA_API_KEY,
            country: "in",
            language: "en",
            size: limit,
          },
        }
      );

      const articles = response.data.results.map(convertNewsDataArticle);

      return {
        data: articles,
        message: "Featured news fetched successfully",
        status: 200,
      };
    } catch (error) {
      console.error("Error fetching featured news:", error);
      // Fallback to mock data
      const sortedNews = [...mockNews]
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
      return {
        data: sortedNews,
        message: "Featured news fetched from fallback",
        status: 200,
      };
    }
  },

  // Search news
  searchNews: async (
    query: string,
    region?: string
  ): Promise<APIResponse<NewsArticle[]>> => {
    try {
      let searchQuery = query;

      // Add region to search if specified
      if (region && region !== "all") {
        const regionName = mockRegions
          .find((r) => r.code === region)
          ?.name.toLowerCase();
        if (regionName) {
          searchQuery = `${query} ${regionName}`;
        }
      }

      const response = await axios.get<NewsDataResponse>(
        `${NEWSDATA_BASE_URL}/news`,
        {
          params: {
            apikey: NEWSDATA_API_KEY,
            country: "in",
            q: searchQuery,
            language: "en",
            size: 15,
          },
        }
      );

      const articles = response.data.results.map(convertNewsDataArticle);

      return {
        data: articles,
        message: "Search completed successfully",
        status: 200,
      };
    } catch (error) {
      console.error("Error searching news:", error);
      // Fallback to mock data search
      let filteredNews = mockNews.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.summary.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );

      if (region && region !== "all") {
        filteredNews = filteredNews.filter(
          (article) => article.region.toLowerCase() === region.toLowerCase()
        );
      }

      return {
        data: filteredNews,
        message: "Search completed from fallback",
        status: 200,
      };
    }
  },
};
