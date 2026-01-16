import React, { useState } from 'react';
import InfoSidebar from '../../components/Auth/InfoSidebar';
import LoginForm from '../../components/Auth/LoginForm';
import SignupForm from '../../components/Auth/SignupForm';
import './AuthStyles.css';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const toggleAuthMode = () => setIsLogin(!isLogin);

  return (
    <div className="auth-container">
      <div className={`auth-content-wrapper ${isLogin ? 'show-login' : 'show-signup'}`}>
        
        
        {/* Sidebar Section */}
        <div className="sidebar-section">
          <InfoSidebar />
        </div>

        {/* Form Section */}
        <div className="form-section">
          {isLogin ? (
            <LoginForm onSwitch={toggleAuthMode} />
          ) : (
            <SignupForm onSwitch={toggleAuthMode} />
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthPage;