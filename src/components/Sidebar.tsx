import React, { useState } from "react";
import { TrendingUp, Star, Clock } from "lucide-react";
import type { NewsArticle } from "../types";
import {
  getPlaceholderImage,
  createImageErrorHandler,
} from "../utils/imageUtils";

interface SidebarProps {
  featuredNews: NewsArticle[];
  trendingNews: NewsArticle[];
}

const Sidebar: React.FC<SidebarProps> = ({ featuredNews, trendingNews }) => {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <aside className="space-y-6">
      {/* Featured News */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-bold text-gray-900">Featured News</h2>
        </div>
        <div className="space-y-4">
          {featuredNews.slice(0, 5).map((article) => (
            <div
              key={article.id}
              className="flex space-x-3 pb-3 border-b border-gray-100 last:border-b-0"
            >
              <img
                src={
                  imageErrors[article.id] || !article.imageUrl
                    ? getPlaceholderImage(article.id, "sidebar")
                    : article.imageUrl
                }
                alt={article.title}
                className="w-16 h-16 rounded-lg object-contain bg-gray-100 flex-shrink-0"
                onError={createImageErrorHandler(article.id, setImageErrors)}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-red-600 cursor-pointer transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending News */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-lg font-bold text-gray-900">Trending</h2>
        </div>
        <div className="space-y-3">
          {trendingNews.slice(0, 8).map((article, index) => (
            <div key={article.id} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-red-600 cursor-pointer transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>{article.views} views</span>
                  <span className="mx-1">•</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advertisement Placeholder */}
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Advertisement Space</p>
        <p className="text-sm text-gray-400 mt-1">Your Ad Here</p>
      </div>
    </aside>
  );
};

export default Sidebar;
