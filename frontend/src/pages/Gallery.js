import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { auth } from "../firebase";

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ image: "", link: "", note: "" });

  useEffect(() => {
    const fetchItems = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "GalleryItems"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const itemsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setItems(itemsList);
      }
    };

    fetchItems();
  }, [auth.currentUser]);

  const handleAddItem = async () => {
    if (newItem.image.trim() !== "" || newItem.link.trim() !== "" || newItem.note.trim() !== "") {
      const docRef = await addDoc(collection(db, "GalleryItems"), {
        uid: auth.currentUser.uid,
        image: newItem.image,
        link: newItem.link,
        note: newItem.note,
        createdAt: new Date(),
      });
      setItems([...items, { id: docRef.id, ...newItem }]);
      setNewItem({ image: "", link: "", note: "" });
    }
  };

  const handleDeleteItem = async (id) => {
    await deleteDoc(doc(db, "GalleryItems", id));
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h1>Gallery Page</h1>
      <div>
        <h2>Gallery</h2>
        <input
          type="text"
          value={newItem.image}
          onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
          placeholder="Image URL"
        />
        <input
          type="text"
          value={newItem.link}
          onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
          placeholder="Link"
        />
        <input
          type="text"
          value={newItem.note}
          onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
          placeholder="Note"
        />
        <button onClick={handleAddItem}>Add</button>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {items.map((item) => (
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
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
