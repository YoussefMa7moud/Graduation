import React, { useState } from "react";
import { Search, Filter, Star, MapPin, TrendingUp, Users } from "lucide-react";
import CompanyCard from "../../components/customer/BrowsePage/CompanyCard";
import "./BrowsePage.css";
import Navbar from "../../components/customer/CustomerNavbar";

const companies = [
  {
    name: "TechCorp Solutions",
    category: "Technology",
    description: "Leading provider of enterprise software solutions and cloud infrastructure services.",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 156,
    contracts: 89,
    trending: true,
  },
  {
    name: "Global Finance Group",
    category: "Finance",
    description: "Comprehensive financial services including investment banking and asset management.",
    location: "New York, NY",
    rating: 4.8,
    reviews: 203,
    contracts: 124,
    trending: false,
  },
  {
    name: "HealthFirst Medical",
    category: "Healthcare",
    description: "Advanced healthcare solutions with focus on patient care and medical innovation.",
    location: "Boston, MA",
    rating: 4.9,
    reviews: 178,
    contracts: 95,
    trending: true,
  },
];

const BrowseCompanies: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
    <Navbar/>
    <div className="browse-container">
      <h1>Browse Companies</h1>
      <p>Discover and connect with top-rated companies</p>

      {/* Search and filters */}
      <div className="search-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search companies by name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters">
          <Filter size={18} />
          <select>
            <option>All Categories</option>
            <option>Technology</option>
            <option>Finance</option>
            <option>Healthcare</option>
          </select>

          <select>
            <option>All Ratings</option>
            <option>4.5+</option>
            <option>4.0+</option>
          </select>
        </div>
      </div>

      <p className="result-count">
        {filteredCompanies.length} companies found
      </p>

      {/* Company cards */}
      <div className="company-grid">
        {filteredCompanies.map((company, index) => (
          <CompanyCard key={index} {...company} />
        ))}
      </div>
    </div>
    </>
  );
};

export default BrowseCompanies;
