import React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { NewsArticle } from "../types";
import NewsCard from "./NewsCard";

interface NewsGridProps {
  news: NewsArticle[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const NewsGrid: React.FC<NewsGridProps> = ({
  news,
  loading = false,
  error = null,
  onRefresh,
  onLoadMore,
  hasMore = true,
  loadingMore = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">No news available</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Article */}
      {news.length > 0 && (
        <div className="mb-8">
          <NewsCard article={news[0]} size="large" />
        </div>
      )}

      {/* Grid Layout for remaining articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.slice(1).map((article) => (
          <NewsCard key={article.id} article={article} size="medium" />
        ))}
      </div>

      {/* Load More Button */}
      {news.length > 0 && hasMore && onLoadMore && (
        <div className="text-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading More...</span>
              </>
            ) : (
              <span>Load More News</span>
            )}
          </button>
        </div>
      )}

      {/* No More News Message */}
      {news.length > 0 && !hasMore && (
        <div className="text-center pt-8">
          <p className="text-gray-500">No more news to load</p>
        </div>
      )}
    </div>
  );
};

export default NewsGrid;
