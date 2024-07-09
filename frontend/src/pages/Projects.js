import React, { useEffect, useState } from "react";
import axios from "axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/projects")
      .then((response) => setProjects(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Projects Page</h1>
      <ul>
        {projects.map((project) => (
          <li key={project._id}>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            <p>{project.technology}</p>
            <a href={project.link}>Project Link</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
