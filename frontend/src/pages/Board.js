import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, addDoc } from "firebase/firestore";
import Select from "react-select";
import "./Board.css";

const sortOptions = [
  { value: "title", label: "제목 순" },
  { value: "createdAt", label: "생성일 순" },
];

const Board = () => {
  const [posts, setPosts] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(localStorage.getItem("selectedSubject") || "");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [sortCriteria, setSortCriteria] = useState(JSON.parse(localStorage.getItem("sortCriteria")) || sortOptions[0]);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    if (auth.currentUser && selectedSubject) {
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

      const sortedPostsBySubject = Object.keys(postsBySubject)
        .sort((a, b) => a.localeCompare(b, "ko"))
        .reduce((acc, subject) => {
          acc[subject] = sortPosts(postsBySubject[subject]);
          return acc;
        }, {});

      setPosts(sortedPostsBySubject);
    }
  };

  useEffect(() => {
    const fetchSelectedSubject = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "Users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setSelectedSubject(userDoc.data().selectedSubject);
          localStorage.setItem("selectedSubject", userDoc.data().selectedSubject);
        }
      }
    };

    fetchSelectedSubject();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedSubject, sortCriteria]);

  const handleDeletePost = async (subject, postId) => {
    await deleteDoc(doc(db, "Posts", postId));
    fetchPosts();
  };

  const handleBack = () => {
    navigate("/notes");
  };

  const handlePostClick = (postId, postTitle) => {
    navigate(`/board/${selectedSubject}/${postId}`, { state: { postTitle } });
  };

  const handleAddBoard = async () => {
    if (newBoardTitle.trim() === "") {
      alert("게시판 제목을 입력하세요.");
      return;
    }

    await addDoc(collection(db, "Posts"), {
      uid: auth.currentUser.uid,
      subject: newBoardTitle,
      title: `${newBoardTitle} 게시판`,
      content: `게시판 내용: ${newBoardTitle} 게시판`,
      createdAt: new Date(),
      fromDetail: false,
    });

    setNewBoardTitle("");
    setShowNewBoardInput(false);

    fetchPosts();
  };

  const handleCancel = () => {
    setNewBoardTitle("");
    setShowNewBoardInput(false);
  };

  const handleSortChange = (selectedOption) => {
    setSortCriteria(selectedOption);
    localStorage.setItem("sortCriteria", JSON.stringify(selectedOption));
  };

  const sortPosts = (posts) => {
    return posts.sort((a, b) => {
      if (sortCriteria.value === "title") {
        return a.title.localeCompare(b.title, "ko");
      } else if (sortCriteria.value === "createdAt") {
        return new Date(a.createdAt.toDate()) - new Date(b.createdAt.toDate());
      }
      return 0;
    });
  };

  return (
    <div className="board-container">
      <h2>{selectedSubject} 게시판</h2>
      <div className="line"></div>
      <div className="back-plus">
        <button className="back-button-board" onClick={handleBack}>
          뒤로가기
        </button>
        {!showNewBoardInput && (
          <button className="add-board-button" onClick={() => setShowNewBoardInput(true)}>
            +
          </button>
        )}
      </div>
      {showNewBoardInput && (
        <div className="new-board-input">
          <input
            className="new-board"
            type="text"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="게시판 제목을 입력하세요"
          />
          <button className="new-board-btn" onClick={handleAddBoard}>
            저장
          </button>
          <button className="new-board-btn" onClick={handleCancel}>
            취소
          </button>
        </div>
      )}
      <div className="posts">
        {Object.keys(posts)
          .filter((subject) => subject !== "undefined")
          .map((subject, index) => {
            const uniquePostTitles = new Set();
            return (
              <div key={index}>
                {posts[subject].map((post) => {
                  if (!uniquePostTitles.has(post.title)) {
                    uniquePostTitles.add(post.title);
                    return (
                      <div key={post.id} className="post" onClick={() => handlePostClick(post.id, post.title)}>
                        <div className="post-header">
                          <h3>{post.title}</h3>
                          <button
                            className="delete-button-board"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post.subject, post.id);
                            }}
                          >
                            -
                          </button>
                        </div>
                        <span>{new Date(post.createdAt.toDate()).toLocaleString()}</span>
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Board;
