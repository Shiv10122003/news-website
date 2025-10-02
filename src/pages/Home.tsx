import { useState, useEffect } from "react";
import BreakingNews from "../components/BreakingNews";
import NewsGrid from "../components/NewsGrid";
import Sidebar from "../components/Sidebar";
import { newsAPI } from "../services/api";
import type { NewsArticle, Region } from "../types";

interface HomeProps {
  regions: Region[];
  selectedRegion: string;
}

const Home: React.FC<HomeProps> = ({ regions, selectedRegion }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<NewsArticle[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreNews, setHasMoreNews] = useState<boolean>(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load breaking and featured news in parallel
        const [breakingResponse, featuredResponse] = await Promise.all([
          newsAPI.getBreakingNews(),
          newsAPI.getFeaturedNews(10),
        ]);

        setBreakingNews(breakingResponse.data);
        setFeaturedNews(featuredResponse.data);

        // Load initial news for selected region
        const newsResponse = await newsAPI.getNewsByRegion(
          selectedRegion,
          1,
          10
        );
        setNews(newsResponse.data);
        setCurrentPage(1);
        setHasMoreNews(newsResponse.data.length >= 10);
      } catch (err) {
        setError("Error loading news. Please try again.");
        console.error("Error loading initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [selectedRegion]);

  // Handle load more news
  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreNews) return;

    try {
      setLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      const response = await newsAPI.getNewsByRegion(
        selectedRegion,
        nextPage,
        10
      );

      if (response.data.length > 0) {
        // Filter out duplicates based on article ID
        const newArticles = response.data.filter(
          (newArticle) =>
            !news.some(
              (existingArticle) => existingArticle.id === newArticle.id
            )
        );

        setNews((prevNews) => [...prevNews, ...newArticles]);
        setCurrentPage(nextPage);
        setHasMoreNews(response.data.length >= 10);
      } else {
        setHasMoreNews(false);
      }
    } catch (err) {
      setError("Error loading more news.");
      console.error("Error loading more news:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Refresh news
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsAPI.getNewsByRegion(selectedRegion, 1, 10);
      setNews(response.data);
      setCurrentPage(1);
      setHasMoreNews(response.data.length >= 10);
    } catch (err) {
      setError("Error loading news.");
      console.error("Error loading news by region:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BreakingNews breakingNews={breakingNews} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedRegion === "all"
                  ? "All News"
                  : `${
                      regions.find((r) => r.code === selectedRegion)?.name
                    } News`}
              </h1>
              <p className="text-gray-600">Latest and important news updates</p>
            </div>

            <NewsGrid
              news={news}
              loading={loading}
              error={error || undefined}
              onRefresh={handleRefresh}
              onLoadMore={handleLoadMore}
              hasMore={hasMoreNews}
              loadingMore={loadingMore}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              featuredNews={featuredNews}
              trendingNews={featuredNews.sort((a, b) => b.views - a.views)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
