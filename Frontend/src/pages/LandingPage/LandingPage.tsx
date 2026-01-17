import React from 'react';
import './LandingPage.css';
import Navbar from '../../components/LandingPage/Navbar';
import Hero from '../../components/LandingPage/Hero';
import TrustedBy from '../../components/LandingPage/TrustedBy';
import Features from '../../components/LandingPage/Features';
import Workflow from '../../components/LandingPage/Workflow';
import Compliance from '../../components/LandingPage/Compliance';
import Testimonials from '../../components/LandingPage/Testimonials';
import Footer from '../../components/LandingPage/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="lexguard-landing-page page-fade-in">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Workflow />
      <Compliance />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default LandingPage;