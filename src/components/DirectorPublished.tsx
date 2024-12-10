import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';

const DirectorPublished: React.FC = () => {
  const { publishedRecords } = useRecords();
  const { reviewers } = useReviewers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Generate year options from 2025 to 2100
  const yearOptions = Array.from({ length: 76 }, (_, i) => (2025 + i).toString());

  const filteredRecords = publishedRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = selectedYear === 'all' || 
      record.publishDetails?.volumeYear === selectedYear;

    return matchesSearch && matchesYear;
  });

  const handleViewDetails = async (record: any) => {
    try {
      console.log('Attempting to view record:', record);
      // First set the basic record details
      setSelectedRecord(record);
      setIsModalOpen(true);
      
      // Update the fetch URL to match your API endpoint
      const response = await fetch(`/api/published/${record.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch record details');
      }
      const data = await response.json();
      console.log('Fetched record details:', data);
      
      // Update the record with staff details
      setSelectedRecord(prev => ({
        ...prev,
        staffPublished: {
          reviewer1: data.reviewer1,
          reviewer2: data.reviewer2,
          reviewer3: data.reviewer3
        }
      }));
    } catch (error) {
      console.error('Error in handleViewDetails:', error);
    }
  };

  // Add this useEffect to check the data when it loads
  useEffect(() => {
    console.log('Published Records:', publishedRecords);
  }, [publishedRecords]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Published Records</h3>
      <div className="mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        {/* Year Filter */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-2">Filter by Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Years</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Field/Scope</th>
              <th className="py-3 px-4 text-left">Authors</th>
              <th className="py-3 px-4 text-left">Date Published</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4">{record.scopeCode}</td>
                <td className="py-4 px-4">{record.title}</td>
                <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{record.publishDetails?.datePublished}</td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleViewDetails(record)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center"
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
              <h3 className="text-xl font-semibold">Published Record Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Record Info */}
              <div className="col-span-2 space-y-6">
                {/* Manuscript Information */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700 block">File Code:</label>
                      <p className="text-gray-700">{selectedRecord.scopeCode}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Journal/Research Title:</label>
                      <p className="text-gray-700">{selectedRecord.title}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Author/s:</label>
                      <p className="text-gray-700">{selectedRecord.authors}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Field/Scope:</label>
                      <p className="text-gray-700">{`${selectedRecord.scopeType.charAt(0).toUpperCase() + selectedRecord.scopeType.slice(1)} ${selectedRecord.scope}`}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Editor:</label>
                      <p className="text-gray-700">{selectedRecord.editor}</p>
                    </div>
                  </div>
                </div>

                {/* Manuscript Scores */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Scores</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700 block">Grammar Score:</label>
                      <p className="text-green-600">{selectedRecord.grammarScore}% (Passed)</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Plagiarism Score:</label>
                      <p className="text-green-600">{selectedRecord.plagiarismScore}% (Passed)</p>
                    </div>
                  </div>
                </div>

                {/* Publication Details */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Publication Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-gray-700 block">Issue Number:</label>
                      <p className="text-gray-700">{selectedRecord.publishDetails?.scopeNumber}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Date Published:</label>
                      <p className="text-gray-700">{selectedRecord.publishDetails?.datePublished}</p>
                    </div>
                  </div>
                </div>

                {/* Layout Details */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Layout Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700 block">Layout Artist:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtist}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Layout Artist Email:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails?.layoutArtistEmail}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Date Finished:</label>
                      <p className="text-gray-700">{selectedRecord.layoutDetails?.dateFinished}</p>
                    </div>
                  </div>
                </div>

                {/* Proofreading Details */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Proofreading Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700 block">Proofreader:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails?.proofreader}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Proofreader Email:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails?.proofreaderEmail}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Date Sent:</label>
                      <p className="text-gray-700">{selectedRecord.proofreadingDetails?.dateSent}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Assigned Reviewers */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Assigned Reviewers</h4>
                <div className="space-y-4">
                  {selectedRecord?.staffPublished?.reviewer1 && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {selectedRecord.staffPublished.reviewer1.firstName} {selectedRecord.staffPublished.reviewer1.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{selectedRecord.staffPublished.reviewer1.email}</p>
                          <p className="text-sm text-gray-600">Expertise: {selectedRecord.staffPublished.reviewer1.fieldOfExpertise}</p>
                          <p className="text-sm text-gray-600">Contact: {selectedRecord.staffPublished.reviewer1.contact}</p>
                          <p className="text-sm text-gray-600">Affiliation: {selectedRecord.staffPublished.reviewer1.affiliation}</p>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Remarks</p>
                            <div className="bg-gray-50 p-2 rounded">
                              <select
                                className="w-full p-2 border rounded"
                                value={selectedRecord.staffPublished.reviewer1.remarks || ''}
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
                  {selectedRecord?.staffPublished?.reviewer2 && (
                    <div className="bg-white border rounded-lg p-4">
                      {/* Same structure as Reviewer 1, but with reviewer2 data */}
                    </div>
                  )}

                  {/* Repeat for Reviewer 3 */}
                  {selectedRecord?.staffPublished?.reviewer3 && (
                    <div className="bg-white border rounded-lg p-4">
                      {/* Same structure as Reviewer 1, but with reviewer3 data */}
                    </div>
                  )}

                  {!selectedRecord?.staffPublished?.reviewer1 && 
                   !selectedRecord?.staffPublished?.reviewer2 && 
                   !selectedRecord?.staffPublished?.reviewer3 && (
                    <p className="text-gray-500 italic">No reviewers assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorPublished;