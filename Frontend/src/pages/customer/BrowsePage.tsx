import React, { useState } from "react";
import { Search, Filter, Star, MapPin, TrendingUp, Users } from "lucide-react";
import CompanyCard from "../../components/customer/BrowsePage/CompanyCard";
import "./BrowsePage.css";
import Navbar from "../../components/customer/CustomerNavbar";
import TopSection from "../../components/customer/BrowsePage/TopSection";

const companies = [
  {
    name: "TechCorp Solutions",
    category: "Technology",
    description:
      "Leading provider of enterprise software solutions and cloud infrastructure services.",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 156,
    contracts: 89,
    trending: true,
  },
  {
    name: "Global Finance Group",
    category: "Finance",
    description:
      "Comprehensive financial services including investment banking and asset management.",
    location: "New York, NY",
    rating: 4.8,
    reviews: 203,
    contracts: 124,
    trending: false,
  },
  {
    name: "HealthFirst Medical",
    category: "Healthcare",
    description:
      "Advanced healthcare solutions with focus on patient care and medical innovation.",
    location: "Boston, MA",
    rating: 4.9,
    reviews: 178,
    contracts: 95,
    trending: true,
  },
  {
    name: "Global Finance Group",
    category: "Finance",
    description:
      "Comprehensive financial services including investment banking and asset management.",
    location: "New York, NY",
    rating: 4.8,
    reviews: 203,
    contracts: 124,
    trending: false,
  },
  {
    name: "Global Finance Group",
    category: "Finance",
    description:
      "Comprehensive financial services including investment banking and asset management.",
    location: "New York, NY",
    rating: 4.8,
    reviews: 203,
    contracts: 124,
    trending: false,
  },
];

const BrowseCompanies = () => {
  // in the future you can apply filters or search here
  const [filteredCompanies] = useState(companies);

  return (
    <>
      <Navbar />
      <TopSection />

      {/* Company cards */}
    

        <div className="company-grid">
          {filteredCompanies.map((company, index) => (
            <CompanyCard key={index} {...company} />
          ))}
        </div>
  
    
    </>
  );
};

export default BrowseCompanies;
