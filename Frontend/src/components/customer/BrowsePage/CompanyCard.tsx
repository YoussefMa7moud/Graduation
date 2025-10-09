import React from "react";
import { Star, MapPin, TrendingUp, Users } from "lucide-react";
import "./CompanyCard.css";

const CompanyCard = ({ name, category, description, location, rating, reviews, contracts, trending }) => {
  const handleCardClick = () => {
    console.log(`Clicked on company: ${name}`);
    console.log(`Company details:`, {
      name,
      category,
      description,
      location,
      rating,
      reviews,
      contracts,
      trending
    });
  };

  return (
    <div
      className="company-card"
      onClick={handleCardClick}
      style={{
        backgroundColor: "#0A192F",
        border: "1px solid #1A345B",
        color: "white",
        borderRadius: "12px",
        padding: "24px",
        minHeight: "380px",
        position: "relative",
      }}
    >
      {/* Company Image Placeholder */}
      <div
        className="d-flex justify-content-center align-items-center rounded-3 mb-3"
        style={{
          width: "100%",
          height: "120px",
          backgroundColor: "#1A345B",
          border: "2px dashed #3B556B",
          color: "#9CA3AF",
          fontSize: "14px",
        }}
      >
        <div className="text-center">
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏢</div>
          <div>Company Logo</div>
        </div>
      </div>

      {/* Header Section */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        {/* Company Name - Left */}
        <div className="flex-grow-1">
          <h4 className="mb-0 fw-bold" style={{ fontSize: "24px", lineHeight: "1.2" }}>
            {name}
          </h4>
        </div>

        {/* Category Tag - Middle */}
        <div
          className="d-inline-block px-3 py-1 rounded-pill mx-3"
          style={{
            backgroundColor: "#1A345B",
            fontSize: "14px",
            color: "white",
            flexShrink: 0,
          }}
        >
          {category}
        </div>

        {/* Trending Tag - Right */}
        {trending && (
          <div
            className="d-flex align-items-center px-3 py-1 rounded-pill"
            style={{
              backgroundColor: "#FFD700",
              color: "#000",
              fontSize: "14px",
              fontWeight: "600",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={16} className="me-1" />
            Trending
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mb-3" style={{ fontSize: "16px", lineHeight: "1.5", color: "#E5E7EB" }}>
        {description}
      </p>

      {/* Location */}
      <div className="d-flex align-items-center mb-4" style={{ color: "#9CA3AF" }}>
        <MapPin size={16} className="me-2" />
        <span style={{ fontSize: "16px" }}>{location}</span>
      </div>

      {/* Footer Section */}
      <div className="d-flex align-items-center justify-content-between mt-auto">
        {/* Rating and Contracts */}
        <div className="d-flex align-items-center gap-4">
          <div className="d-flex align-items-center" style={{ color: "#FFD700" }}>
            <Star size={16} fill="#FFD700" className="me-1" />
            <span className="fw-bold me-1" style={{ fontSize: "16px" }}>{rating}</span>
            <span style={{ fontSize: "16px", color: "#E5E7EB" }}>({reviews})</span>
          </div>

          <div className="d-flex align-items-center" style={{ color: "#E5E7EB" }}>
            <Users size={16} className="me-2" />
            <span style={{ fontSize: "16px" }}>{contracts} contracts</span>
          </div>
        </div>

        {/* View Company Button */}
        <button
          className="btn px-4 py-2"
          style={{
            backgroundColor: "#FFD700",
            color: "#001328",
            fontWeight: "600",
            borderRadius: "8px",
            fontSize: "14px",
            border: "none",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#FFC300";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#FFD700";
            e.target.style.transform = "translateY(0)";
          }}
        >
          View Company
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
