import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './card.css';

// Image Imports
import csImg from './../../images/cs.png';
import ecImg from './../../images/ec.png';
import eeImg from './../../images/ee.png';
import meImg from './../../images/me.png';
import mmImg from './../../images/mm.png';
import ceImg from './../../images/ce.png';
import epImg from './../../images/ep.png';
import othersImg from './../../images/others.png';
import diagonal from './../../images/diagonal.png';

export default function Card({ subject, code, num_mat, options = [] }) {
  const navigate = useNavigate();
  
  const [materialCount, setMaterialCount] = useState(num_mat || 0);
  const [isCountLoading, setIsCountLoading] = useState(false);

  // LOGIC: A "Group" has an empty code and existing options
  const isElectiveGroup = (!code || code.trim() === "") && options.length > 0;

  useEffect(() => {
    // Only fetch counts for individual subjects that have a code
    if (isElectiveGroup || (num_mat && num_mat !== "0")) return;

    const fetchPaperCount = async () => {
      setIsCountLoading(true);
      try {
        const response = await fetch(`https://synergic-backend.onrender.com/api/countPapers/${subject.replace(/\s+/g, '_')}`);
        const data = await response.json();
        
        if (data.success) {
          setMaterialCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching count:", error);
        setMaterialCount(0);
      } finally {
        setIsCountLoading(false);
      }
    };

    fetchPaperCount();
  }, [subject, num_mat, isElectiveGroup]);

  // Image Prefix Logic
  const departmentImages = { cs: csImg, ec: ecImg, ee: eeImg, me: meImg, ml: mmImg, ce: ceImg, ep: epImg };
  const prefix = code ? code.toLowerCase().match(/^[a-z]+/)?.[0] : "others";
  const imageSrc = departmentImages[prefix] || othersImg;

  // NAVIGATION LOGIC
  const handleExplore = () => {
    if (isElectiveGroup) {
      // Navigate to the selection page, passing options in the state
      navigate(`/choose-subject/${subject.replace(/\s+/g, '_')}`, { 
        state: { electiveOptions: options, parentSubject: subject } 
      });
    } else {
      // Normal subject navigation
      navigate(`/questionpapers/${subject.replace(/\s+/g, '_')}`);
    }
  };

  return (
    <div className="main_card_wrapper">
      <div className={`card_inner ${isElectiveGroup ? 'elective_card' : ''}`}>
        
        <div className="icon_box">
          <img src={imageSrc} alt="subject-icon" className="subject_icon" />
        </div>

        <div className="text_box">
          <h2 className="subject_name">{subject}</h2>
          <p className="subject_id">
            {isElectiveGroup ? "Elective Group" : (code || "Core Subject")}
          </p>
        </div>

        <span className="materials_count">
          {isElectiveGroup 
            ? `${options.length} Subjects available` 
            : `${isCountLoading ? "..." : materialCount} Materials Available`}
        </span>

        <button 
          type="button" 
          className="explore_btn" 
          onClick={handleExplore}
        >
          <span className="btn_text">Explore</span>
          <span className="btn_icon">
            <img src={diagonal} alt="arrow" className="btn_svg" />
          </span>
        </button>
      </div>
    </div>
  );
}