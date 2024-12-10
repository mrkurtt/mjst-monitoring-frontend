import React from 'react';
import { User, ExternalLink } from 'lucide-react';
import { useReviewers } from '../contexts/ReviewersContext';

const DirectorReviewersInfo: React.FC = () => {
  const { reviewers } = useReviewers();

  return (
    <div className="reviewers-info-container">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {reviewers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviewers available.</p>
        ) : (
          <div className="space-y-4">
            {reviewers.map((reviewer) => (
              <div key={reviewer.id} className="flex items-center bg-gray-100 p-4 rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  <User size={40} className="text-gray-500" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">
                    {`${reviewer.firstName} ${reviewer.middleName} ${reviewer.lastName}`}
                  </h3>
                  <p className="text-gray-600">{reviewer.fieldOfReview}</p>
                  <p className="text-gray-500">{reviewer.email}</p>
                  <p className="text-gray-500">{reviewer.address}</p>
                </div>
                {reviewer.publicationsLink && (
                  <div className="flex-shrink-0">
                    <a
                      href={reviewer.publicationsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <ExternalLink size={20} className="mr-1" />
                      Publications
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorReviewersInfo;