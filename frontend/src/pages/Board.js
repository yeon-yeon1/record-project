import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, addDoc } from "firebase/firestore";
import "./Board.css";

const Board = () => {
  const [posts, setPosts] = useState({});
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
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

      // 정렬 로직 추가: 한글 제목 순서로 정렬
      const sortedPostsBySubject = Object.keys(postsBySubject)
        .sort((a, b) => a.localeCompare(b, "ko"))
        .reduce((acc, subject) => {
          acc[subject] = postsBySubject[subject].sort((a, b) => a.createdAt.seconds - b.createdAt.seconds); // 생성순으로 정렬
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
        }
      }
    };

    fetchSelectedSubject();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedSubject]);

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

    // Add new board to Firestore
    await addDoc(collection(db, "Posts"), {
      uid: auth.currentUser.uid,
      subject: newBoardTitle,
      title: `${newBoardTitle} 게시판`,
      content: `게시판 내용: ${newBoardTitle} 게시판`,
      createdAt: new Date(),
      fromDetail: false,
    });

    // Clear input and hide input field
    setNewBoardTitle("");
    setShowNewBoardInput(false);

    // Refresh posts
    fetchPosts();
  };

  const handleCancel = () => {
    setNewBoardTitle("");
    setShowNewBoardInput(false);
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
                {posts[subject]
                  .sort((a, b) => a.title.localeCompare(b.title, "ko")) // 한글 제목 순서로 정렬
                  .map((post) => {
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
