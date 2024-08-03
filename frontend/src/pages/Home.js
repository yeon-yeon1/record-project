import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = ({ user }) => {
  const userId = user ? user.email.split("@")[0] : "Guest";
  const navigate = useNavigate();
  const templates = ["Projects", "Certifications", "Dailywrite", "Notes"];

  const handleTemplateSelect = (template) => {
    navigate(`/${template.toLowerCase()}`);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <>
      <div className="home-container">
        <div className="p-b">
          <p className="ID">{userId}</p>
          <div className="template-buttons-h">
            {templates.map((template, index) => (
              <button key={index} className="template-button-h" onClick={() => handleTemplateSelect(template)}>
                {template}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="abl">
        {userId === "Guest" && (
          <div className="auth-buttons-lp">
            <button className="template-button-h-l" onClick={handleLogin}>
              Login
            </button>
            <button className="template-button-h-p" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
