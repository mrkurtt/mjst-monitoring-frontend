import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';

const DirectorDoubleBlind: React.FC = () => {
  const { doubleBlindRecords } = useRecords();
  const { reviewers } = useReviewers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);

  const filteredRecords = doubleBlindRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = async (manuscript: any) => {
    try {
      console.log('Attempting to view manuscript:', manuscript);
      // First set the basic manuscript details
      setSelectedManuscript(manuscript);
      setIsModalOpen(true);
      
      // Update the fetch URL to match your API endpoint
      const response = await fetch(`/api/doubleblind/${manuscript.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch manuscript details');
      }
      const data = await response.json();
      console.log('Fetched manuscript details:', data);
      
      // Update the manuscript with staff details
      setSelectedManuscript(prev => ({
        ...prev,
        staffDoubleBlind: {
          reviewer1: data.reviewer1,
          reviewer2: data.reviewer2,
          reviewer3: data.reviewer3
        }
      }));
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Double-Blind Review Records</h3>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Field/Scope</th>
              <th className="py-3 px-4 text-left">Date Submitted</th>
              <th className="py-3 px-4 text-left">Authors</th>
              <th className="py-3 px-4 text-left">Affiliation</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4">{record.scopeCode}</td>
                <td className="py-4 px-4">{record.title}</td>
                <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                <td className="py-4 px-4">{record.date}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{record.affiliation}</td>
                <td className="py-4 px-4">
                  {record.revisionStatus && (
                    <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {record.revisionStatus}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => {
                      console.log('View button clicked for record:', record);
                      handleViewDetails(record);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center cursor-pointer"
                    type="button"
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
      {isModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[1100px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Double-Blind Review Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Manuscript Info */}
              <div className="col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700 block">File Code:</label>
                      <p className="text-gray-700">{selectedManuscript.scopeCode}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Date Submitted:</label>
                      <p className="text-gray-700">
                        {selectedManuscript.staffUpload?.dateSubmitted 
                          ? new Date(selectedManuscript.staffUpload.dateSubmitted).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Date not available'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Title:</label>
                      <p className="text-gray-700">{selectedManuscript.title}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Author/s:</label>
                      <p className="text-gray-700">{selectedManuscript.authors}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Field/Scope:</label>
                      <p className="text-gray-700">
                        {`${selectedManuscript.scopeType.charAt(0).toUpperCase() + 
                          selectedManuscript.scopeType.slice(1)} ${selectedManuscript.scope}`}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700 block">Editor:</label>
                      <p className="text-gray-700">{selectedManuscript.editor}</p>
                    </div>
                  </div>
                </div>

                {/* Manuscript Scores */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Scores</h4>
                  <ScoresDisplay manuscript={selectedManuscript} />
                </div>
              </div>

              {/* Right Column - Assigned Reviewers */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Assigned Reviewers</h4>
                <div className="space-y-4">
                  {selectedManuscript?.staffDoubleBlind?.reviewer1 && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {selectedManuscript.staffDoubleBlind.reviewer1.firstName} {selectedManuscript.staffDoubleBlind.reviewer1.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{selectedManuscript.staffDoubleBlind.reviewer1.email}</p>
                          <p className="text-sm text-gray-600">Expertise: {selectedManuscript.staffDoubleBlind.reviewer1.fieldOfExpertise}</p>
                          <p className="text-sm text-gray-600">Contact: {selectedManuscript.staffDoubleBlind.reviewer1.contact}</p>
                          <p className="text-sm text-gray-600">Affiliation: {selectedManuscript.staffDoubleBlind.reviewer1.affiliation}</p>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Remarks</p>
                            <div className="bg-gray-50 p-2 rounded">
                              <select
                                className="w-full p-2 border rounded"
                                value={selectedManuscript.staffDoubleBlind.reviewer1.remarks || ''}
                                disabled
                              >
                                <option value="">Select Remarks</option>
                                <option value="excellent">Excellent</option>
                                <option value="acceptable">Acceptable</option>
                                <option value="acceptable-with-revision">Acceptable with Revision</option>
                                <option value="not-acceptable">Not Acceptable</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-medium">Reviewer 1</span>
                      </div>
                    </div>
                  )}

                  {/* Repeat for Reviewer 2 */}
                  {selectedManuscript?.staffDoubleBlind?.reviewer2 && (
                    <div className="bg-white border rounded-lg p-4">
                      {/* Same structure as Reviewer 1, but with reviewer2 data */}
                    </div>
                  )}

                  {/* Repeat for Reviewer 3 */}
                  {selectedManuscript?.staffDoubleBlind?.reviewer3 && (
                    <div className="bg-white border rounded-lg p-4">
                      {/* Same structure as Reviewer 1, but with reviewer3 data */}
                    </div>
                  )}

                  {!selectedManuscript?.staffDoubleBlind?.reviewer1 && 
                   !selectedManuscript?.staffDoubleBlind?.reviewer2 && 
                   !selectedManuscript?.staffDoubleBlind?.reviewer3 && (
                    <p className="text-gray-500 italic">No reviewers assigned</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
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

export default DirectorDoubleBlind;