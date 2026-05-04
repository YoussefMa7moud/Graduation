import bgImage from '../../assets/auth_bg_abstract.png';

const InfoSidebar = () => {
  const sidebarStyle = {
    backgroundImage: `linear-gradient(rgba(18, 30, 49, 0.9), rgba(18, 30, 49, 0.9)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
  return (
    <div className="info-sidebar" style={sidebarStyle}>
      <div className="brand-section">
        <div className="d-flex align-items-center mb-5">
          <div className="logo-icon me-3"></div>
          <h4 className="m-0">SoftwareGuard</h4>
        </div>
        
        <h1>The intelligent standard for Software Security.</h1>
        <p className="lead">
          Enterprise-grade software analysis tailored specifically for corporate tech teams navigating the complex security landscape.
        </p>
      </div>

      <div className="sidebar-footer">
        <div className="nlp-badge mb-3">
          <span className="badge rounded-pill border border-secondary p-2">
            ✨ Powered by AI & OCL
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoSidebar;