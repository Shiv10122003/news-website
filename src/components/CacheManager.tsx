import React, { useState } from "react";
import { RefreshCw, Trash2, Database, Info } from "lucide-react";
import { clearAllNewsCache, getCacheInfo } from "../utils/cacheUtils";

const CacheManager: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({
    totalSize: 0,
    items: [] as string[],
  });

  const handleRefreshCache = () => {
    const info = getCacheInfo();
    setCacheInfo(info);
  };

  const handleClearCache = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all cached news? This will reload fresh data from the API."
      )
    ) {
      clearAllNewsCache();
      alert("Cache cleared successfully! The page will reload.");
      window.location.reload();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <button
        onClick={() => {
          handleRefreshCache();
          setShowModal(true);
        }}
        className="flex items-center space-x-1 bg-yellow-300 text-gray-800 px-3 py-1 rounded hover:bg-yellow-400 transition-colors text-sm"
        title="Manage Cache"
      >
        <Database className="h-4 w-4" />
        <span className="hidden md:inline">Cache</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Cache Manager
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">About Caching</p>
                    <p>
                      News data is cached locally to reduce API calls and
                      improve performance. Cache automatically expires after 15
                      minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Cache Statistics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Size:</span>
                    <span className="font-medium">
                      {formatBytes(cacheInfo.totalSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cached Items:</span>
                    <span className="font-medium">
                      {cacheInfo.items.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">News Items:</span>
                    <span className="font-medium">
                      {
                        cacheInfo.items.filter((item) => item.includes("news-"))
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleRefreshCache}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Stats</span>
                </button>
                <button
                  onClick={handleClearCache}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Cache</span>
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CacheManager;
