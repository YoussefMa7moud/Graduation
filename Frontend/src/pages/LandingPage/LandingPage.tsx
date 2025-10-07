import React from "react";
import { FileText, Shield, Sparkles, CheckCircle2, Video } from "lucide-react";
import CardSwap, { Card } from "../../components/LandingPage/CardSwap/CardSwap";
import "./LandingPage.css";
import Navbar from "../../components/LandingPage/NavBar";
import HowItWorks from "../../components/LandingPage/HowItWorks/HowItWorks";
import HeroText from "../../components/LandingPage/HeroText";
import VideoComponent from "../../components/LandingPage/Video/Video";
import Footer from "../../components/LandingPage/Footer";

const steps = [
  {
    icon: FileText,
    title: "Create Contract",
    description:
      "Companies log in and create software contracts through our intuitive interface.",
  },
  {
    icon: Shield,
    title: "Rule Check",
    description:
      "Contracts are validated against company-specific OCL constraints automatically.",
  },
  {
    icon: Sparkles,
    title: "AI Review",
    description:
      "Advanced AI analyzes contracts for legal issues under Egyptian law.",
  },
];

const LandingPage = () => {
  return (
    <div className="landing-page d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <div className="hero-section">
          <HeroText />

          <div className="card-section">
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={3000}
              pauseOnHover={false}
            >
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index}>
                    <div className="icon-box blue-bg" style={{ backgroundColor: "#FFC300" }}>
                      <Icon size={32} className="icon-white" style={{ color: "#001D3D" }} />
                    </div>
                    <h1>{step.title}</h1>
                    <p>{step.description}</p>
                  </Card>
                );
              })}
            </CardSwap>
          </div>
        </div>

        <HowItWorks />
        <VideoComponent />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
