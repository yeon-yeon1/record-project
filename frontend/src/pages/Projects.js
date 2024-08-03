import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Projects.css";

const Projects = ({ user }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const q = query(collection(db, "projects"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const projectsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProjects(projectsList);
        setLoading(false);
      } else {
        setLoading(false); // 사용자 정보가 없을 때 로딩 상태를 false로 설정
      }
    };

    fetchProjects();
  }, [user]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  const handleAddProject = () => {
    navigate("/add-project");
  };

  const handleImageClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="projects-container">
      <h2 className="project">Projects 갤러리</h2>
      <div className="projectline"></div>
      {projects.length === 0 ? (
        <div></div>
      ) : (
        <Slider {...settings}>
          {projects.map((project, index) => (
            <div key={index} className="project-slide" onClick={() => handleImageClick(project.id)}>
              {project.image && <img src={project.image} alt={project.title} />}
              <h3>{project.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: project.description }}></p>
            </div>
          ))}
        </Slider>
      )}
      <button onClick={handleAddProject} className="add-project">
        Add Project
      </button>
    </div>
  );
};

export default Projects;
