import React from 'react';
import './TrustedBy.css';

const TrustedBy: React.FC = () => {
  return (
    <section className="trusted-by-section text-center py-5">
      <div className="container">
        <p className="trusted-text mb-4">TRUSTED BY EGYPT'S LEADING LEGAL FIRMS & ENTERPRISES</p>
        <div className="trusted-logos d-flex justify-content-center align-items-center gap-5 grayscale">
          <img src="https://cdn.worldvectorlogo.com/logos/microsoft-4.svg" width="120" height="40" alt="Microsoft" />
          <img src="https://cdn.worldvectorlogo.com/logos/google-2015.svg" width="90" height="40" alt="Google" />
          <img src="https://cdn.worldvectorlogo.com/logos/amazon-2.svg" width="100" height="40" alt="Amazon" />
          <img src="https://cdn.worldvectorlogo.com/logos/meta-1.svg" width="100" height="40" alt="Meta" />
          <img src="https://cdn.worldvectorlogo.com/logos/netflix-4.svg" width="90" height="40" alt="Netflix" />
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
