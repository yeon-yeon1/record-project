import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Certifications from "./pages/Certifications";
import CertificationDetail from "./pages/CertificationDetail";
import Notes from "./pages/Notes";
import Timetable from "./pages/Timetable";
import Board from "./pages/Board";
import BoardDetail from "./pages/BoardDetail";
import BoardWrite from "./pages/BoardWrite";
import BoardPostDetail from "./pages/BoardPostDetail";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import AddProject from "./pages/AddProject";
import ProjectDetail from "./pages/ProjectDetail";
import Dailywrite from "./pages/Dailywrite";
import DailywriteDetail from "./pages/DailywriteDetail";
import Navbar from "./components/Navbar";
import NewPage from "./pages/NewPage";
import { auth } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchUserData(user.uid);
      } else {
        resetUserData();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const projectsCollection = collection(db, "projects");
      const q = query(projectsCollection, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      const projectsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsList);
      loadPages(uid);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const resetUserData = () => {
    setUser(null);
    setProjects([]);
    setPages([]);
  };

  const handleAddProject = (project) => {
    setProjects((prevProjects) => [...prevProjects, project]);
  };

  const loadPages = (userId) => {
    const savedPages = JSON.parse(localStorage.getItem(`pages_${userId}`)) || [];
    setPages(savedPages);
  };

  const characterImageUrl = "your-character-image-url"; // 실제 URL로 교체

  return (
    <Router>
      <div>
        <Navbar user={user} pages={pages} setPages={setPages} />
        <Routes>
          <Route path="/" element={<Home user={user} characterImageUrl={characterImageUrl} />} />
          <Route path="/projects" element={<Projects user={user} />} />
          <Route path="/certifications" element={<Certifications user={user} />} />
          <Route path="/certifications/:id" element={<CertificationDetail />} />
          <Route path="/dailywrite" element={<Dailywrite user={user} />} />
          <Route path="/dailywrite-detail/:diaryId?" element={<DailywriteDetail />} />
          <Route path="/notes" element={<Notes user={user} />} />
          <Route path="/timetable" element={<Timetable user={user} />} />
          <Route path="/board" element={<Board />} />
          <Route path="/board/:subject" element={<Board />} />
          <Route path="/board/:subject/:boardId" element={<BoardDetail />} />
          <Route path="/board/:subject/:boardId/write" element={<BoardWrite />} />
          <Route path="/board/:subject/:boardId/post/:postId" element={<BoardPostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/add-project" element={<AddProject onAddProject={handleAddProject} />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/newpage/:pageName" element={<NewPage pages={pages} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
