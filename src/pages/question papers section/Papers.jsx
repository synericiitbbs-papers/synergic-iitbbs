import React, { useState, useEffect, useRef } from "react";
import "./Papers.css";
import Card from "./../Cards/Card.jsx";
import "./../Cards/card.css";
import Toast from "../Toast/Toast.jsx";

function Papers() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Dropdown visibility state
  const [openDropdown, setOpenDropdown] = useState(null); // 'branch', 'semester', or null

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

  // Data Arrays for cleaner rendering
  const branches = [
    { id: "cse", label: "CSE", value: "CSE" },
    { id: "ece", label: "ECE", value: "ECE" },
    { id: "ee", label: "EE", value: "EE" },
    { id: "mech", label: "Mechanical", value: "Mechanical" },
    { id: "civil", label: "Civil", value: "Civil" },
    { id: "met", label: "Metallurgy", value: "Metallurgy" },
    { id: "ep", label: "Engineering Physics", value: "Engineering Physics" },
  ];

  const semesters = [
    { id: "s1", label: "Chemistry Sem", value: "chemistry-Semester" },
    { id: "s2", label: "Physics Sem", value: "Physics-Semester" },
    { id: "s3", label: "Semester 3", value: "Semester_3" },
    { id: "s4", label: "Semester 4", value: "Semester_4" },
    { id: "s5", label: "Semester 5", value: "Semester_5" },
    { id: "s6", label: "Semester 6", value: "Semester_6" },
    { id: "s7", label: "Semester 7", value: "Semester_7" },
    { id: "s8", label: "Semester 8", value: "Semester_8" },
  ];

  const handleToggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const handleSelect = (setter, value) => {
    setter(value);
    setOpenDropdown(null); // THIS CLOSES THE DROPDOWN
  };

  const handleFindClick = async () => {
    if (!branch || !semester) {
      setToast({ type: "error", message: "Please select both branch and semester." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://synergic-backend.onrender.com/subjects/${branch}/${semester}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const subjects = data.success ? data.subjects : [];

      setSubjectDetails(subjects);
      sessionStorage.setItem("saved_branch", branch);
      sessionStorage.setItem("saved_semester", semester);
      sessionStorage.setItem("saved_subjects", JSON.stringify(subjects));
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setToast({ type: "error", message: "Failed to fetch subjects. Please try again." });
      setSubjectDetails([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {toast && (
        <Toast 
          type={toast.type} 
          message={toast.message} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="NavDrop">
        
        {/* BRANCH DROPDOWN */}
        <div className={`select ${openDropdown === 'branch' ? 'open' : ''}`}>
          <div className="selected" onClick={() => handleToggleDropdown('branch')}>
            <span>{branch || "Select Branch"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="arrow">
              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
            </svg>
          </div>
          <div className="options">
            {branches.map((b) => (
              <div key={b.id} className="option-wrapper" onClick={() => handleSelect(setBranch, b.value)}>
                <input type="radio" checked={branch === b.value} readOnly />
                <label className="option">{b.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* SEMESTER DROPDOWN */}
        <div className={`select ${openDropdown === 'semester' ? 'open' : ''}`}>
          <div className="selected" onClick={() => handleToggleDropdown('semester')}>
            <span>{semester.replace(/[-_]/g, ' ') || "Select Semester"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="arrow">
              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
            </svg>
          </div>
          <div className="options">
            {semesters.map((s) => (
              <div key={s.id} className="option-wrapper" onClick={() => handleSelect(setSemester, s.value)}>
                <input type="radio" checked={semester === s.value} readOnly />
                <label className="option">{s.label}</label>
              </div>
            ))}
          </div>
        </div>

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
      <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
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
          <p>No subjects found.</p>
        )}
      </div>
    </div>
  );
}

export default Papers;