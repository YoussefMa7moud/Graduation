import React from "react";

type Company = {
  logo: string;
  name: string;
  description: string;
  rating: number;
};

const SuggestedCompanies: React.FC = () => {
  const companies: Company[] = [
    {
      logo: "https://via.placeholder.com/80x80?text=Logo1",
      name: "SoftTech Solutions",
      description: "Specialized in medical software and AI integrations.",
      rating: 4.7,
    },
    {
      logo: "https://via.placeholder.com/80x80?text=Logo2",
      name: "CodeCrafters Egypt",
      description: "Experts in enterprise-level systems and compliance tools.",
      rating: 4.5,
    },
    {
      logo: "https://via.placeholder.com/80x80?text=Logo3",
      name: "Digital Nexus",
      description: "Trusted provider of secure cloud-based software contracts.",
      rating: 4.8,
    },
  ];

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
        💼 Suggested Companies
      </h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          paddingBottom: "10px",
        }}
      >
        {companies.map((company, index) => (
          <div
            key={index}
            style={{
              minWidth: "350px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "16px",
              padding: "16px",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src={company.logo}
              alt={company.name}
              style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover" }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#FFD60A", marginBottom: "4px" }}>{company.name}</h4>
              <p style={{ margin: "0 0 6px 0", fontSize: "14px", opacity: 0.9 }}>
                {company.description}
              </p>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>⭐ {company.rating}</p>
              <button
                style={{
                  backgroundColor: "#FFD60A",
                  border: "none",
                  color: "#001D3D",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedCompanies;
