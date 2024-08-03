import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import "./DailywriteDetail.css";

const DailywriteDetail = () => {
  const { diaryId } = useParams();
  const [diary, setDiary] = useState(null);
  const [originalDiary, setOriginalDiary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiary = async () => {
      if (diaryId) {
        const docRef = doc(db, "Diaries", diaryId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const diaryData = docSnap.data();
          setDiary(diaryData);
          setOriginalDiary({ ...diaryData });
          setTitle(diaryData.title);
          setContent(diaryData.content);
          setSections(diaryData.sections || []);
          setSelectedDate(new Date(diaryData.date));
        }
      }
    };

    fetchDiary();
  }, [diaryId]);

  const handleBack = () => {
    if (isEditing) {
      setDiary(originalDiary);
      setTitle(originalDiary.title);
      setContent(originalDiary.content);
      setSections(originalDiary.sections || []);
      setSelectedDate(new Date(originalDiary.date));
      setIsEditing(false);
    } else {
      navigate(-1);
    }
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
    newSections.push({ type: "textarea", content: "" });
    setSections(newSections);
  };

  const handleRemoveSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const handleSave = async () => {
    const user = auth.currentUser; // 현재 로그인된 사용자를 가져옵니다
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const updatedDiary = {
      title,
      content,
      sections,
      date: selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }),
      uid: user.uid, // UID를 추가합니다
    };

    if (diaryId) {
      const docRef = doc(db, "Diaries", diaryId);
      await updateDoc(docRef, updatedDiary);
    } else {
      const newDiaryRef = doc(db, "Diaries", `${new Date().toISOString()}`);
      await setDoc(newDiaryRef, updatedDiary);
    }

    setDiary(updatedDiary);
    setOriginalDiary(updatedDiary);
    setIsEditing(false);
    alert("일기가 저장되었습니다.");
  };

  return (
    <div className="dailywrite-detail-container">
      <div className="back-plus">
        <button onClick={handleBack} className="back-button-write">
          뒤로가기
        </button>
        <div className="date-picker-save-container">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy.MM.dd"
            className="date-picker"
          />
          {!isEditing && (
            <button onClick={handleSave} className="save-button">
              저장
            </button>
          )}
          {!isEditing && (
            <button onClick={handleEdit} className="edit-button-d">
              수정
            </button>
          )}
        </div>
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
                {section.type === "divider" ? (
                  <div className="divider-line"></div>
                ) : (
                  <div className="textarea-button-wrapper">
                    <textarea
                      value={section.content}
                      onChange={(e) => handleSectionChange(e.target.value, index, "content")}
                      className="section-content-textarea"
                      placeholder="추가하고 싶은 내용"
                    />
                    <button onClick={() => handleRemoveSection(index)} className="remove-section-button">
                      X
                    </button>
                  </div>
                )}
                {index < sections.length - 1 && sections[index + 1].type === "divider" && (
                  <div className="line-divider"></div>
                )}
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
          <div className="size">
            <h2>{diary?.title || "새 일기"}</h2>
            <div className="line"></div>
            <p>{diary?.content || "내용 없음"}</p>
            <div className="sections">
              {sections.map((section, index) => (
                <div key={index} className="section">
                  {section.type === "divider" ? <div className="divider-line"></div> : <p>{section.content}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DailywriteDetail;
