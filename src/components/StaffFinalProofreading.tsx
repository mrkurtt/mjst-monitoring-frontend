import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';

interface ProofreadingDetails {
  proofreader: string;
  proofreaderEmail: string;
  dateSent: string;
  status: string;
  revisionStatus?: string;
  revisionComments?: string;
}

interface PublishDetails {
  scopeNumber: string;
  volumeYear: string;
  datePublished: string;
  issueName?: string;
}

interface ManuscriptRecord {
  id: string;
  title: string;
  authors: string;
  scopeCode: string;
  scopeType: string;
  staffupload?: {
    fieldScope: string;
    dateSubmitted: string;
  };
  proofreadingDetails?: ProofreadingDetails;
  publishDetails?: PublishDetails;
}

interface ManuscriptDetails {
  // ... existing fields ...
  staffUpload?: {
    dateSubmitted: string;
  };
  layoutDetails?: {
    layoutArtist: string;
    layoutArtistEmail: string;
    dateFinished: string;
    status: string;
  };
  proofreadingDetails?: {
    proofreaderName: string;
    proofreaderEmail: string;
    status: string;
  };
}

const StaffFinalProofreading: React.FC = () => {
  const { finalProofreadingRecords, updateManuscriptStatus } = useRecords();
  const { reviewers } = useReviewers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [revisionComments, setRevisionComments] = useState('');
  const [publishDetails, setPublishDetails] = useState({
    scopeNumber: '',
    volumeYear: new Date().getFullYear().toString(),
    datePublished: new Date().toISOString().split('T')[0],
    issueName: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showRevisionConfirmation, setShowRevisionConfirmation] = useState(false);
  const [showRevisionSuccess, setShowRevisionSuccess] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [volumeName, setVolumeName] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [formFields, setFormFields] = useState({
    issueNumber: false,
    volumeName: false,
    datePublished: false
  });
  const [isPublishFormValid, setIsPublishFormValid] = useState(false);

  const scopeOptions = ['1', '2', 'Special Issue'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 76 }, (_, i) => (currentYear + i).toString());

  const filteredRecords = finalProofreadingRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.proofreadingDetails?.proofreader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleViewStatus = (record: any) => {
    setSelectedRecord(record);
    setIsStatusModalOpen(true);
  };

  const handleRevise = () => {
    setShowRevisionConfirmation(true);
  };

  const confirmRevision = () => {
    if (selectedRecord && revisionComments) {
      const updatedManuscript = {
        ...selectedRecord,
        proofreadingDetails: {
          ...selectedRecord.proofreadingDetails,
          status: 'revised',
          revisionStatus: 'for-revision',
          revisionComments
        }
      };
      updateManuscriptStatus(selectedRecord.id, 'final-proofreading', updatedManuscript);
      setShowRevisionConfirmation(false);
      setIsReviseModalOpen(false);
      setShowRevisionSuccess(true);
      setRevisionComments('');
    }
  };

  const handlePublish = () => {
    // Reset validation errors
    setValidationErrors({});

    // Validate required fields
    const errors: {[key: string]: string} = {};
    if (!publishDetails.scopeNumber) {
      errors.scopeNumber = 'Issue number is required';
    }
    if (publishDetails.scopeNumber === 'Special Issue' && !publishDetails.issueName) {
      errors.issueName = 'Issue name is required for Special Issue';
    }
    if (!publishDetails.volumeYear) {
      errors.volumeYear = 'Volume name is required';
    }
    if (!publishDetails.datePublished) {
      errors.datePublished = 'Date published is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmPublish = () => {
    if (selectedRecord && publishDetails.scopeNumber && publishDetails.volumeYear && publishDetails.datePublished) {
      const updatedManuscript = {
        ...selectedRecord,
        publishDetails: {
          ...publishDetails
        }
      };
      updateManuscriptStatus(selectedRecord.id, 'published', updatedManuscript);
      setShowConfirmation(false);
      setIsPublishModalOpen(false);
      setShowSuccess(true);
      setPublishDetails({
        scopeNumber: '',
        volumeYear: new Date().getFullYear().toString(),
        datePublished: new Date().toISOString().split('T')[0],
        issueName: ''
      });
    }
  };

  const isFormComplete = () => {
    // Check if all fields have values and are not just whitespace
    const hasIssueNumber = publishDetails.scopeNumber && publishDetails.scopeNumber.trim() !== '';
    const hasVolumeName = publishDetails.volumeYear && publishDetails.volumeYear.trim() !== '';
    const hasDatePublished = publishDetails.datePublished && publishDetails.datePublished.trim() !== '';

    // All fields must be filled to return true
    const allFieldsFilled = hasIssueNumber && hasVolumeName && hasDatePublished;

    // For Special Issue, also check issueName
    if (publishDetails.scopeNumber === 'Special Issue') {
      const hasIssueName = publishDetails.issueName && publishDetails.issueName.trim() !== '';
      return allFieldsFilled && hasIssueName;
    }

    return allFieldsFilled;
  };

  const validateFields = () => {
    // Check each field individually
    const fieldsStatus = {
      issueNumber: publishDetails.scopeNumber && publishDetails.scopeNumber.trim() !== '',
      volumeName: publishDetails.volumeYear && publishDetails.volumeYear.trim() !== '',
      datePublished: publishDetails.datePublished && publishDetails.datePublished.trim() !== ''
    };

    setFormFields(fieldsStatus);

    // Return true only if ALL fields are filled
    return fieldsStatus.issueNumber && 
           fieldsStatus.volumeName && 
           fieldsStatus.datePublished;
  };

  useEffect(() => {
    validateFields();
  }, [publishDetails]);

  // Track form field completion
  const [formComplete, setFormComplete] = useState({
    issueNumber: false,
    volumeName: false,
    datePublished: false
  });

  // Check if all fields are filled
  const areAllFieldsFilled = () => {
    return formComplete.issueNumber && 
           formComplete.volumeName && 
           formComplete.datePublished;
  };

  // Update field status when values change
  useEffect(() => {
    setFormComplete({
      issueNumber: !!publishDetails.scopeNumber,
      volumeName: !!publishDetails.volumeYear && publishDetails.volumeYear.trim() !== '',
      datePublished: !!publishDetails.datePublished
    });
  }, [publishDetails]);

  const validatePublishForm = () => {
    const isValid = 
      publishDetails.scopeNumber?.trim() !== '' && 
      publishDetails.volumeYear?.trim() !== '' && 
      publishDetails.datePublished?.trim() !== '' &&
      // Additional check for Special Issue
      (publishDetails.scopeNumber !== 'Special Issue' || 
       (publishDetails.scopeNumber === 'Special Issue' && publishDetails.issueName?.trim() !== ''));

    setIsPublishFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    validatePublishForm();
  }, [publishDetails]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Final Proofreading Records</h3>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Field/Scope</th>
              <th className="py-3 px-4 text-left">Author</th>
              <th className="py-3 px-4 text-left">Date Submitted</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{record.scopeCode}</td>
                <td className="px-4 py-2">{record.title}</td>
                <td className="px-4 py-2">{record.scope}</td>
                <td className="px-4 py-2">{record.authors}</td>
                <td className="px-4 py-2">
                  {record.staffUpload?.dateSubmitted ? 
                    new Date(record.staffUpload.dateSubmitted).toISOString().split('T')[0]
                    : 'Not available'
                  }
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      record.proofreadingDetails?.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : record.proofreadingDetails?.status === 'revised'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {record.proofreadingDetails?.status === 'completed' 
                        ? 'Completed' 
                        : record.proofreadingDetails?.status === 'revised'
                        ? 'For Revision'
                        : 'In Progress'}
                    </span>
                    {record.proofreadingDetails?.status === 'revised' && (
                      <button
                        onClick={() => handleViewStatus(record)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        View Status
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleViewDetails(record)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[1100px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Proofreading Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex-1 space-y-4">
                {/* Manuscript Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700 block">File Code:</label>
                      <p className="text-gray-700">{selectedRecord.scopeCode}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Date Submitted:</label>
                      <p className="text-gray-700">
                        {selectedRecord.staffUpload?.dateSubmitted ? 
                          new Date(selectedRecord.staffUpload.dateSubmitted).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : 'Not available'
                        }
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Journal/Research Title:</label>
                      <p className="text-gray-700">{selectedRecord.title}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Author/s:</label>
                      <p className="text-gray-700">{selectedRecord.authors}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Field/Scope:</label>
                      <p className="text-gray-700">{`${selectedRecord.scopeType.charAt(0).toUpperCase() + selectedRecord.scopeType.slice(1)} ${selectedRecord.scope}`}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Editor:</label>
                      <p className="text-gray-700">{selectedRecord.editor}</p>
                    </div>
                  </div>
                </div>

                {/* Add Scores Display */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Scores</h4>
                  <ScoresDisplay manuscript={selectedRecord} />
                </div>

                {/* Layout Information Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4">Layout Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold block">Layout Artist:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtist}</p>
                    </div>
                    <div>
                      <label className="font-semibold block">Layout Artist Email:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtistEmail}</p>
                    </div>
                    <div>
                      <label className="font-semibold block">Date Finished:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails?.dateFinished}</p>
                    </div>
                  </div>
                </div>

                {/* Proofreading Details Section */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-lg font-semibold mb-4">Proofreading Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold block">Proofreader:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails?.proofreader}</p>
                    </div>
                    <div>
                      <label className="font-semibold block">Proofreader Email:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails?.proofreaderEmail}</p>
                    </div>
                    <div>
                      <label className="font-semibold block">Date Finished:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails?.dateSent}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Reviewers Section */}
              <div className="w-[350px] border-l pl-6">
                <h4 className="text-lg font-semibold mb-4">Assigned Reviewers</h4>
                <div className="space-y-4">
                  {selectedRecord.reviewers?.map((reviewerId: string, index: number) => {
                    const reviewer = reviewers.find(r => r.id.toString() === reviewerId);
                    return reviewer ? (
                      <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">
                              {reviewer.firstName} {reviewer.middleName} {reviewer.lastName}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">{reviewer.email}</p>
                            <p className="text-gray-600 text-sm mt-1">{reviewer.affiliation}</p>
                            <p className="text-gray-600 text-sm mt-1">Expertise: {reviewer.fieldOfExpertise}</p>
                            
                            {selectedRecord.reviewerRemarks?.[reviewerId] && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Remarks:</p>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                                  selectedRecord.reviewerRemarks[reviewerId] === 'excellent' ? 'bg-green-100 text-green-800' :
                                  selectedRecord.reviewerRemarks[reviewerId] === 'acceptable' ? 'bg-blue-100 text-blue-800' :
                                  selectedRecord.reviewerRemarks[reviewerId] === 'acceptable-with-revision' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {selectedRecord.reviewerRemarks[reviewerId].split('-').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Reviewer {index + 1}
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })}
                  {(!selectedRecord.reviewers || selectedRecord.reviewers.length === 0) && (
                    <p className="text-gray-500 italic">No reviewers assigned</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsReviseModalOpen(true);
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Revise
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsPublishModalOpen(true);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revise Modal */}
      {isReviseModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Revise Manuscript</h3>
              <button onClick={() => setIsReviseModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
              <p className="text-gray-700">{selectedRecord.title}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revision Comments
                </label>
                <textarea
                  value={revisionComments}
                  onChange={(e) => setRevisionComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter revision comments"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsReviseModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevise}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                disabled={!revisionComments}
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Publish Manuscript</h3>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
              <p className="text-gray-700">{selectedRecord.title}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Number <span className="text-red-500">*</span>
                </label>
                <select
                  value={publishDetails.scopeNumber}
                  onChange={(e) => setPublishDetails({ ...publishDetails, scopeNumber: e.target.value })}
                  className={`w-full px-3 py-2 border ${validationErrors.scopeNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Issue Number</option>
                  {scopeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {validationErrors.scopeNumber && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.scopeNumber}</p>
                )}
              </div>

              {publishDetails.scopeNumber === 'Special Issue' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={publishDetails.issueName}
                    onChange={(e) => setPublishDetails({ ...publishDetails, issueName: e.target.value })}
                    placeholder="Enter Special Issue Name"
                    className={`w-full px-3 py-2 border ${validationErrors.issueName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {validationErrors.issueName && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.issueName}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={volumeName}
                  onChange={(e) => setVolumeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter volume name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Published <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={datePublished}
                  onChange={(e) => setDatePublished(e.target.value)}
                  className={`w-full px-3 py-2 border ${validationErrors.datePublished ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {validationErrors.datePublished && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.datePublished}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={!isPublishFormValid}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isPublishFormValid
                    ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h3 className="text-xl font-semibold mb-4">Confirm Publication</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to publish this manuscript?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={confirmPublish}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Success!</h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  Successfully moved to Published section!
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Confirmation Modal */}
      {showRevisionConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h3 className="text-xl font-semibold mb-4">Confirm Revision</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to send this manuscript for revision?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRevisionConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevision}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Success Modal */}
      {showRevisionSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Revision Submitted Successfully</h3>
              <p className="text-sm text-gray-500 mb-6">The manuscript has been sent for revision.</p>
              <button
                onClick={() => setShowRevisionSuccess(false)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {isStatusModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Revision Status</h3>
              <button 
                onClick={() => setIsStatusModalOpen(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Status:</h4>
                <span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  For Revision
                </span>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Revision Comments:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedRecord.proofreadingDetails?.revisionComments || 'No comments available'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffFinalProofreading;