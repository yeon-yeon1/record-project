import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import "./Certifications.css";

const Certifications = ({ user }) => {
  const [certificates, setCertificates] = useState([]);
  const [localCertificates, setLocalCertificates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchCertificates = async () => {
        const q = query(collection(db, "certifications"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const certList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // 클라이언트 측에서 타임스탬프 필드로 정렬
        certList.sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
        setCertificates(certList);
        const localCertMap = certList.reduce((acc, cert) => {
          acc[cert.id] = cert.name;
          return acc;
        }, {});
        setLocalCertificates(localCertMap);
      };
      fetchCertificates();
    }
  }, [user]);

  const addCertificate = async () => {
    if (user) {
      const newCert = { name: `Certificate ${certificates.length + 1}`, uid: user.uid, timestamp: serverTimestamp() };
      const docRef = await addDoc(collection(db, "certifications"), newCert);
      const newCertWithId = { ...newCert, id: docRef.id, timestamp: new Date() }; // 로컬 상태 업데이트 시 서버 타임스탬프 대신 현재 시간을 사용
      const updatedCertificates = [...certificates, newCertWithId];
      // 클라이언트 측에서 타임스탬프 필드로 정렬
      updatedCertificates.sort((a, b) => a.timestamp - b.timestamp);
      setCertificates(updatedCertificates);
      setLocalCertificates({
        ...localCertificates,
        [docRef.id]: newCert.name,
      });
    }
  };

  const updateCertificate = async (id, name) => {
    const certDoc = doc(db, "certifications", id);
    await updateDoc(certDoc, { name });
    setCertificates(certificates.map((cert) => (cert.id === id ? { ...cert, name } : cert)));
  };

  const handleInputChange = (id, value) => {
    setLocalCertificates({
      ...localCertificates,
      [id]: value,
    });
  };

  const handleInputBlur = (id) => {
    updateCertificate(id, localCertificates[id]);
  };

  const deleteCertificate = async (id) => {
    if (window.confirm("정말 이 자격증을 삭제하시겠습니까?")) {
      const certDoc = doc(db, "certifications", id);
      await deleteDoc(certDoc);
      setCertificates(certificates.filter((cert) => cert.id !== id));
      const updatedLocalCertificates = { ...localCertificates };
      delete updatedLocalCertificates[id];
      setLocalCertificates(updatedLocalCertificates);
    }
  };

  return (
    <section className="certifications">
      <h2 className="certification">자격증 및 기술</h2>
      <div className="line"></div>
      <div className="cert-grid">
        {certificates.map((cert) => (
          <div className="cert-item" key={cert.id} onClick={() => navigate(`/certifications/${cert.id}`)}>
            <input
              type="text"
              value={localCertificates[cert.id] || ""}
              onChange={(e) => handleInputChange(cert.id, e.target.value)}
              onBlur={() => handleInputBlur(cert.id)}
              className="cert-input"
              readOnly
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCertificate(cert.id);
              }}
              className="delete-cert-btn"
            >
              -
            </button>
          </div>
        ))}
        <button className="add-cert-btn" onClick={addCertificate}>
          +
        </button>
      </div>
    </section>
  );
};

export default Certifications;
