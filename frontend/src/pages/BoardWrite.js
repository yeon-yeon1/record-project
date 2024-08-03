import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./BoardWrite.css";

const BoardWrite = () => {
  const { subject, boardId } = useParams();
  const { state } = useLocation();
  const postTitle = state ? state.postTitle : subject + " 게시판";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (auth.currentUser) {
      await addDoc(collection(db, "Posts"), {
        uid: auth.currentUser.uid,
        boardId,
        title,
        content,
        sections,
        createdAt: new Date(),
        fromDetail: true, // BoardWrite에서 생성된 글
      });
      navigate(`/board/${subject}/${boardId}`, { state: { postTitle } });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleAddDivider = () => {
    const newSections = [...sections, { type: "divider", content: "" }];
    setSections(newSections);
  };

  const handleSectionChange = (value, index) => {
    const newSections = [...sections];
    newSections[index].content = value;
    setSections(newSections);
  };

  const handleRemoveSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  return (
    <div className="board-write-container">
      <button onClick={handleBack} className="back-button-write">
        뒤로가기
      </button>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="post-title-input"
        placeholder="제목을 입력하세요"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        className="post-content-textarea"
        placeholder="내용을 입력하세요"
      />
      <div className="sections">
        {sections.map((section, index) => (
          <div key={index} className="section">
            <div className="textarea-button-wrapper">
              <textarea
                value={section.content}
                onChange={(e) => handleSectionChange(e.target.value, index)}
                className="section-content-textarea"
                placeholder="상세 설명을 입력하세요"
              />
              <button onClick={() => handleRemoveSection(index)} className="remove-section-button">
                X
              </button>
            </div>
            <div className="divider-line"></div>
          </div>
        ))}
      </div>
      <button onClick={handleAddDivider} className="add-divider-button">
        구분선 추가
      </button>
      <button onClick={handleSave} className="save-button">
        저장
      </button>
    </div>
  );
};

export default BoardWrite;
