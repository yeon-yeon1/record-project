import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../firebase"; // Firebase storage 추가
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase storage 관련 함수 추가
import "react-quill/dist/quill.snow.css";
import "./ProjectDetail.css";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([]);
  const [image, setImage] = useState(null); // 이미지 상태 추가

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "projects", projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const projectData = docSnap.data();
        setProject({ id: docSnap.id, ...projectData });
        setTitle(projectData.title);
        setSubtitle(projectData.subtitle || "");
        setDescription(projectData.description || "");
        setSections(projectData.sections || []);
        setImage(projectData.image || ""); // 이미지 설정
      } else {
        console.log("해당 문서를 찾을 수 없습니다!");
      }
    };

    fetchProject();
  }, [projectId]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSectionChange = (value, index, type) => {
    const newSections = [...sections];
    newSections[index][type] = value;
    setSections(newSections);
  };

  const handleAddDivider = () => {
    const newSections = [...sections];
    newSections.push({ type: "divider", content: "" }); // Divider와 textarea 추가
    setSections(newSections);
  };

  const handleRemoveSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageURL = await getDownloadURL(storageRef);
      setImage(imageURL);
    }
  };

  const handleUpdate = async () => {
    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, {
      title,
      subtitle,
      description,
      sections,
      image,
    });
    alert("프로젝트 설명이 업데이트되었습니다.");
    navigate("/projects");
  };

  const handleDelete = async () => {
    if (window.confirm("정말 이 프로젝트를 삭제하시겠습니까?")) {
      const docRef = doc(db, "projects", projectId);
      await deleteDoc(docRef);
      alert("프로젝트가 삭제되었습니다.");
      navigate("/projects");
    }
  };

  const handleBack = () => {
    navigate("/projects");
  };

  if (!project) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="project-detail-container">
      <button onClick={handleBack} className="back-button">
        뒤로가기
      </button>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="project-title-input"
        placeholder="프로젝트의 제목을 입력하세요"
      />
      <input
        type="text"
        value={description}
        onChange={handleDescriptionChange}
        className="project-description-input"
        placeholder="한 줄 설명을 입력하세요"
      />
      <div className="divider"></div>
      <div className="project-content">
        <input
          type="file"
          onChange={handleImageChange}
          className="image-upload-input"
          style={{ display: "none" }}
          id="imageUpload"
        />
        <label htmlFor="imageUpload">
          <img src={image} alt={title} className="project-image" style={{ cursor: "pointer" }} />
        </label>
        <div className="description-container">
          {sections.map((section, index) => (
            <div key={index} className="section">
              {section.type === "divider" ? (
                <>
                  <div className="divider-line"></div>
                  <div className="textarea-button-wrapper">
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(e.target.value, index, "content")}
                      className="section-content-textarea"
                      placeholder="상세 설명을 입력하세요"
                    />
                    <button onClick={() => handleRemoveSection(index)} className="remove-section-button">
                      X
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="textarea-button-wrapper">
                    <input
                      type="text"
                      value={section.header}
                      onChange={(e) => handleSectionChange(e.target.value, index, "header")}
                      className="section-header-input"
                      placeholder="제목을 입력하세요"
                    />
                    <button onClick={() => handleRemoveSection(index)} className="remove-section-button">
                      X
                    </button>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(e.target.value, index, "content")}
                    className="section-content-textarea"
                    placeholder="상세 설명을 입력하세요"
                  />
                </>
              )}
              {index < sections.length - 1 && <div className="line-divider"></div>}
            </div>
          ))}
          <button onClick={handleAddDivider} className="add-divider-button">
            구분선 추가
          </button>
        </div>
      </div>
      <button onClick={handleUpdate} className="update-button">
        업데이트
      </button>
      <button onClick={handleDelete} className="delete-button-p">
        삭제
      </button>
    </div>
  );
};

export default ProjectDetail;
