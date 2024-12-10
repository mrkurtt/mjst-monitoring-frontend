import React from 'react';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';

interface ReviewerProps {
  name: string;
  department: string;
  email: string;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}

const ReviewerItem: React.FC<ReviewerProps> = ({ 
  name, 
  department, 
  email, 
  onEdit, 
  onDelete,
  onAssign 
}) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-600">{department}</p>
      <p className="text-sm text-gray-500">{email}</p>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={onEdit}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
        title="Edit Reviewer"
      >
        <Edit2 className="w-5 h-5" />
      </button>
      <button
        onClick={onAssign}
        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
        title="Assign Manuscript"
      >
        <CheckCircle className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
        title="Delete Reviewer"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
);

interface ReviewersListProps {
  reviewers: Array<{
    id: string;
    name: string;
    department: string;
    email: string;
  }>;
  onEditReviewer: (id: string) => void;
  onDeleteReviewer: (id: string) => void;
  onAssignManuscript: (id: string) => void;
}

const ReviewersList: React.FC<ReviewersListProps> = ({
  reviewers,
  onEditReviewer,
  onDeleteReviewer,
  onAssignManuscript
}) => {
  return (
    <div className="space-y-4">
      {reviewers.map((reviewer) => (
        <ReviewerItem
          key={reviewer.id}
          name={reviewer.name}
          department={reviewer.department}
          email={reviewer.email}
          onEdit={() => onEditReviewer(reviewer.id)}
          onDelete={() => onDeleteReviewer(reviewer.id)}
          onAssign={() => onAssignManuscript(reviewer.id)}
        />
      ))}
    </div>
  );
};

export default ReviewersList; 