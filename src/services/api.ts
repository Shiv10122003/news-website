import axios from "axios";
import type { NewsArticle, Region, APIResponse } from "../types";
import { saveToCache, getFromCache, CACHE_DURATION } from "../utils/cacheUtils";

// GNews.io API configuration
const GNEWS_API_KEY = "2132dcccd9af6cfd100a9dbd3e35e1aa";
const GNEWS_BASE_URL = "https://gnews.io/api/v4";

// Pagination cache to track pagination for different queries
interface PaginationCache {
  [key: string]: number;
}

const paginationCache: PaginationCache = {};

// API instance
// Removed unused 'api' declaration.

// Helper function to convert GNews.io article to our NewsArticle format
const convertGNewsArticle = (article: any): NewsArticle => {
  return {
    id: article.url, // GNews doesn't have article_id, use URL as unique ID
    title: article.title || "No title available",
    content: article.content || article.description || "No content available",
    summary: article.description || article.title.substring(0, 150) + "...",
    author: article.source?.name || "Unknown",
    publishedAt: article.publishedAt,
    imageUrl:
      article.image ||
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800",
    category: "General",
    region: "India",
    url: article.url,
    isBreaking: false,
    readTime: calculateReadTime(article.content || article.description || ""),
    views: Math.floor(Math.random() * 2000) + 100,
    tags: [],
  };
};

// Helper function to calculate read time
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(" ").length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// Predefined regions
const regions: Region[] = [
  { id: "1", name: "Punjab", code: "PB" },
  { id: "2", name: "Haryana", code: "HR" },
  { id: "3", name: "Himachal Pradesh", code: "HP" },
  { id: "4", name: "Delhi", code: "DL" },
  { id: "5", name: "Chandigarh", code: "CH" },
  { id: "6", name: "Rajasthan", code: "RJ" },
  { id: "7", name: "Uttar Pradesh", code: "UP" },
];

