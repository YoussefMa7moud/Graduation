import React from "react";
import { FileText, Shield, Sparkles, CheckCircle, Signature } from "lucide-react";
import "./HowItWorks.css"; 

type Step = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: FileText,
    title: "Create Contract",
    description: "Create your software contract in our intuitive platform",
  },
  {
    icon: Shield,
    title: "Rule Check",
    description: "Automatically validate against OCL constraints and company policies",
  },
  {
    icon: Sparkles,
    title: "AI Review",
    description: "AI analyzes for legal compliance focused on Egyptian law",
  },
  {
    icon: CheckCircle,
    title: "Get Results",
    description: "Receive simplified, actionable insights and recommendations",
  },
   {
    icon: Signature,
    title: "Sign Contract",
    description: "E-sign your compliant contracts directly within the platform",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="hiw-section">
      <div className="container hiw-container">
        <div className="text-center hiw-header mb-5">
          <h2 className="hiw-title">
            How It <span className="hiw-text-gradient">Works</span>
          </h2>
          <p className="lead text-muted hiw-subtitle">
            Four simple steps to ensure your contracts are compliant and legally sound
          </p>
        </div>

        <div className="hiw-timeline position-relative">
          <div className="hiw-timeline-line d-none d-lg-block" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`hiw-item ${isEven ? "hiw-item--even" : "hiw-item--odd"}`}
              >
                <div className="hiw-content">
                  <div className="hiw-card">
                    <h3 className="hiw-card-title">{step.title}</h3>
                    <p className="hiw-card-desc text-muted">{step.description}</p>
                  </div>
                </div>

                <div className="hiw-icon-wrap">
                  <div className="hiw-icon-box">
                    <Icon size={40} />
                  </div>
                </div>

                <div className="hiw-spacer" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
