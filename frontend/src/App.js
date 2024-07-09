import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Todo from "./pages/Todo"; // DigitalSoftwareEngineering를 To_Do로 변경
import Gallery from "./pages/Gallery"; // Chemistry를 Gallery로 변경
import Notes from "./pages/Notes"; // Nursing을 Notes로 변경
import Login from "./pages/Login";
import SignUp from "./pages/Signup"; // Signup을 SignUp으로 변경
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <div>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/projects" element={<Projects user={user} />} />
          <Route path="/Todo" element={<Todo user={user} />} /> {/* 경로 수정 */}
          <Route path="/gallery" element={<Gallery user={user} />} /> {/* 경로 수정 */}
          <Route path="/notes" element={<Notes user={user} />} /> {/* 경로 수정 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} /> {/* 경로 수정 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
