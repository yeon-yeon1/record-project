import React, { useState } from "react";
import "./NewPage.css";
import PageTemplate from "./PageTemplate";

const NewPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const templates = ["Projects", "Certifications", "Dailywrite", "Notes"];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="new-page-container">
      {!selectedTemplate ? (
        <>
          <div className="template-buttons">
            {templates.map((template, index) => (
              <button key={index} className="template-button" onClick={() => handleTemplateSelect(template)}>
                {template}
              </button>
            ))}
          </div>
        </>
      ) : (
        <PageTemplate template={selectedTemplate} />
      )}
    </div>
  );
};

export default NewPage;
