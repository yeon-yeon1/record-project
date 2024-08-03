import React from "react";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Dailywrite from "./Dailywrite";
import Notes from "./Notes";
import "./NewPageTemplate.css";

const NewPageTemplate = ({ template }) => {
  const renderTemplate = () => {
    switch (template) {
      case "Projects":
        return <Projects />;
      case "Certifications":
        return <Certifications />;
      case "Dailywrite":
        return <Dailywrite />;
      case "Notes":
        return <Notes />;
      default:
        return <div>Invalid template selected.</div>;
    }
  };

  return <div className="template-container">{renderTemplate()}</div>;
};

export default NewPageTemplate;
