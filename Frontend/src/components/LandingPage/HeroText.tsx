import React from "react";

const HeroText = () => {
  return (
    <div className="hero-text">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{color:"white"}} className="text-5xl lg:text-6xl font-bold leading-tight">
          Smarter Contract Compliance{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #FFC300 0%, #e0cf7bff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            with AI
          </span>
        </h1>
      </div>

      <p>
        Ensure your software contracts are legally compliant with Egyptian law
        and company policies. Our platform combines OCL validation, AI-powered
        legal review, and contract signing—all in one place.
      </p>
      <div className="d-flex gap-2 mt-4" > 
      <button type="button" style={{background:"linear-gradient(90deg, #FFC300 0%, #e0cf7bff 100%)"}} className="btn btn-lg">Get Started</button>
      <button type="button" style={{background:"#01122bff",color:"white"}} className="btn btn-lg">Terms & Conditions</button>
      </div>
    </div>
  );
};

export default HeroText;
