import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { auth } from "../firebase";

const Todo = () => {
  const [Todo, setTodo] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchTodo = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "TodoTodo"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const TodoList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTodo(TodoList);
      }
    };

    const fetchGalleryItems = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "TodoGallery"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const galleryList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    };

    fetchTodo();
    fetchGalleryItems();
  }, [auth.currentUser]);

  const handleAddNote = async () => {
    if (newNote.trim() !== "") {
      const docRef = await addDoc(collection(db, "TodoTodo"), {
        uid: auth.currentUser.uid,
        text: newNote,
        createdAt: new Date(),
      });
      setTodo([...Todo, { id: docRef.id, text: newNote }]);
      setNewNote("");
    }
  };

  const handleDeleteNote = async (id) => {
    await deleteDoc(doc(db, "TodoTodo", id));
    setTodo(Todo.filter((note) => note.id !== id));
  };

  return (
    <div>
      <h1>Todo Page</h1>

      <div>
        <h2>Todo</h2>
        <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Todo" />
        <button onClick={handleAddNote}>Add</button>
        <ul>
          {Todo.map((note) => (
            <li key={note.id}>
              {note.text} <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Todo;
