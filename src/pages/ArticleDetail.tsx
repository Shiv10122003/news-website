import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Calendar, User, Tag } from "lucide-react";
import type { NewsArticle } from "../types";

interface ArticleDetailProps {
  articles?: NewsArticle[];
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ articles = [] }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // In a real app, you'd fetch the article by ID from an API
  const article = articles.find((a) => a.id === id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The article you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {/* Article */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Article Header */}
            <div className="relative bg-gray-100">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-96 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop";
                }}
              />
              {article.isBreaking && (
                <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Breaking News
                </span>
              )}
              <span className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {article.category}
              </span>
            </div>

            <div className="p-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{article.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime} min read</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{formatViews(article.views)} views</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {article.region}
                </span>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {article.summary}
                </p>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {article.content}
                </div>
              </div>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Share this article</p>
                  <div className="flex space-x-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Facebook
                    </button>
                    <button className="text-blue-400 hover:text-blue-500 text-sm font-medium">
                      Twitter
                    </button>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetail;
