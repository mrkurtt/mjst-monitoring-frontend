import React from 'react';
import { X, User, ExternalLink } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import { useEditors } from '../contexts/EditorsContext';

interface DetailedRecordsModalProps {
  cardId: string;
  cardTitle: string;
  onClose: () => void;
  isDirector?: boolean;
}

const DetailedRecordsModal: React.FC<DetailedRecordsModalProps> = ({ 
  cardId, 
  cardTitle, 
  onClose,
  isDirector = false 
}) => {
  const { 
    manuscriptRecords, 
    doubleBlindRecords, 
    acceptedRecords,
    finalProofreadingRecords,
    publishedRecords,
    rejectedRecords 
  } = useRecords();
  const { reviewers } = useReviewers();
  const { editors } = useEditors();

  const getRecordsByType = () => {
    switch (cardId) {
      case 'pre-review':
        return manuscriptRecords;
      case 'double-blind':
        return doubleBlindRecords;
      case 'accepted':
        return isDirector ? [] : acceptedRecords;
      case 'published':
        return publishedRecords;
      case 'rejected':
        return rejectedRecords;
      case 'pending':
        return manuscriptRecords.filter(record => !record.status || record.status === 'pre-review');      case 'final-proofreading':
        return finalProofreadingRecords;
      default:
        return [];
    }
  };

  const renderManuscriptRecords = () => (
    <table className="min-w-full bg-white">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-2 px-4 text-left">File Code</th>
          <th className="py-2 px-4 text-left">Title</th>
          <th className="py-2 px-4 text-left">Author</th>
          <th className="py-2 px-4 text-left">Date</th>
          <th className="py-2 px-4 text-left">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {getRecordsByType().map((record) => (
          <tr key={record.id} className="hover:bg-gray-50">
            <td className="py-2 px-4">{record.scopeCode}</td>
            <td className="py-2 px-4">{record.title}</td>
            <td className="py-2 px-4">{record.authors}</td>
            <td className="py-2 px-4">{record.date}</td>
            <td className="py-2 px-4">
              {record.revisionStatus ? (
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {record.revisionStatus}
                </span>
              ) : (
                record.status || 'Pending'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderReviewers = () => (
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
            <p className="text-blue-600">{reviewer.fieldOfReview}</p>
            <p className="text-gray-600">{reviewer.email}</p>
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
  );

  const renderEditors = () => (
    <div className="space-y-4">
      {editors.map((editor) => (
        <div key={editor.id} className="flex items-center bg-gray-100 p-4 rounded-lg">
          <div className="flex-shrink-0 mr-4">
            <User size={40} className="text-gray-500" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">
              {`${editor.firstName} ${editor.middleName} ${editor.lastName}`}
            </h3>
            <p className="text-blue-600 font-medium">{editor.position}</p>
            <p className="text-gray-600">{editor.department}</p>
            <p className="text-gray-500">{editor.email}</p>
          </div>
          {editor.profileLink && (
            <div className="flex-shrink-0">
              <a
                href={editor.profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <ExternalLink size={20} className="mr-1" />
                Profile
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (cardId) {
      case 'reviewers':
        return reviewers.length > 0 ? renderReviewers() : (
          <p className="text-center text-gray-500 py-4">No reviewers available</p>
        );
      case 'editors':
        return editors.length > 0 ? renderEditors() : (
          <p className="text-center text-gray-500 py-4">No editors available</p>
        );
      default:
        return getRecordsByType().length > 0 ? renderManuscriptRecords() : (
          <p className="text-center text-gray-500 py-4">No records available</p>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{cardTitle} Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DetailedRecordsModal;