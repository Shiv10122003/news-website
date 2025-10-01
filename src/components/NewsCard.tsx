import React from "react";
import { Clock, Eye, ExternalLink } from "lucide-react";
import type { NewsArticle } from "../types";

interface NewsCardProps {
  article: NewsArticle;
  size?: "small" | "medium" | "large";
  showImage?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  size = "medium",
  showImage = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const cardClasses = {
    small:
      "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow",
    medium:
      "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow",
    large:
      "bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow",
  };

  const imageClasses = {
    small: "w-full h-32 object-cover",
    medium: "w-full h-48 object-cover",
    large: "w-full h-64 object-cover",
  };

  return (
    <article className={cardClasses[size]}>
      {showImage && (
        <div className="relative">
          <img
            src={article.imageUrl}
            alt={article.title}
            className={imageClasses[size]}
          />
          {article.isBreaking && (
            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              Breaking
            </span>
          )}
          <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {article.category}
          </span>
        </div>
      )}

      <div className={`p-${size === "large" ? "6" : "4"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
            {article.region}
          </span>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Eye className="h-3 w-3" />
            <span>{formatViews(article.views)}</span>
          </div>
        </div>

        <h2
          className={`font-bold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 cursor-pointer transition-colors ${
            size === "large"
              ? "text-xl"
              : size === "medium"
              ? "text-lg"
              : "text-sm"
          }`}
        >
          {article.title}
        </h2>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>By: {article.author}</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime} min read</span>
            </div>
          </div>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button className="mt-3 flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
          <span>Read More</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
};

export default NewsCard;
