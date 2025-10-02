import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import NewsCard from "../components/NewsCard";
import { newsAPI } from "../services/api";
import type { NewsArticle } from "../types";

interface CategoryPageProps {
  category: string;
  title: string;
  description: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  title,
  description,
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreNews, setHasMoreNews] = useState<boolean>(true);

  // Load initial news
  useEffect(() => {
    loadCategoryNews();
  }, [category]);

  const loadCategoryNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await newsAPI.getNewsByCategory(category, 1, 10);
      setNews(response.data);
      setCurrentPage(1);
      setHasMoreNews(response.data.length >= 10);
    } catch (err) {
      setError("Error loading news. Please try again.");
      console.error("Error loading category news:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreNews) return;

    try {
      setLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      const response = await newsAPI.getNewsByCategory(category, nextPage, 10);

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

  const handleRefresh = () => {
    loadCategoryNews();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error && news.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* News Content */}
        {news.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">
              No news available for {title.toLowerCase()}
            </p>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Article */}
            {news.length > 0 && (
              <div className="mb-8">
                <NewsCard article={news[0]} size="large" />
              </div>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(1).map((article) => (
                <NewsCard key={article.id} article={article} size="medium" />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreNews && (
              <div className="text-center pt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading More...</span>
                    </>
                  ) : (
                    <span>Load More {title}</span>
                  )}
                </button>
              </div>
            )}

            {/* No More News Message */}
            {!hasMoreNews && news.length > 0 && (
              <div className="text-center pt-8">
                <p className="text-gray-500">
                  No more {title.toLowerCase()} to load
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
