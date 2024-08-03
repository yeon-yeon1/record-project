import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import "./CertificationDetail.css";

const CertificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [comment, setComment] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchCertificate = async () => {
      const docRef = doc(db, "certifications", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCertificate(data);
        setName(data.name || "");
        setImageUrl(data.imageUrl || "");
        setComment(data.comment || "");
      }
    };
    fetchCertificate();
  }, [id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const storageRef = ref(storage, `certifications/${id}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Image upload failed:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
        }
      );
    }
  };

  const handleImageRemove = async () => {
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl);
      try {
        await deleteObject(imageRef);
        setImageUrl("");
        alert("이미지가 삭제되었습니다.");
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
  };

  const handleUpdate = async () => {
    const docRef = doc(db, "certifications", id);
    await updateDoc(docRef, {
      name,
      imageUrl,
      comment,
    });
    alert("자격증 정보가 업데이트되었습니다.");
    navigate("/certifications"); // 저장 후 Certifications 페이지로 이동
  };

  if (!certificate) return <div>Loading...</div>;

  return (
    <div className="certification-detail">
      <h2>Detail</h2>
      <div className="line"></div>
      <div className="form-group">
        <label>자격증 이름</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>증명서 이미지</label>
        <input
          type="file"
          onChange={handleImageChange}
          className="image-upload-input"
          style={{ display: "none" }}
          id="imageUpload"
        />
        <label htmlFor="imageUpload" className="image-upload-label">
          {imageUrl ? <img src={imageUrl} alt={name} className="certification-image" /> : "이미지를 삽입하세요"}
        </label>
        {uploadProgress > 0 && (
          <progress value={uploadProgress} max="100">
            {uploadProgress}%
          </progress>
        )}
        {imageUrl && (
          <button onClick={handleImageRemove} className="remove-image-button-small">
            이미지 제거
          </button>
        )}
      </div>
      <div className="form-group">
        <label>코멘트</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <button onClick={handleUpdate}>Update</button>
      <button onClick={() => navigate("/certifications")}>Back</button>
    </div>
  );
};

export default CertificationDetail;
