import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/LandingPage/NavBar";
import "./Auth.css";

const Auth: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsSignup(!isSignup);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

   
    if (isSignup) {
      if (!email || !password || !confirmPassword || !username) {
        setError("Please fill the fields");
        return;
      }
 
      if (!validateEmail(email)) {
        setError("Incorrect email");
        return;
      }
   
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      setError("");
      alert("Signup successful!");
    } else {
      if (!email || !password) {
        setError("Please fill the fields");
        return;
      }
      if (email === "nour@gmail.com" && password === "nour1234") {
        setError("");
       navigate("/Browse");
      } else {
        setError("Incorrect email or password");
      }
    }
  };

  return (
    <>
      <Navbar showLogin={false} showHome={true} />

      <div className="auth-container-wrapper">
        <div className="auth-container">
     
          <div className="auth-left">
            <div className="brand-title">
              <span className="white-text">Contract</span>
              <span className="yellow-text">AI</span>
            </div>

            <div className="brand-tagline">
              <span className="white-text">Smarter Contract Compliance </span>
              <span className="yellow-text">with AI</span>
            </div>
          </div>

     
          <div className="auth-right">
            <div className="form-box">
              <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
              <p className="subtitle">
                {isSignup
                  ? "Sign up to start using our platform"
                  : "Login to continue"}
              </p>

              <form onSubmit={handleSubmit}>
                {isSignup && (
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
                {isSignup && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                  />
                )}

                
                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="auth-btn">
                  {isSignup ? "Sign Up" : "Login"}
                </button>
              </form>

              <p className="toggle-text">
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <span onClick={handleToggle}>
                  {isSignup ? "Login" : "Sign Up"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
