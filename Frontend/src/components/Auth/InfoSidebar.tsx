import bgImage from '../../assets/office.png';

const InfoSidebar = () => {
  const sidebarStyle = {
    backgroundImage: `linear-gradient(rgba(18, 30, 49, 0.9), rgba(18, 30, 49, 0.9)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
  return (
    <div className="info-sidebar d-flex flex-column justify-content-between p-5 text-white" style={sidebarStyle}>
      <div className="brand-section">
        <div className="d-flex align-items-center mb-5">
          <div className="logo-icon me-2"></div>
          <h4 className="fw-bold m-0">LexAI Egypt</h4>
        </div>
        
        <h1 className="display-4 fw-bold mb-4">
          The intelligent standard for Egyptian Law.
        </h1>
        <p className="lead opacity-75">
          Enterprise-grade contract analysis tailored specifically for corporate legal teams navigating the Egyptian regulatory landscape.
        </p>
      </div>

      <div className="sidebar-footer">
        <div className="nlp-badge mb-3">
          <span className="badge rounded-pill border border-secondary p-2">
            ✨ Powered by Arabic NLP
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoSidebar;