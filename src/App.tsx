import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import BreakingNews from "./components/BreakingNews";
import NewsGrid from "./components/NewsGrid";
import Sidebar from "./components/Sidebar";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import TopNews from "./pages/TopNews";
import Politics from "./pages/Politics";
import Sports from "./pages/Sports";
import Entertainment from "./pages/Entertainment";
import Business from "./pages/Business";
import Technology from "./pages/Technology";
import ArticleDetail from "./pages/ArticleDetail";
import { newsAPI } from "./services/api";
import type { NewsArticle, Region } from "./types";

function App() {
  // State management for the original functionality
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<NewsArticle[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreNews, setHasMoreNews] = useState<boolean>(true);

  const regions: Region[] = [
    { id: "1", name: "All Regions", code: "all" },
    { id: "2", name: "India", code: "india" },
    { id: "3", name: "Punjab", code: "punjab" },
    { id: "4", name: "Delhi", code: "delhi" },
    { id: "5", name: "Mumbai", code: "mumbai" },
    { id: "6", name: "Kerala", code: "kerala" },
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load breaking and featured news in parallel
        const [breakingResponse, featuredResponse] = await Promise.all([
          newsAPI.getBreakingNews?.() || Promise.resolve({ data: [] }),
          newsAPI.getFeaturedNews?.(10) || Promise.resolve({ data: [] }),
        ]);

        setBreakingNews(breakingResponse.data || []);
        setFeaturedNews(featuredResponse.data || []);

        // Load initial news for all regions
        const newsResponse = await newsAPI.getNewsByRegion("all", 1, 10);
        setNews(newsResponse.data || []);
        setCurrentPage(1);
        setHasMoreNews((newsResponse.data || []).length >= 10);
      } catch (err) {
        setError("Error loading news. Please try again.");
        console.error("Error loading initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle region change
  const handleRegionChange = async (regionCode: string) => {
    setSelectedRegion(regionCode);
    try {
      setLoading(true);
      setError(null);

      const response = await newsAPI.getNewsByRegion(regionCode, 1, 10);
      setNews(response.data || []);
      setCurrentPage(1);
      setHasMoreNews((response.data || []).length >= 10);
    } catch (err) {
      setError("Error loading news.");
      console.error("Error loading news by region:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // If empty search, reload current region news
      handleRegionChange(selectedRegion);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response =
        (await newsAPI.searchNews?.(query, selectedRegion)) ||
        (await newsAPI.getNewsByRegion(selectedRegion, 1, 10));
      setNews(response.data || []);
      setCurrentPage(1);
      setHasMoreNews((response.data || []).length >= 10);
    } catch (err) {
      setError("Search error occurred.");
      console.error("Error searching news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    handleRegionChange(selectedRegion);
  };

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
      const newArticles = response.data || [];

      if (newArticles.length > 0) {
        // Filter out duplicates based on article ID
        const filteredArticles = newArticles.filter(
          (newArticle: NewsArticle) =>
            !news.some(
              (existingArticle: NewsArticle) =>
                existingArticle.id === newArticle.id
            )
        );

        setNews((prevNews) => [...prevNews, ...filteredArticles]);
        setCurrentPage(nextPage);
        setHasMoreNews(newArticles.length >= 10);
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Route with Layout wrapper for page components */}
          <Route
            path="/home"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <Home regions={regions} selectedRegion={selectedRegion} />
              </Layout>
            }
          />
          <Route
            path="/top-news"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <TopNews />
              </Layout>
            }
          />
          <Route
            path="/politics"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <Politics />
              </Layout>
            }
          />
          <Route
            path="/sports"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <Sports />
              </Layout>
            }
          />
          <Route
            path="/entertainment"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <Entertainment />
              </Layout>
            }
          />
          <Route
            path="/business"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <Business />
              </Layout>
            }
          />
          <Route
            path="/technology"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <Technology />
              </Layout>
            }
          />

          {/* Article Detail Route */}
          <Route
            path="/article/:id"
            element={
              <Layout
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                onSearch={handleSearch}
                regions={regions}
              >
                <ArticleDetail articles={news} />
              </Layout>
            }
          />

          {/* Default route with original functionality */}
          <Route
            path="/"
            element={
              <>
                <Header
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onRegionChange={handleRegionChange}
                  onSearch={handleSearch}
                />

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
                                regions.find((r) => r.code === selectedRegion)
                                  ?.name
                              } News`}
                        </h1>
                        <p className="text-gray-600">
                          Latest and important news updates
                        </p>
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
                        trendingNews={featuredNews.sort(
                          (a, b) => b.views - a.views
                        )}
                      />
                    </div>
                  </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-800 text-white py-8 mt-16">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <h3 className="text-lg font-bold mb-4">
                          NewsHub India
                        </h3>
                        <p className="text-gray-300 text-sm">
                          Your trusted regional news source. We provide accurate
                          and unbiased news coverage across India.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li>
                            <Link to="/politics" className="hover:text-white">
                              Politics
                            </Link>
                          </li>
                          <li>
                            <Link to="/sports" className="hover:text-white">
                              Sports
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/entertainment"
                              className="hover:text-white"
                            >
                              Entertainment
                            </Link>
                          </li>
                          <li>
                            <Link to="/business" className="hover:text-white">
                              Business
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Regions</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          {regions.slice(0, 4).map((region) => (
                            <li key={region.id}>
                              <a href="#" className="hover:text-white">
                                {region.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li>Email: contact@newshubindia.com</li>
                          <li>Phone: +91 98765 43210</li>
                          <li>Address: New Delhi, India</li>
                        </ul>
                      </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-300">
                      <p>&copy; 2025 NewsHub India. All rights reserved.</p>
                    </div>
                  </div>
                </footer>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
