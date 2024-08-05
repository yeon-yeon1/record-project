import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Notes.css";

const times = [
  "09:00-09:15",
  "09:15-09:30",
  "09:30-09:45",
  "09:45-10:00",
  "10:00-10:15",
  "10:15-10:30",
  "10:30-10:45",
  "10:45-11:00",
  "11:00-11:15",
  "11:15-11:30",
  "11:30-11:45",
  "11:45-12:00",
  "12:00-12:15",
  "12:15-12:30",
  "12:30-12:45",
  "12:45-13:00",
  "13:00-13:15",
  "13:15-13:30",
  "13:30-13:45",
  "13:45-14:00",
  "14:00-14:15",
  "14:15-14:30",
  "14:30-14:45",
  "14:45-15:00",
  "15:00-15:15",
  "15:15-15:30",
  "15:30-15:45",
  "15:45-16:00",
  "16:00-16:15",
  "16:15-16:30",
  "16:30-16:45",
  "16:45-17:00",
  "17:00-17:15",
  "17:15-17:30",
  "17:30-17:45",
  "17:45-18:00",
  "18:00-18:15",
  "18:15-18:30",
  "18:30-18:45",
  "18:45-19:00",
];

const days = ["월", "화", "수", "목", "금", "토", "일"];

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [galleryItems, setGalleryItems] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [boardPosts, setBoardPosts] = useState({});
  const navigate = useNavigate();

  const fetchBoardPosts = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, "Posts"), where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const postsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const postsBySubject = {};
      postsList.forEach((post) => {
        if (!postsBySubject[post.subject]) {
          postsBySubject[post.subject] = [];
        }
        postsBySubject[post.subject].push(post);
      });

      Object.keys(postsBySubject).forEach((subject) => {
        postsBySubject[subject].sort((a, b) => a.title.localeCompare(b.title, "ko"));
      });

      setBoardPosts(postsBySubject);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "NotesNotes"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const notesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        notesList.sort((a, b) => a.createdAt - b.createdAt);
        setNotes(notesList);
      }
    };

    const fetchGalleryItems = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "NotesGallery"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const galleryList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGalleryItems(galleryList);
      }
    };

    const fetchTimetable = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Timetable"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const timetableList = querySnapshot.docs.map((doc) => doc.data().schedule);
        const mergedSchedule = Object.assign({}, ...timetableList);
        setTimetable(mergedSchedule);

        for (const key in mergedSchedule) {
          if (mergedSchedule[key]?.subject) {
            const subject = mergedSchedule[key].subject;
            await addPostForSubject(subject);
          }
        }
      }
    };

    const fetchSubjects = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Subjects"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const subjectsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        subjectsList.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
        setSubjects(subjectsList);
      }
    };

    fetchNotes();
    fetchGalleryItems();
    fetchTimetable();
    fetchSubjects();
    fetchBoardPosts();
  }, [auth.currentUser]);

  const addPostForSubject = async (subject) => {
    const q = query(collection(db, "Posts"), where("subject", "==", subject), where("uid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await addDoc(collection(db, "Posts"), {
        uid: auth.currentUser.uid,
        subject,
        title: `${subject} 게시판`,
        content: `게시판 내용: ${subject} 게시판`,
        createdAt: new Date(),
        fromDetail: false,
      });
      fetchBoardPosts();
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim() !== "") {
      const docRef = await addDoc(collection(db, "NotesNotes"), {
        uid: auth.currentUser.uid,
        text: newNote,
        createdAt: new Date(),
      });
      setNotes([...notes, { id: docRef.id, text: newNote, createdAt: new Date() }]);
      setNewNote("");
      setNotes((prevNotes) => [...prevNotes].sort((a, b) => a.createdAt - b.createdAt));
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "NotesNotes", id));
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleDeletePost = async (subject, postId) => {
    try {
      await deleteDoc(doc(db, "Posts", postId));
      setBoardPosts((prevPosts) => ({
        ...prevPosts,
        [subject]: prevPosts[subject].filter((post) => post.id !== postId),
      }));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleTimetableClick = () => {
    navigate("/timetable");
  };

  const handleSubjectClick = async (subject) => {
    if (subject) {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await setDoc(userRef, { selectedSubject: subject }, { merge: true });

      const encodedSubject = encodeURIComponent("과목 목록 게시판");
      navigate(`/board/${encodedSubject}`);
    }
  };

  const handleBoardDetailClick = (postId, subject) => {
    navigate(`/board/${subject}/${postId}`);
  };

  const uniquePostTitles = new Set();

  return (
    <div className="notes-container">
      <div className="left-section">
        <div className="timetable" onClick={handleTimetableClick}>
          <h2 className="h2time">Timetable</h2>
          <table>
            <thead>
              <tr>
                <th>시간</th>
                {days.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: times.length / 4 }).map((_, hourIndex) => {
                const startTimeIndex = hourIndex * 4;
                const timeRange = `${times[startTimeIndex].split("-")[0]}-${
                  times[startTimeIndex + 3]?.split("-")[1] || "00:00"
                }`;
                return (
                  <tr key={hourIndex}>
                    <td>{timeRange}</td>
                    {days.map((day) => (
                      <td key={`${day}-${hourIndex}`} style={{ padding: 0 }}>
                        <div style={{ display: "grid", gridTemplateRows: "repeat(4, 1fr)", height: "100%" }}>
                          {times.slice(startTimeIndex, startTimeIndex + 4).map((time) => (
                            <div
                              key={`${day}-${time}`}
                              style={{
                                backgroundColor: timetable[`${day}-${time}`]?.color || "",
                                color: timetable[`${day}-${time}`] ? "#fff" : "",
                              }}
                              onClick={() => handleSubjectClick(timetable[`${day}-${time}`]?.subject)}
                            >
                              {timetable[`${day}-${time}`]?.subject || ""}
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="right-section">
        <div className="todo-list">
          <h2 className="todoh2">TO DO LIST</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Task</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => (
                <tr key={note.id}>
                  <td>{index + 1}</td>
                  <td>{note.text}</td>
                  <td className="center">
                    <button className="delete-button-n" onClick={() => handleDeleteNote(note.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>{notes.length + 1}</td>
                <td>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your task"
                  />
                </td>
                <td className="center">
                  <button className="delete-button-a" onClick={handleAddNote}>
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="post-list">
          <div className="subject-list">
            <h2 className="h2sub" onClick={() => handleSubjectClick("과목 목록")}>
              과목 목록
            </h2>
            <ul>
              {subjects.map((subject) => (
                <li key={subject.id} onClick={() => handleSubjectClick(subject.subject)}>
                  {subject.subject}
                </li>
              ))}
            </ul>
            <table>
              <thead>
                <tr>
                  <th>제목</th>
                  <th>작성일</th>
                  <th>제거</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(boardPosts)
                  .filter((subject) => subject !== "undefined")
                  .map((subject, index) => (
                    <React.Fragment key={index}>
                      {boardPosts[subject].map((post, idx) => {
                        if (uniquePostTitles.has(post.title)) {
                          return null;
                        }
                        uniquePostTitles.add(post.title);
                        return (
                          <tr key={post.id}>
                            <td onClick={() => handleBoardDetailClick(post.id, post.subject)}>{post.title}</td>
                            <td>{new Date(post.createdAt.toDate()).toLocaleDateString()}</td>
                            <td>
                              <button
                                className="delete-button-n"
                                onClick={() => handleDeletePost(post.subject, post.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
