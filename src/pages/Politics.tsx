import React from "react";
import CategoryPage from "./CategoryPage";

const Politics: React.FC = () => {
  return (
    <CategoryPage
      category="politics"
      title="Politics"
      description="Political news, government policies, and election updates from India"
    />
  );
};

export default Politics;
