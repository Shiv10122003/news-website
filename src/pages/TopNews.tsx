import React from "react";
import CategoryPage from "./CategoryPage";

const TopNews: React.FC = () => {
  return (
    <CategoryPage
      category="top-news"
      title="Top News"
      description="Latest breaking news and trending stories from across India"
    />
  );
};

export default TopNews;
