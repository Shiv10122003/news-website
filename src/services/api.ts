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
    url: article.link, // Add the external URL from NewsData.io
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
        "The Punjab government has announced a comprehensive new agricultural scheme that promises to bring significant relief to farmers across the state. This landmark policy includes direct cash transfers, subsidized seeds, and improved irrigation facilities. The initiative is expected to benefit over 2 million farmers and boost agricultural productivity by 30%. The Chief Minister announced that the scheme will be implemented in phases starting next month, with an initial budget allocation of ₹5,000 crores. Farmer organizations have welcomed the move, calling it a game-changer for the agricultural sector in Punjab.",
      summary:
        "Punjab government announces significant agricultural sector reforms with ₹5,000 crore budget allocation.",
      author: "Rahul Sharma",
      category: "Agriculture",
      region: "Punjab",
      isBreaking: true,
      tags: ["Agriculture", "Punjab", "Government"],
      url: null, // Internal article
    },
    {
      title: "Haryana Launches New IT Policy: Job Opportunities for Youth",
      content:
        "The Haryana government has unveiled its new Information Technology policy aimed at creating thousands of job opportunities for the state's youth. The policy includes setting up IT parks in major cities, offering tax incentives to tech companies, and establishing skill development centers. The government estimates that this initiative will create over 100,000 direct and indirect jobs in the next five years. Major IT companies have already expressed interest in setting up operations in the state, with several MoUs expected to be signed soon. The policy also includes provisions for startups and incubation centers to foster innovation and entrepreneurship among young professionals.",
      summary:
        "New IT policy announced for Haryana with focus on job creation and youth employment.",
      author: "Priya Gupta",
      category: "Technology",
      region: "Haryana",
      isBreaking: false,
      tags: ["IT", "Haryana", "Employment"],
      url: "https://example.com/haryana-it-policy", // External link
    },
    {
      title: "Delhi Pollution Levels Drop: AQI Shows Improvement",
      content:
        "Air quality in Delhi has shown significant improvement over the past week, with the Air Quality Index (AQI) dropping from hazardous to moderate levels. Environmental experts attribute this improvement to favorable wind conditions, reduced vehicular emissions, and effective implementation of pollution control measures. The Delhi government's odd-even vehicle scheme and restrictions on construction activities have contributed to this positive change. Citizens have reported better visibility and reduced respiratory problems. However, authorities caution that sustained efforts are needed to maintain these improvements, especially with the approaching winter season when pollution levels typically spike.",
      summary:
        "Significant improvement recorded in Delhi's Air Quality Index due to pollution control measures.",
      author: "Amit Kumar",
      category: "Environment",
      region: "Delhi",
      isBreaking: false,
      tags: ["Pollution", "Delhi", "Environment"],
      url: null, // Internal article
    },
  ];

  const mockNews: NewsArticle[] = [];
  for (let i = 0; i < count; i++) {
    const baseArticle = baseNews[i % baseNews.length];
    mockNews.push({
      id: `mock-${i + 1}`,
      title:
        i === 0 ? baseArticle.title : `${baseArticle.title} - Update ${i + 1}`,
      content: baseArticle.content,
      summary: baseArticle.summary,
      author: baseArticle.author,
      publishedAt: new Date(Date.now() - i * 60000).toISOString(),
      imageUrl: `https://images.unsplash.com/photo-${1574323347407 + i}?w=800`,
      category: baseArticle.category,
      region: baseArticle.region,
      url: baseArticle.url || undefined,
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

  // Get news by category
  getNewsByCategory: async (
    category: string,
    page: number = 1,
    size: number = 10
  ): Promise<APIResponse<NewsArticle[]>> => {
    try {
      // Map category names to NewsData.io categories
      const categoryMap: { [key: string]: string } = {
        politics: "politics",
        sports: "sports",
        entertainment: "entertainment",
        business: "business",
        technology: "technology",
        "top-news": "top",
      };

      const apiCategory = categoryMap[category] || category;

      const response = await axios.get<NewsDataResponse>(
        `${NEWSDATA_BASE_URL}/news`,
        {
          params: {
            apikey: NEWSDATA_API_KEY,
            country: "in",
            category: apiCategory,
            language: "en",
            size: size,
          },
        }
      );

      const articles = response.data.results.map(convertNewsDataArticle);

      return {
        data: articles,
        message: "Category news fetched successfully",
        status: 200,
      };
    } catch (error) {
      console.error("Error fetching category news:", error);
      // Fallback to mock data filtered by category
      let filteredNews = mockNews.filter((article) => {
        if (category === "top-news") return true;
        return article.category.toLowerCase().includes(category.toLowerCase());
      });

      // Apply pagination to mock data
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      filteredNews = filteredNews.slice(startIndex, endIndex);

      return {
        data: filteredNews,
        message: "Category news fetched from fallback",
        status: 200,
      };
    }
  },
};
