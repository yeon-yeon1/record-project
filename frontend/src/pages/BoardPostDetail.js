import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./BoardPostDetail.css";

const BoardPostDetail = () => {
  const { subject, boardId, postId } = useParams();
  const [post, setPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "Posts", postId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const postData = docSnap.data();
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setSections(postData.sections || []);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => {
    navigate(`/board/${subject}/${boardId}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSectionChange = (value, index, type) => {
    const newSections = [...sections];
    newSections[index][type] = value;
    setSections(newSections);
  };

  const handleAddDivider = () => {
    const newSections = [...sections];
    newSections.push({ type: "divider", content: "" });
    setSections(newSections);
  };

  const handleRemoveSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const handleSave = async () => {
    const docRef = doc(db, "Posts", postId);
    await updateDoc(docRef, {
      title,
      content,
      sections,
    });
    setPost({ ...post, title, content, sections });
    setIsEditing(false);
    alert("게시글이 업데이트되었습니다.");
  };

  if (!post) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="board-post-detail-container">
      <div className="back-plus">
        <button onClick={handleBack} className="back-button-write">
          뒤로가기
        </button>
        {!isEditing && (
          <button onClick={handleEdit} className="edit-button">
            수정
          </button>
        )}
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="post-title-input"
            placeholder="제목을 입력하세요"
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            className="post-content-textarea"
            placeholder="내용을 입력하세요"
          />
          <div className="divider-post"></div>
          <div className="post-sections">
            {sections.map((section, index) => (
              <div key={index} className="section">
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
                {index < sections.length - 1 && <div className="line-divider"></div>}
              </div>
            ))}
            <button onClick={handleAddDivider} className="add-divider-button">
              구분선 추가
            </button>
          </div>
          <button onClick={handleSave} className="save-button">
            저장
          </button>
        </>
      ) : (
        <>
          <h2>{post.title}</h2>
          <div className="line"></div>
          <p>{post.content}</p>
          <div className="sections">
            {sections.map((section, index) => (
              <div key={index} className="section">
                <div className="divider-line"></div>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BoardPostDetail;
