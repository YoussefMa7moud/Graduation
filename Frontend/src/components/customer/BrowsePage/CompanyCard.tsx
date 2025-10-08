import React from "react";
import { MapPin, Star, Users, TrendingUp } from "lucide-react";

type Props = {
  name: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  contracts: number;
  trending: boolean;
};

const CompanyCard: React.FC<Props> = ({
  name,
  category,
  description,
  location,
  rating,
  reviews,
  contracts,
  trending,
}) => {
  return (
    <div className={`company-card ${trending ? "highlight" : ""}`}>
      <div className="company-header">
        <h3>{name}</h3>
        {trending && (
          <div className="trending-tag">
            <TrendingUp size={14} /> Trending
          </div>
        )}
      </div>

      <div className="category-tag">{category}</div>
      <p className="description">{description}</p>

      <div className="location">
        <MapPin size={14} /> {location}
      </div>

      <div className="company-footer">
        <div className="rating">
          <Star size={14} /> {rating} <span>({reviews})</span>
        </div>
        <div className="contracts">
          <Users size={14} /> {contracts} contracts
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
