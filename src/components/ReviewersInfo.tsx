import React, { useState } from 'react';
import ReviewersList from './ReviewersList';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ReviewersInfo: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);

  const handleEditReviewer = (id: string) => {
    // Implement edit logic
    console.log('Edit reviewer:', id);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedReviewer(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedReviewer) {
      // Implement delete logic
      console.log('Delete reviewer:', selectedReviewer);
      setDeleteModalOpen(false);
      setSelectedReviewer(null);
    }
  };

  const handleAssignManuscript = (id: string) => {
    // Implement assign logic
    console.log('Assign manuscript to reviewer:', id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reviewers Info</h1>
        <button
          onClick={() => {/* Add new reviewer logic */}}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Add Reviewer
        </button>
      </div>

      <ReviewersList
        reviewers={[/* Your reviewers data */]}
        onEditReviewer={handleEditReviewer}
        onDeleteReviewer={handleDeleteClick}
        onAssignManuscript={handleAssignManuscript}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName="this reviewer"
      />
    </div>
  );
};

export default ReviewersInfo; 