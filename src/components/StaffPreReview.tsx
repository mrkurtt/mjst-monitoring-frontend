import React from 'react';
import { useLocation } from 'react-router-dom';
import StaffUpload from './StaffUpload';
import StaffRecords from './StaffRecords';

const StaffPreReview: React.FC<{ activeSubTab?: string }> = ({ activeSubTab }) => {
  const location = useLocation();
  const isUploadPage = activeSubTab === 'pre-review-upload' || location.pathname.includes('upload');

  return (
    <div className="staff-pre-review-container">
      <h2 className="text-2xl font-bold mb-4">{isUploadPage ? 'Pre-Review Upload' : 'Pre-Review Records'}</h2>
      {isUploadPage ? <StaffUpload /> : <StaffRecords />}
    </div>
  );
};

export default StaffPreReview;