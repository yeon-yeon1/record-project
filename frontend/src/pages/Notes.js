import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { auth } from "../firebase";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [galleryItems, setGalleryItems] = useState([]);
  const [newGalleryItem, setNewGalleryItem] = useState({ image: "", link: "", note: "" });

  useEffect(() => {
    const fetchNotes = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "NotesNotes"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const notesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

    fetchNotes();
    fetchGalleryItems();
  }, [auth.currentUser]);

  const handleAddNote = async () => {
    if (newNote.trim() !== "") {
      const docRef = await addDoc(collection(db, "NotesNotes"), {
        uid: auth.currentUser.uid,
        text: newNote,
        createdAt: new Date(),
      });
      setNotes([...notes, { id: docRef.id, text: newNote }]);
      setNewNote("");
    }
  };

  const handleDeleteNote = async (id) => {
    await deleteDoc(doc(db, "NotesNotes", id));
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleAddGalleryItem = async () => {
    if (newGalleryItem.image.trim() !== "" || newGalleryItem.link.trim() !== "" || newGalleryItem.note.trim() !== "") {
      const docRef = await addDoc(collection(db, "NotesGallery"), {
        uid: auth.currentUser.uid,
        image: newGalleryItem.image,
        link: newGalleryItem.link,
        note: newGalleryItem.note,
        createdAt: new Date(),
      });
      setGalleryItems([...galleryItems, { id: docRef.id, ...newGalleryItem }]);
      setNewGalleryItem({ image: "", link: "", note: "" });
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    await deleteDoc(doc(db, "NotesGallery", id));
    setGalleryItems(galleryItems.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h1>Notes Page</h1>

      <div>
        <h2>Notes</h2>
        <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a new note" />
        <button onClick={handleAddNote}>Add</button>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {note.text} <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Gallery</h2>
        <input
          type="text"
          value={newGalleryItem.image}
          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, image: e.target.value })}
          placeholder="Image URL"
        />
        <input
          type="text"
          value={newGalleryItem.link}
          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, link: e.target.value })}
          placeholder="Link"
        />
        <input
          type="text"
          value={newGalleryItem.note}
          onChange={(e) => setNewGalleryItem({ ...newGalleryItem, note: e.target.value })}
          placeholder="Note"
        />
        <button onClick={handleAddGalleryItem}>Add</button>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {galleryItems.map((item) => (
            <div key={item.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
              {item.image && <img src={item.image} alt="Gallery" style={{ width: "100px", height: "100px" }} />}
              {item.link && (
                <p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </p>
              )}
              {item.note && <p>{item.note}</p>}
              <button onClick={() => handleDeleteGalleryItem(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notes;
