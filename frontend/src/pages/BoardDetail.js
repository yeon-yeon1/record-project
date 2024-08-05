import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import "./BoardDetail.css";

const BoardDetail = () => {
  const { subject, boardId } = useParams();
  const { state } = useLocation();
  const [postTitle, setPostTitle] = useState(state ? state.postTitle : "");

  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!postTitle) {
      setPostTitle(subject + " 게시판");
    }
  }, [postTitle, subject]);

  const fetchPosts = async () => {
    if (auth.currentUser) {
      if (subject && boardId) {
        const q = query(collection(db, "Posts"), where("boardId", "==", boardId), where("fromDetail", "==", true));
        const querySnapshot = await getDocs(q);
        const postsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        postsList.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        setPosts(postsList);
      } else {
        console.error("Invalid subject or boardId");
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [subject, boardId]);

  const handleDeletePost = async (postId) => {
    await deleteDoc(doc(db, "Posts", postId));
    fetchPosts();
  };

  const handleBack = () => {
    navigate(`/board/${subject}`);
  };

  const handlePostClick = (postId) => {
    navigate(`/board/${subject}/${boardId}/post/${postId}`, { state: { postTitle } });
  };

  const handleCreatePost = () => {
    navigate(`/board/${subject}/${boardId}/write`, { state: { postTitle } });
  };

  return (
    <div className="board-detail-container">
      <h2>{postTitle}</h2>
      <div className="line"></div>
      <div className="back-plus">
        <button className="back-button-board" onClick={handleBack}>
          뒤로가기
        </button>
        <button className="create-button" onClick={handleCreatePost}>
          글 작성
        </button>
      </div>
      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post" onClick={() => handlePostClick(post.id)}>
            <div className="post-header">
              <h3>{post.title}</h3>
              <button
                className="delete-button-board"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePost(post.id);
                }}
              >
                -
              </button>
            </div>
            <p>{post.content.substring(0, 100)}...</p>
            <span>{new Date(post.createdAt.toDate()).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardDetail;
