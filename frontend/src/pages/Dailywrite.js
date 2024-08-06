import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { format } from "date-fns";
import "./Dailywrite.css";

const Dailywrite = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [diaries, setDiaries] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "Diaries"), where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const diariesData = [];
        querySnapshot.forEach((doc) => {
          diariesData.push({ id: doc.id, ...doc.data() });
        });
        setDiaries(diariesData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const month = date.getMonth();
      const currentMonth = selectedDate.getMonth();
      if (month !== currentMonth) {
        return "different-month";
      }
    }
    return null;
  };

  const formatDate = (date) => {
    return format(date, "yyyy.MM.dd");
  };

  const handleDateChange = async (date, diaryId) => {
    const formattedDate = format(date, "yyyy.MM.dd");
    const docRef = doc(db, "Diaries", diaryId);
    await updateDoc(docRef, {
      date: formattedDate,
    });
  };

  const handleDelete = async (diaryId) => {
    if (window.confirm("정말 이 일기를 삭제하시겠습니까?")) {
      const docRef = doc(db, "Diaries", diaryId);
      await deleteDoc(docRef);
      setDiaries(diaries.filter((diary) => diary.id !== diaryId));
    }
  };

  const filteredDiaries = diaries.filter((diary) => diary.date === formatDate(selectedDate));

  return (
    <div className="container">
      <div className="calendar-section">
        <h2 className="h2c">Calendar</h2>
        <Calendar
          className="react-calendar"
          defaultValue={today}
          tileClassName={tileClassName}
          onChange={(date) => setSelectedDate(date)}
        />
      </div>
      <div className="diary-section">
        <div className="back-plus">
          <h2>Record</h2>
          <button className="add-button-d" onClick={() => navigate("/dailywrite-detail")}>
            +
          </button>
        </div>
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="table-cell">제목</TableCell>
                <TableCell className="table-cell">작성일</TableCell>
                <TableCell className="table-cell">제거</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDiaries.map((diary) => (
                <TableRow
                  key={diary.id}
                  onClick={() => navigate(`/dailywrite-detail/${diary.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>{diary.title}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>{diary.date}</TableCell>
                  <TableCell>
                    <button
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(diary.id);
                      }}
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default Dailywrite;
