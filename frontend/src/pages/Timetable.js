import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { SketchPicker } from "react-color";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, setDoc, doc, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./Timetable.css";

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

const Timetable = () => {
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [subject, setSubject] = useState("");
  const [color, setColor] = useState("#fff");
  const [schedule, setSchedule] = useState({});
  const [dragging, setDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const colorPickerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Timetable"), where("uid", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const savedSchedule = {};
        querySnapshot.forEach((doc) => {
          Object.assign(savedSchedule, doc.data().schedule);
        });
        setSchedule(savedSchedule);
      }
    };

    fetchSchedule();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setColorPickerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = async () => {
    if (selectedTimes.length && selectedDay && subject) {
      const newSchedule = { ...schedule };
      selectedTimes.forEach((time) => {
        const key = `${selectedDay}-${time}`;
        newSchedule[key] = { subject, color };
      });
      setSchedule(newSchedule);
      setSelectedTimes([]);
      setSelectedDay("");
      setSubject("");
      setColor("#fff");

      if (auth.currentUser) {
        await setDoc(doc(db, "Timetable", auth.currentUser.uid), {
          uid: auth.currentUser.uid,
          schedule: newSchedule,
        });

        await addDoc(collection(db, "Posts"), {
          uid: auth.currentUser.uid,
          subject,
          title: `${subject} 게시판`,
          content: "",
          createdAt: new Date(),
        });
      }
    }
  };

  const handleFinalize = async () => {
    if (auth.currentUser) {
      await setDoc(doc(db, "Timetable", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        schedule,
      });
    }
    navigate("/notes");
  };

  const getCellStyle = (day, time) => {
    const key = `${day}-${time}`;
    if (schedule[key]) {
      return { backgroundColor: schedule[key].color, color: "#fff" };
    }
    return {};
  };

  const handleMouseDown = (day, time) => {
    setDragging(true);
    setStartCell({ day, time });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setStartCell(null);
  };

  const handleMouseOver = (day, time) => {
    if (dragging && startCell) {
      const startTimeIndex = times.indexOf(startCell.time);
      const endTimeIndex = times.indexOf(time);
      const selectedTimes = times.slice(
        Math.min(startTimeIndex, endTimeIndex),
        Math.max(startTimeIndex, endTimeIndex) + 1
      );

      selectedTimes.forEach((time) => {
        const key = `${startCell.day}-${time}`;
        schedule[key] = { subject, color };
      });
      setSchedule({ ...schedule });
    }
  };

  const toggleColorPicker = () => {
    setColorPickerVisible(!colorPickerVisible);
  };

  return (
    <div className="timetable-container">
      <h1 className="timeline">시간표</h1>
      <div className="controls">
        <Select
          className="custom-select"
          options={days.map((day) => ({ value: day, label: day }))}
          onChange={(option) => setSelectedDay(option.value)}
          placeholder="요일 선택"
          value={selectedDay ? { value: selectedDay, label: selectedDay } : null}
        />
        <Select
          className="custom-select"
          isMulti
          options={times.map((time) => ({ value: time, label: time }))}
          onChange={(option) => setSelectedTimes(option.map((opt) => opt.value))}
          placeholder="시간 선택"
          value={selectedTimes.map((time) => ({ value: time, label: time }))}
          menuPlacement="auto"
          styles={{
            menu: (provided) => ({
              ...provided,
              maxHeight: "200px",
            }),
            menuList: (provided) => ({
              ...provided,
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }),
          }}
        />
        <input
          className="custom-input"
          type="text"
          placeholder="과목명"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <button className="custom-button" onClick={toggleColorPicker}>
          색 선택
        </button>
        {colorPickerVisible && (
          <div ref={colorPickerRef} style={{ position: "absolute", zIndex: 2 }}>
            <SketchPicker color={color} onChangeComplete={(color) => setColor(color.hex)} />
          </div>
        )}
        <button className="custom-button" onClick={handleSave}>
          저장
        </button>
        <button className="custom-button" onClick={handleFinalize}>
          타임테이블 저장
        </button>
      </div>
      <div className="timetable-wrapper">
        <table className="timetable" onMouseUp={handleMouseUp}>
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
                            style={getCellStyle(day, time)}
                            onMouseDown={() => handleMouseDown(day, time)}
                            onMouseOver={() => handleMouseOver(day, time)}
                          >
                            {schedule[`${day}-${time}`]?.subject || ""}
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
  );
};

export default Timetable;
