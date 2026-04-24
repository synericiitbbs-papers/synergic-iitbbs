import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
// Removed styled-components import
import "./QuestionPapers.css";
import "./Modal.css";
import Loader from "../Loading/Loading";

const QuestionPapers = () => {
  const { subject } = useParams();
  const [searchParams] = useSearchParams();
  const semester = searchParams.get("semester");

  const [papers, setPapers] = useState({}); 
  const [activeYear, setActiveYear] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [savedPapers, setSavedPapers] = useState(new Set());
  const [collections, setCollections] = useState([]);
  const [activePaperId, setActivePaperId] = useState(null);
  
  const [showMainModal, setShowMainModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedColName, setSelectedColName] = useState("");
  const [newColName, setNewColName] = useState("");

  const username = Cookies.get("username");
  const folderRowRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paperRes = await fetch(`https://synergic-backend.onrender.com/questionpapers/${subject}`);
        const paperData = await paperRes.json();
        
        if (paperData.success) {
          const grouped = paperData.papers.reduce((acc, p) => {
            acc[p.yearOfStudy] = acc[p.yearOfStudy] || [];
            acc[p.yearOfStudy].push(p);
            return acc;
          }, {});
          setPapers(grouped);
          if (Object.keys(grouped).length > 0) setActiveYear(Object.keys(grouped)[0]);
        }

        if (username) {
          const savedRes = await fetch(`https://synergic-backend.onrender.com/api/saved-papers/${username}`);
          const savedData = await savedRes.json();
          if (savedData.success) {
            setCollections(savedData.data);
            const ids = new Set();
            savedData.data.forEach(col => col.papers.forEach(id => ids.add(id)));
            setSavedPapers(ids);
          }
        }
      } catch (err) { setError("Data fetch failed."); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [subject, username]);

  const scrollFolders = (direction) => {
    if (folderRowRef.current) {
      const { scrollLeft, clientWidth } = folderRowRef.current;
      const scrollAmount = clientWidth * 0.6;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      
      folderRowRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth"
      });
    }
  };

  const handleSaveToCollection = async (colName) => {
    const nameToSave = colName || newColName;
    if (!colName && collections.some(c => c.collection_name.toLowerCase() === nameToSave.toLowerCase())) {
      return alert("A collection with this name already exists!");
    }

    try {
      const res = await fetch(`https://synergic-backend.onrender.com/api/save-paper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: username, paper_id: activePaperId, collection_name: nameToSave }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedPapers(prev => new Set(prev).add(activePaperId));
        setCollections(data.data.saved_papers || []);
        closeAllModals();
      }
    } catch (err) { console.error(err); }
  };

  const handleUnsave = async (paperId) => {
    const col = collections.find(c => c.papers.includes(paperId));
    if (!col) return;
    try {
      const res = await fetch(`https://synergic-backend.onrender.com/api/unsave-paper`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: username, paper_id: paperId, collection_name: col.collection_name }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedPapers(prev => {
          const next = new Set(prev);
          next.delete(paperId);
          return next;
        });
        setCollections(data.data || []);
      }
    } catch (err) { console.error(err); }
  };

  const togglePin = (paperId) => {
    if (!username) return alert("Please log in first");
    if (savedPapers.has(paperId)) {
      handleUnsave(paperId);
    } else {
      setActivePaperId(paperId);
      setShowMainModal(true);
    }
  };
const formattedSubject = subject.replace(/_/g, " ");
  const closeAllModals = () => {
    setShowMainModal(false);
    setShowCreateModal(false);
    setSelectedColName("");
    setNewColName("");
  };

  if (loading) return <Loader/>;

  return (
    <div className="qp-container">
      <h2 className="qp-title">{formattedSubject} Papers</h2>

      <div className="slider-wrapper">
        <button className="scroll-btn left" onClick={() => scrollFolders("left")} aria-label="Scroll Left">
          &#10094;
        </button>

        <div className="folder-row" ref={folderRowRef}>
          {Object.keys(papers).map((year) => (
            <div 
              key={year} 
              className={`folder-item ${activeYear === year ? "active" : ""}`}
              onClick={() => setActiveYear(year)}
            >
              <div className="folder-icon">
                <img src="https://img.icons8.com/material-rounded/96/folder-invoices.png" alt="folder-icon" className="icon-img" />
              </div>
              <div className="folder-text">{year}</div>
            </div>
          ))}
        </div>

        <button className="scroll-btn right" onClick={() => scrollFolders("right")} aria-label="Scroll Right">
          &#10095;
        </button>
      </div>

      <div className="table-section">
        <h3 className="section-subtitle">Available Papers</h3>
        <table className="papers-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Year</th>
              <th>Contributor Name</th>
              <th>Save</th>
            </tr>
          </thead>
          <tbody>
            {activeYear && papers[activeYear]?.map((paper) => (
              <tr key={paper._id}>
                <td>
                  <a href={paper.driveLink} target="_blank" rel="noreferrer" className="paper-link">
                    {paper.filename}
                  </a>
                </td>
                <td className="type-cell">{paper.type || "N/A"}</td>
                <td>{paper.yearOfStudy}</td>
                <td>{paper.contributorName || "Anonymous"}</td>
                <td>
                  <div className="plus-button-container" onClick={() => togglePin(paper._id)}>
                    <div className={`plusButton ${savedPapers.has(paper._id) ? 'is-saved' : ''}`}>
                      <svg className="plusIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                        <path d="M13.75 23.75V16.25H6.25V13.75H13.75V6.25H16.25V13.75H23.75V16.25H16.25V23.75H13.75Z" />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}
      {showMainModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Save to project</h2>
              <p>Select a collection to save this paper.</p>
            </div>
            <div className="collection-radio-group">
              {collections.map((col) => (
                <label key={col.collection_name} className={`radio-item ${selectedColName === col.collection_name ? 'active' : ''}`}>
                  <input type="radio" name="collection" value={col.collection_name} onChange={(e) => setSelectedColName(e.target.value)} />
                  <span className="col-name">📁 {col.collection_name}</span>
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button className="create-new-btn" onClick={() => { setShowMainModal(false); setShowCreateModal(true); }}>+ Create new</button>
              <button className="modal-save-button" disabled={!selectedColName} onClick={() => handleSaveToCollection(selectedColName)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal-container small" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Collection</h2></div>
            <input className="modal-input" type="text" value={newColName} onChange={(e) => setNewColName(e.target.value)} placeholder="Name..." />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowCreateModal(false); setShowMainModal(true); }}>Back</button>
              <button className="btn-primary" disabled={!newColName} onClick={() => handleSaveToCollection()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPapers;