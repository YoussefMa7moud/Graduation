const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="footer-content text-center">
        <h5 className="footer-logo">Contract Compliance AI</h5>
        <ul className="footer-links list-unstyled d-flex justify-content-center mb-3">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <p className="footer-copy">
          © {new Date().getFullYear()} Contract Compliance AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
