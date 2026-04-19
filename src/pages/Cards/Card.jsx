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

export default function Card({ subject, code, num_mat }) {
  const navigate = useNavigate();
  
  // State to manage the actual count from the API
  const [materialCount, setMaterialCount] = useState(num_mat || 0);
  const [isCountLoading, setIsCountLoading] = useState(false);

  // 1. Fetch real paper count via API
  useEffect(() => {
    const fetchPaperCount = async () => {
      // If we already have a valid number from props (not 0 or null), we can skip fetching
      if (num_mat && num_mat !== "0") return;

      setIsCountLoading(true);
      try {
        // Replace with your actual count endpoint
        const response = await fetch(`https://synergic-backend.onrender.com/api/countPapers/${subject.replace(/\s+/g, '_')}`);
        const data = await response.json();
        
        if (data.success) {
          setMaterialCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching material count:", error);
        setMaterialCount(0);
      } finally {
        setIsCountLoading(false);
      }
    };

    fetchPaperCount();
  }, [subject, num_mat]);

  // 2. Department Image Logic
  const departmentImages = {
    cs: csImg,
    ec: ecImg,
    ee: eeImg,
    me: meImg,
    ml: mmImg,
    ce: ceImg,
    ep: epImg,
  };

  const prefix = code.toLowerCase().match(/^[a-z]+/)?.[0];
  const imageSrc = departmentImages[prefix] || othersImg;

  // 3. Navigation Logic
  const handleExplore = () => {
    const route = `/questionpapers/${subject.replace(/\s+/g, '_')}`;
    navigate(route);
  };

  return (
    <div className="main_card_wrapper">
      <div className="card_inner">
        
        {/* Top: Icon/Logo Section */}
        <div className="icon_box">
          <img src={imageSrc} alt={`${prefix}-icon`} className="subject_icon" />
        </div>

        {/* Middle: Text Information */}
        <div className="text_box">
          <h2 className="subject_name">{subject}</h2>
          <p className="subject_id">{code}</p>
        </div>

        {/* Bottom Left: Dynamic Materials Count */}
        <span className="materials_count">
          {isCountLoading ? "..." : materialCount} Materials Available
        </span>

        {/* Bottom Right: Explore Button */}
        <button 
          type="button" 
          className="explore_btn" 
          onClick={handleExplore}
          aria-label={`Explore ${subject}`}
        >
          <span className="btn_text">Explore</span>
          <span className="btn_icon">
            <img 
              src={diagonal}
              alt="arrow" 
              className="btn_svg"
            />
          </span>
        </button>
      </div>
    </div>
  );
}