export const newsAPI = {
  // Get all regions
  getRegions: async (): Promise<APIResponse<Region[]>> => {
    return {
      data: regions,
      message: "Regions fetched successfully",
      status: 200,
    };
  },

  // Get news by region with pagination
  getNewsByRegion: async (
    regionCode: string,
    page: number = 1,
    size: number = 10
  ): Promise<APIResponse<NewsArticle[]>> => {
    // Create cache key for this specific request
    const cacheKey = `news-region-${regionCode}-page-${page}`;

    // Try to get from cache first (only for page 1)
    if (page === 1) {
      const cachedData = getFromCache<NewsArticle[]>(cacheKey);
      if (cachedData && cachedData.length > 0) {
        console.log(`Loaded from cache: ${cacheKey}`);
        return {
          data: cachedData,
          message: "News loaded from cache",
          status: 200,
        };
      }
    }

    try {
      // Map region codes to search queries with variations for pagination
      const regionQueriesMap: { [key: string]: string[] } = {
        all: ["India news", "India latest", "breaking India", "India today"],
        india: ["India news", "India latest", "breaking India", "India today"],
        punjab: ["Punjab", "Punjab news", "Chandigarh", "Amritsar"],
        delhi: ["Delhi", "Delhi news", "NCR", "New Delhi"],
        mumbai: ["Mumbai", "Mumbai news", "Maharashtra", "Bombay"],
        kerala: ["Kerala", "Kerala news", "Thiruvananthapuram", "Kochi"],
        PB: ["Punjab", "Punjab news", "Chandigarh", "Amritsar"],
        HR: ["Haryana", "Haryana news", "Gurugram", "Faridabad"],
        DL: ["Delhi", "Delhi news", "NCR", "New Delhi"],
        HP: ["Himachal Pradesh", "Shimla", "HP news"],
        CH: ["Chandigarh", "Chandigarh news", "UT"],
        RJ: ["Rajasthan", "Rajasthan news", "Jaipur", "Jodhpur"],
        UP: ["Uttar Pradesh", "UP news", "Lucknow", "Noida"],
      };

      const paginationKey = `region-${regionCode}`;

      // For page 1, reset pagination
      if (page === 1) {
        paginationCache[paginationKey] = 1;
      }

      // Get query variations for this region
      const queryVariations = regionQueriesMap[regionCode] || ["India"];
      const query = queryVariations[(page - 1) % queryVariations.length];

      // Calculate date range for pagination (to get different/older news)
      const daysAgo = (page - 1) * 7;
      const toDate = new Date();
      toDate.setDate(toDate.getDate() - daysAgo);
      const fromDate = new Date(toDate);
      fromDate.setDate(fromDate.getDate() - 7);

      // Build request parameters for GNews API
      const params: any = {
        apikey: GNEWS_API_KEY,
        country: "in",
        lang: "en",
        max: size > 10 ? 10 : size, // GNews max is 10
        q: query,
      };

      // Add date range for pages > 1
      if (page > 1) {
        params.from = fromDate.toISOString().split("T")[0];
        params.to = toDate.toISOString().split("T")[0];
      }

      const response = await axios.get(`${GNEWS_BASE_URL}/top-headlines`, {
        params: params,
      });

      const articles = response.data.articles.map(convertGNewsArticle);

      // Save to cache (only page 1 for primary content)
      if (page === 1) {
        saveToCache(cacheKey, articles, CACHE_DURATION.MEDIUM);
        console.log(`Saved to cache: ${cacheKey}`);
      }

      return {
        data: articles,
        message: "News fetched successfully",
        status: 200,
      };
    } catch (error: any) {
      console.error("Error fetching news:", error);

      // If 429 error, try to return expired cache as fallback
      if (error.response?.status === 429) {
        console.warn(
          "⚠️ Rate limit exceeded (429). Attempting to use cached data..."
        );
        const expiredCache = getFromCache<NewsArticle[]>(cacheKey, true); // Ignore expiration
        if (expiredCache && expiredCache.length > 0) {
          console.log("✅ Returning expired cache to avoid 429 error");
          return {
            data: expiredCache,
            message: "Loaded from expired cache due to rate limit",
            status: 200,
          };
        }
      }

      // Return error response
      return {
        data: [],
        message: error.response?.data?.message || "Failed to fetch news",
        status: error.response?.status || 500,
      };
    }
  },

  // Get breaking news
  getBreakingNews: async (): Promise<APIResponse<NewsArticle[]>> => {
    const cacheKey = "news-breaking";

    // Try to get from cache first
    const cachedData = getFromCache<NewsArticle[]>(cacheKey);
    if (cachedData && cachedData.length > 0) {
      console.log("Loaded breaking news from cache");
      return {
        data: cachedData,
        message: "Breaking news loaded from cache",
        status: 200,
      };
    }

    try {
      const response = await axios.get(`${GNEWS_BASE_URL}/top-headlines`, {
        params: {
          apikey: GNEWS_API_KEY,
          country: "in",
          lang: "en",
          max: 5,
        },
      });

      const articles = response.data.articles.map(convertGNewsArticle);

      // Save to cache with shorter duration (breaking news changes quickly)
      saveToCache(cacheKey, articles, CACHE_DURATION.SHORT);
      console.log("Saved breaking news to cache");

      return {
        data: articles,
        message: "Breaking news fetched successfully",
        status: 200,
      };
    } catch (error: any) {
      console.error("Error fetching breaking news:", error);

      // If 429 error, try to return expired cache as fallback
      if (error.response?.status === 429) {
        console.warn(
          "⚠️ Rate limit exceeded (429). Attempting to use cached breaking news..."
        );
        const expiredCache = getFromCache<NewsArticle[]>(cacheKey, true); // Ignore expiration
        if (expiredCache && expiredCache.length > 0) {
          console.log("✅ Returning expired cache for breaking news");
          return {
            data: expiredCache,
            message: "Loaded from expired cache due to rate limit",
            status: 200,
          };
        }
      }

      // Return error response
      return {
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch breaking news",
        status: error.response?.status || 500,
      };
    }
  },

  // Get featured news
  getFeaturedNews: async (
    limit: number = 10
  ): Promise<APIResponse<NewsArticle[]>> => {
    const cacheKey = `news-featured-${limit}`;

    // Try to get from cache first
    const cachedData = getFromCache<NewsArticle[]>(cacheKey);
    if (cachedData && cachedData.length > 0) {
      console.log("Loaded featured news from cache");
      return {
        data: cachedData,
        message: "Featured news loaded from cache",
        status: 200,
      };
    }

    try {
      const response = await axios.get(`${GNEWS_BASE_URL}/top-headlines`, {
        params: {
          apikey: GNEWS_API_KEY,
          country: "in",
          lang: "en",
          max: limit,
        },
      });

      const articles = response.data.articles.map(convertGNewsArticle);

      // Save to cache
      saveToCache(cacheKey, articles, CACHE_DURATION.MEDIUM);
      console.log("Saved featured news to cache");

      return {
        data: articles,
        message: "Featured news fetched successfully",
        status: 200,
      };
    } catch (error: any) {
      console.error("Error fetching featured news:", error);

      // If 429 error, try to return expired cache as fallback
      if (error.response?.status === 429) {
        console.warn(
          "⚠️ Rate limit exceeded (429). Attempting to use cached featured news..."
        );
        const expiredCache = getFromCache<NewsArticle[]>(cacheKey, true); // Ignore expiration
        if (expiredCache && expiredCache.length > 0) {
          console.log("✅ Returning expired cache for featured news");
          return {
            data: expiredCache,
            message: "Loaded from expired cache due to rate limit",
            status: 200,
          };
        }
      }

      // Return error response
      return {
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch featured news",
        status: error.response?.status || 500,
      };
    }
  },

  // Search news
  // Search news
  searchNews: async (
    query: string,
    region?: string
  ): Promise<APIResponse<NewsArticle[]>> => {
    try {
      let searchQuery = query;

      // Add region to search if specified
      if (region && region !== "all") {
        const regionName = regions
          .find((r) => r.code === region)
          ?.name.toLowerCase();
        if (regionName) {
          searchQuery = `${query} ${regionName}`;
        }
      }

      const response = await axios.get(`${GNEWS_BASE_URL}/search`, {
        params: {
          apikey: GNEWS_API_KEY,
          q: searchQuery,
          lang: "en",
          country: "in",
          max: 15,
        },
      });

      const articles = response.data.articles.map(convertGNewsArticle);

      return {
        data: articles,
        message: "Search completed successfully",
        status: 200,
      };
    } catch (error: any) {
      console.error("Error searching news:", error);

      // Return error response
      return {
        data: [],
        message: error.response?.data?.message || "Failed to search news",
        status: error.response?.status || 500,
      };
    }
  },

  // Get news by category
  getNewsByCategory: async (
    category: string,
    page: number = 1,
    size: number = 10
  ): Promise<APIResponse<NewsArticle[]>> => {
    // Create cache key for this specific request
    const cacheKey = `news-category-${category}-page-${page}`;

    // Try to get from cache first (only for page 1)
    if (page === 1) {
      const cachedData = getFromCache<NewsArticle[]>(cacheKey);
      if (cachedData && cachedData.length > 0) {
        console.log(`Loaded from cache: ${cacheKey}`);
        return {
          data: cachedData,
          message: "Category news loaded from cache",
          status: 200,
        };
      }
    }

    try {
      // Map category names to search topics with variations for pagination
      const categoryMap: { [key: string]: string[] } = {
        politics: [
          "politics India",
          "political news India",
          "India government",
          "Indian politics",
        ],
        sports: [
          "sports India",
          "cricket India",
          "Indian sports news",
          "football India",
        ],
        entertainment: [
          "entertainment India",
          "Bollywood",
          "Indian cinema",
          "Indian movies",
        ],
        business: [
          "business India",
          "Indian economy",
          "startup India",
          "Indian market",
        ],
        technology: [
          "technology India",
          "tech India",
          "Indian startups",
          "IT India",
        ],
        "top-news": [
          "India news",
          "India latest",
          "breaking India",
          "Indian headlines",
        ],
      };

      const searchVariations = categoryMap[category] || ["India"];
      // Use different search variation for different pages
      const searchTopic =
        searchVariations[(page - 1) % searchVariations.length];

      const paginationKey = `category-${category}`;

      // For page 1, reset pagination
      if (page === 1) {
        paginationCache[paginationKey] = 1;
      }

      // Calculate date range for pagination (to get different/older news)
      // Page 1: last 7 days, Page 2: 7-14 days ago, etc.
      const daysAgo = (page - 1) * 7;
      const toDate = new Date();
      toDate.setDate(toDate.getDate() - daysAgo);
      const fromDate = new Date(toDate);
      fromDate.setDate(fromDate.getDate() - 7);

      // Build request parameters for GNews
      const params: any = {
        apikey: GNEWS_API_KEY,
        q: searchTopic,
        lang: "en",
        country: "in",
        max: size > 10 ? 10 : size, // GNews max is 10
      };

      // Add date range for pages > 1
      if (page > 1) {
        params.from = fromDate.toISOString().split("T")[0];
        params.to = toDate.toISOString().split("T")[0];
      }

      const response = await axios.get(`${GNEWS_BASE_URL}/search`, {
        params: params,
      });

      const articles = response.data.articles.map(convertGNewsArticle);

      // Save to cache (only page 1 for primary content)
      if (page === 1) {
        saveToCache(cacheKey, articles, CACHE_DURATION.MEDIUM);
        console.log(`Saved to cache: ${cacheKey}`);
      }

      return {
        data: articles,
        message: "Category news fetched successfully",
        status: 200,
      };
    } catch (error: any) {
      console.error("Error fetching category news:", error);

      // If 429 error, try to return expired cache as fallback
      if (error.response?.status === 429) {
        console.warn(
          "⚠️ Rate limit exceeded (429). Attempting to use cached data..."
        );
        const expiredCache = getFromCache<NewsArticle[]>(cacheKey, true); // Ignore expiration
        if (expiredCache && expiredCache.length > 0) {
          console.log("✅ Returning expired cache to avoid 429 error");
          return {
            data: expiredCache,
            message: "Loaded from expired cache due to rate limit",
            status: 200,
          };
        }
      }

      // Return error response
      return {
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch category news",
        status: error.response?.status || 500,
      };
    }
  },
};
