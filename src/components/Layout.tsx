import React from "react";
import Header from "../components/Header";
import type { Region } from "../types";

interface LayoutProps {
  regions: Region[];
  selectedRegion: string;
  onRegionChange: (regionCode: string) => void;
  onSearch: (query: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  regions,
  selectedRegion,
  onRegionChange,
  onSearch,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        regions={regions}
        selectedRegion={selectedRegion}
        onRegionChange={onRegionChange}
        onSearch={onSearch}
      />
      {children}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">NewsHub India</h3>
              <p className="text-gray-300 text-sm">
                Your trusted regional news source. We provide accurate and
                unbiased news coverage across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/politics" className="hover:text-white">
                    Politics
                  </a>
                </li>
                <li>
                  <a href="/sports" className="hover:text-white">
                    Sports
                  </a>
                </li>
                <li>
                  <a href="/entertainment" className="hover:text-white">
                    Entertainment
                  </a>
                </li>
                <li>
                  <a href="/business" className="hover:text-white">
                    Business
                  </a>
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
    </div>
  );
};

export default Layout;
