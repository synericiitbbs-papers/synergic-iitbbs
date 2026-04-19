import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./Save_Page.css";
// 1. Import your Loader component
import Loader from "../Loading/Loading"; 

const Save_Page = () => {
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [paperDetails, setPaperDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);

  const username = Cookies.get("username");

  // Initial Fetch: Get all collections
  useEffect(() => {
    const fetchCollections = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://synergic-backend.onrender.com/api/saved-papers/${username}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCollections(data.data);
          setActiveCollection(data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        // This stops the initial full-page loader
        setLoading(false);
      }
    };
    fetchCollections();
  }, [username]);

  // Fetch details when active collection changes
  useEffect(() => {
    const fetchAllPaperDetails = async () => {
      if (!activeCollection || !activeCollection.papers) return;
      
      setPapersLoading(true);
      try {
        const details = await Promise.all(
          activeCollection.papers.map(async (id) => {
            const res = await fetch(`https://synergic-backend.onrender.com/api/paper-details/${id}`);
            const result = await res.json();
            return result.success ? result.data : null;
          })
        );
        setPaperDetails(details.filter(p => p !== null));
      } catch (err) {
        console.error("Error fetching paper details:", err);
      } finally {
        setPapersLoading(false);
      }
    };

    fetchAllPaperDetails();
  }, [activeCollection]);

  // 2. Show the loader while the initial data is being fetched
  if (loading) return <Loader />;

  return (
    <div className="save-page-container">
      {/* Folder Section */}
      <div className="folder-row">
        {collections.map((col) => (
          <div 
            key={col.collection_name} 
            className={`folder-item ${activeCollection?.collection_name === col.collection_name ? "active" : ""}`}
            onClick={() => setActiveCollection(col)}
          >
            <div className="folder-icon">
              <img 
                src="https://img.icons8.com/material-rounded/96/folder-invoices.png" 
                alt="folder-icon"
                className="icon-img"
              />
            </div>
            <p className="folder-title">{col.collection_name}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Saved Papers</h2>

      {/* Papers Table */}
      <div className="table-wrapper">
        <table className="papers-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Type</th>
              <th>Year</th>
              <th>Contributor Name</th>
            </tr>
          </thead>
          <tbody>
            {/* 3. Also use the loader for the table when switching folders */}
            {papersLoading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="table-loader-container">
                     {/* You can use a smaller spinner here or the same Loader */}
                     <p>Loading papers...</p> 
                  </div>
                </td>
              </tr>
            ) : paperDetails.length > 0 ? (
              paperDetails.map((paper) => (
                <tr key={paper._id}>
                  <td>
                    <a href={paper.driveLink} target="_blank" rel="noreferrer" className="file-link">
                      {paper.filename}
                    </a>
                  </td>
                  <td className="capitalize">{paper.type}</td>
                  <td>{paper.yearOfStudy}</td>
                  <td>{paper.contributorName || "Anonymous"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="empty-table">No papers in this collection.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Save_Page;