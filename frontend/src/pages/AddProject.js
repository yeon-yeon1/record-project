import React, { useState } from "react";
import { storage, db } from "../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./AddProject.css";

const AddProject = ({ onAddProject }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !imageFile) {
      alert("모든 필드를 입력하고 이미지를 선택하세요.");
      return;
    }

    try {
      const storageRef = ref(storage, `projects/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const user = auth.currentUser;
          const docRef = await addDoc(collection(db, "projects"), {
            uid: user.uid,
            title,
            description,
            image: downloadURL,
          });
          onAddProject({ id: docRef.id, title, description, image: downloadURL });
          navigate("/projects");
        }
      );
    } catch (error) {
      console.error("Error adding project", error);
    }
  };

  return (
    <div className="add-project-container">
      <h2>Add Project</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="input-white"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <input className="input-white" type="file" onChange={handleImageChange} accept="image/*" required />
        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
        <button type="submit">Add Project</button>
      </form>
      <button onClick={() => navigate("/projects")}>Back</button>
    </div>
  );
};

export default AddProject;
