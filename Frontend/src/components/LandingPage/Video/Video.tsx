import React from "react";
import "./Video.css";

const Video = () => {
  return (
    <div className="video-section">
      <div className="video-container">
        <iframe
          src="https://www.youtube.com/embed/qy-oCVunP2I"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
        />
      </div>
    </div>
  );
};

export default Video;
