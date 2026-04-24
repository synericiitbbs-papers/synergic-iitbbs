import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Card from './../Cards/Card.jsx';
import './../question papers section/Papers.css'; // Reuse the grid layout

const SubjectSelection = () => {
  const { subjectName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get data passed from the Card's navigate state
  const { electiveOptions, parentSubject } = location.state || { electiveOptions: [] };

  // Clean title for display
  const displayTitle = parentSubject || subjectName.replace(/_/g, ' ');

  return (
    <div className="notion-layout">
      <header className="ao-header" style={{ padding: '0 10%', marginTop: '3%' }}>
        <div className="ao-title-section">
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{displayTitle}</h2>
        </div>
      </header>

      <div className="main56">
        {electiveOptions.length > 0 ? (
          electiveOptions.map((opt, index) => (
            <Card
              key={index}
              subject={opt.name}
              code={opt.code}
              num_mat={opt.materials_available || "0"}
              // Since these have codes, the Card's internal logic 
              // will now redirect them to /questionpapers/ instead of loops
            />
          ))
        ) : (
          <div className="error-screen" style={{ textAlign: 'center', width: '100%', marginTop: '50px' }}>
             <h3>No options found for this group.</h3>
             <p>Please return to the previous page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelection;