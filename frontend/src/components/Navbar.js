import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [pages, setPages] = useState([]);
  const defaultPages = [
    { name: "Projects", path: "projects" },
    { name: "Certifications", path: "certifications" },
    { name: "Dailywrite", path: "dailywrite" },
    { name: "Notes", path: "notes" },
  ];
  const [newPageName, setNewPageName] = useState("");
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [isPlus, setIsPlus] = useState(true);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const iconRef = useRef(null);
  const addButtonRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        const email = user.email;
        const id = email.split("@")[0];
        setUserId(id);
        loadPages(id);
      } else {
        setIsAuthenticated(false);
        setUserId("");
        setPages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
        setShowNewPageInput(false);
        setIsPlus(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setShowMenu((prevShowMenu) => {
      if (!prevShowMenu) {
        setShowNewPageInput(false);
        setIsPlus(true);
      }
      return !prevShowMenu;
    });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("user");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const handleAddPage = (e) => {
    e.stopPropagation();
    setShowNewPageInput((prevShowNewPageInput) => !prevShowNewPageInput);
    setIsPlus((prevIsPlus) => !prevIsPlus);
  };

  const handlePageAdd = () => {
    const pageName = newPageName.trim();
    if (pageName && !pages.find((p) => p.name === pageName)) {
      const updatedPages = [...pages, { name: pageName, template: null }];
      setPages(updatedPages);
      setNewPageName("");
      savePages(userId, updatedPages);
      setShowNewPageInput(false);
      setIsPlus(true);
      setShowMenu(false);
      navigate(`/newpage/${pageName}`);
    }
  };

  const handleDeletePage = (pageToDelete) => {
    const updatedPages = pages.filter((page) => page.name !== pageToDelete.name);
    setPages(updatedPages);
    savePages(userId, updatedPages);
    saveDeletedPage(userId, pageToDelete.name);
    if (window.location.pathname === `/${pageToDelete.name}`) {
      navigate("/");
    }
  };

  const savePages = (userId, pages) => {
    localStorage.setItem(`pages_${userId}`, JSON.stringify(pages));
  };

  const saveDeletedPage = (userId, pageToDelete) => {
    const deletedPages = JSON.parse(localStorage.getItem(`deleted_pages_${userId}`)) || [];
    if (!deletedPages.includes(pageToDelete)) {
      deletedPages.push(pageToDelete);
      localStorage.setItem(`deleted_pages_${userId}`, JSON.stringify(deletedPages));
    }
  };

  const loadPages = (userId) => {
    const savedPages = JSON.parse(localStorage.getItem(`pages_${userId}`)) || [];
    const deletedPages = JSON.parse(localStorage.getItem(`deleted_pages_${userId}`)) || [];
    const filteredDefaultPages = defaultPages.filter((page) => !deletedPages.includes(page.path));
    const allPages = [
      ...new Set([...filteredDefaultPages.map((p) => ({ name: p.path, template: null })), ...savedPages]),
    ];
    setPages(allPages);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-icon" onClick={toggleMenu} ref={iconRef}>
          <FaBars />
        </div>
      </div>
      <div className="navbar-right">
        {isAuthenticated && <div className="navbar-user-id">{userId}</div>}
        {isAuthenticated && (
          <div className="logout-button">
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
          </div>
        )}
      </div>
      <div className={`navbar-menu ${showMenu ? "show" : ""}`} ref={menuRef}>
        <ul>
          <li className="link">
            <Link to="/" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <>
              {defaultPages
                .filter((page) => pages.find((p) => p.name === page.path))
                .map((page, index) => (
                  <li className="link" key={index}>
                    <div className="link-content">
                      <Link to={`/${page.path}`} onClick={toggleMenu}>
                        {page.name}
                      </Link>
                      <FaTrash onClick={() => handleDeletePage(page)} className="delete-icon" />
                    </div>
                  </li>
                ))}
            </>
          )}
          {pages
            .filter((page) => !defaultPages.find((p) => p.path === page.name))
            .map((page, index) => (
              <li className="link" key={index}>
                <div className="link-content">
                  <Link to={`/newpage/${page.name}`} onClick={toggleMenu}>
                    {page.name}
                  </Link>
                  <FaTrash onClick={() => handleDeletePage(page)} className="delete-icon" />
                </div>
              </li>
            ))}
          {!isAuthenticated && (
            <>
              <li className="link">
                <Link to="/login" onClick={toggleMenu}>
                  Login
                </Link>
              </li>
              <li className="link">
                <Link to="/signup" onClick={toggleMenu}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
          {showMenu && isAuthenticated && showNewPageInput && (
            <div className="new-page-input" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="새 페이지 이름"
              />
              <button onClick={handlePageAdd}>추가</button>
            </div>
          )}
          {isAuthenticated && (
            <div className="navbar-add-icon" onClick={handleAddPage} ref={addButtonRef}>
              {isPlus ? <FaPlus className="icon-animation" /> : <FaMinus className="icon-animation" />}
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
