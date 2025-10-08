import React from "react";

const AnnouncementsSection: React.FC = () => {
  const announcements = [
    {
      title: "AI Contract Validation Update",
      description: "Our compliance model has been updated for Egyptian Data Protection Law 2025.",
      date: "Oct 6, 2025",
    },
    {
      title: "New Companies Joined",
      description: "5 new verified software companies are available to collaborate with.",
      date: "Oct 4, 2025",
    },
  ];

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        color: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
        📢 Announcements
      </h2>

      {announcements.map((item, index) => (
        <div key={index} style={{ marginBottom: "16px" }}>
          <h4 style={{ color: "#FFD60A", marginBottom: "4px" }}>{item.title}</h4>
          <p style={{ margin: 0, opacity: 0.9 }}>{item.description}</p>
          <small style={{ color: "#ccc" }}>{item.date}</small>
          {index !== announcements.length - 1 && (
            <hr style={{ borderColor: "rgba(255,255,255,0.2)", marginTop: "12px" }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsSection;
