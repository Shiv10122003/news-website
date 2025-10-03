import React from "react";
import { Link } from "react-router-dom";
import { Search, Menu, MapPin, Bell } from "lucide-react";
import type { Region } from "../types";

interface HeaderProps {
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (regionCode: string) => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  regions,
  selectedRegion,
  onRegionChange,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-red-700 text-white shadow-lg">
      {/* Top Bar */}
      <div className="bg-red-800 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span>Tuesday, October 1, 2025</span>
            <span>|</span>
            <span>Today's News</span>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-4 w-4" />
            <span>Breaking News</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-3xl font-bold">NewsHub India</h1>
            <span className="text-yellow-300 text-sm ml-2">Regional News</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full px-4 py-2 pl-10 text-gray-800 rounded-lg border focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Mobile Menu */}
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-red-600 border-t border-red-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-3">
            {/* Region Selector */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="bg-transparent border border-red-400 rounded px-3 py-1 text-sm focus:outline-none focus:border-yellow-300"
              >
                {regions.map((region) => (
                  <option
                    key={region.id}
                    value={region.code}
                    className="text-gray-800"
                  >
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <Link to="/" className="hover:text-yellow-300 transition-colors">
                Home
              </Link>
              <Link
                to="/top-news"
                className="hover:text-yellow-300 transition-colors"
              >
                Top News
              </Link>
              <Link
                to="/politics"
                className="hover:text-yellow-300 transition-colors"
              >
                Politics
              </Link>
              <Link
                to="/sports"
                className="hover:text-yellow-300 transition-colors"
              >
                Sports
              </Link>
              <Link
                to="/entertainment"
                className="hover:text-yellow-300 transition-colors"
              >
                Entertainment
              </Link>
              <Link
                to="/business"
                className="hover:text-yellow-300 transition-colors"
              >
                Business
              </Link>
              <Link
                to="/technology"
                className="hover:text-yellow-300 transition-colors"
              >
                Technology
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
