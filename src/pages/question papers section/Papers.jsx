import React, { useState, useEffect } from "react";
import "./Papers.css";
import Card from "./../Cards/Card.jsx";
import Toast from "../Toast/Toast.jsx";

function Papers() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Metadata for courses, branches, and semesters
  const [courseMetadata, setCourseMetadata] = useState(null);

  // Selection States
  const [course, setCourse] = useState("BTech"); // Default root
  const [branch, setBranch] = useState(() => sessionStorage.getItem("saved_branch") || "");
  const [semester, setSemester] = useState(() => sessionStorage.getItem("saved_semester") || "");
  
  const [subjectDetails, setSubjectDetails] = useState(() => {
    const savedSubjects = sessionStorage.getItem("saved_subjects");
    return savedSubjects ? JSON.parse(savedSubjects) : [
      { name: "Mathematics", code: "MA1L001", materials_available: "0" },
      { name: "Chemistry", code: "CY1L001", materials_available: "0" },
      { name: "English", code: "HS1L002", materials_available: "0" },
      { name: "Electrical Technology", code: "EE1L001", materials_available: "0" }
    ];
  });

  // Fetch all metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch("https://synergic-backend.onrender.com/course-metadata");
        const data = await response.json();
        setCourseMetadata(data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  const handleToggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const handleSelect = (setter, value) => {
    setter(value);
    setOpenDropdown(null);
  };

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    setBranch(""); // Reset to avoid cross-course branch errors
    setSemester("");
  };

  const handleFindClick = async () => {
    if (!branch || !semester) {
      setToast({ type: "error", message: "Please select both branch and semester." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://synergic-backend.onrender.com/subjects/${course}/${branch}/${semester}`);
      const data = await response.json();
      
      if (data.success) {
        setSubjectDetails(data.subjects);
        sessionStorage.setItem("saved_branch", branch);
        sessionStorage.setItem("saved_semester", semester);
        sessionStorage.setItem("saved_subjects", JSON.stringify(data.subjects));
      } else {
        throw new Error("No subjects found");
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch subjects." });
      setSubjectDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const currentBranches = courseMetadata?.[course]?.branches || [];
  const currentSemesters = courseMetadata?.[course]?.semesters || [];

  return (
    <div>
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="NavDrop">
        {/* Vertical Grouping for Course Toggle and Selects */}
        <div className="SelectionGroup">
          
          {/* COURSE TOGGLE */}
          <div className="CourseToggle">
            {courseMetadata && Object.keys(courseMetadata).map((c) => (
              <button 
                key={c}
                className={`course_btn ${course === c ? "active" : ""}`}
                onClick={() => handleCourseChange(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* BRANCH & SEMESTER ROW */}
          <div className="DropdownRow">
            {/* BRANCH */}
            <div className={`select ${openDropdown === 'branch' ? 'open' : ''}`}>
              <div className="selected" onClick={() => handleToggleDropdown('branch')}>
                <span>{branch || "Select Branch"}</span>
                <svg viewBox="0 0 512 512" className="arrow"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path></svg>
              </div>
              <div className="options">
                {currentBranches.map((b) => (
                  <div key={b} className="option-wrapper" onClick={() => handleSelect(setBranch, b)}>
                    <input type="radio" checked={branch === b} readOnly />
                    <label className="option">{b}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* SEMESTER */}
            <div className={`select ${openDropdown === 'semester' ? 'open' : ''}`}>
              <div className="selected" onClick={() => handleToggleDropdown('semester')}>
                <span>{semester.replace(/[-_]/g, ' ') || "Select Semester"}</span>
                <svg viewBox="0 0 512 512" className="arrow"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path></svg>
              </div>
              <div className="options">
                {currentSemesters.map((s) => (
                  <div key={s} className="option-wrapper" onClick={() => handleSelect(setSemester, s)}>
                    <input type="radio" checked={semester === s} readOnly />
                    <label className="option">{s.replace(/[-_]/g, ' ')}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BUTTON (Aligned to Dropdown Row) */}
        <button 
        className={`paper_find ${loading ? "loading" : ""}`} 
        onClick={handleFindClick} 
        disabled={loading}
        >
          {loading ? (
            <div className="spinner"></div>
          ) : (
        <>
        <div className="OK">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          </div>
          <div className="text">Search</div>
          </>
        )}
        </button>
        </div>

      <div className="main56">
        {subjectDetails.length > 0 ? (
          subjectDetails.map((subject, index) => (
            <Card
              key={index}
              subject={subject.name}
              code={subject.code}
              num_mat={subject.materials_available}
              semester={semester}
              options={subject.options || []}
            />
          ))
        ) : (
          <p>No subjects found for this selection.</p>
        )}
      </div>
    </div>
  );
}

export default Papers;