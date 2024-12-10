import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';
import { useReviewers } from '../contexts/ReviewersContext';
import ScoresDisplay from './shared/ScoresDisplay';

const StaffPublished: React.FC = () => {
  const { publishedRecords } = useRecords();
  const { reviewers } = useReviewers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortIssue, setSortIssue] = useState<string>('all');

  // Generate year options from 2025 to 2100
  const yearOptions = Array.from({ length: 76 }, (_, i) => (2025 + i).toString());

  const getUniqueIssues = () => {
    const issues = publishedRecords
      .map(record => record.publishDetails?.scopeNumber)
      .filter((issue): issue is string => !!issue);
    return Array.from(new Set(issues)).sort();
  };

  const filteredRecords = publishedRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = selectedYear === 'all' || 
      record.publishDetails?.volumeYear === selectedYear;

    const matchesIssue = sortIssue === 'all' ||
      record.publishDetails?.scopeNumber === sortIssue;

    return matchesSearch && matchesYear && matchesIssue;
  });

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Published Records</h3>
      <div className="mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        {/* Filters */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-6">
            {/* Year Filter */}
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

            {/* Issue Filter */}
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700 mr-2">Filter by Issue:</label>
              <select
                value={sortIssue}
                onChange={(e) => setSortIssue(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Issues</option>
                {getUniqueIssues().map(issue => (
                  <option key={issue} value={issue}>
                    {issue === 'Special Issue' ? 'Special Issue' : `Issue ${issue}`}
                  </option>
                ))}
              </select>
            </div>
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
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                <td className="py-4 px-4">{record.publishDetails?.datePublished}</td>
                <td className="py-4 px-4">
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
              <h3 className="text-xl font-semibold">Published Record Details</h3>
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
                          new Date(selectedRecord.staffUpload.dateSubmitted).toISOString().split('T')[0]
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

                {/* Add the scores display */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Manuscript Scores</h4>
                  <ScoresDisplay manuscript={selectedRecord} />
                </div>

                {/* Publication Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Publication Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-gray-700 block">Issue Number:</label>
                      <p className="text-gray-700">{selectedRecord.publishDetails?.scopeNumber}</p>
                    </div>
                    {selectedRecord.publishDetails?.issueName && (
                      <div>
                        <label className="font-medium text-gray-700 block">Issue Name:</label>
                        <p className="text-gray-700">{selectedRecord.publishDetails.issueName}</p>
                      </div>
                    )}
                    <div>
                      <label className="font-medium text-gray-700 block">Volume Name:</label>
                      <p className="text-gray-700">{selectedRecord.publishDetails?.volumeYear}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700 block">Date Published:</label>
                      <p className="text-gray-700">{selectedRecord.publishDetails?.datePublished}</p>
                    </div>
                  </div>
                </div>

                {/* Layout Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
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
                <div className="bg-gray-50 p-4 rounded-lg">
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

              {/* Assigned Reviewers Section */}
              <div className="w-[350px] border-l pl-6">
                <h4 className="text-lg font-semibold mb-4">Assigned Reviewers</h4>
                <div className="space-y-4">
                  {selectedRecord.reviewers?.map((reviewerId: string, index: number) => {
                    const reviewer = reviewers.find(r => r.id.toString() === reviewerId);
                    return reviewer ? (
                      <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {reviewer.firstName} {reviewer.middleName} {reviewer.lastName}
                            </p>
                            <p className="text-gray-600 text-sm">{reviewer.email}</p>
                            <p className="text-gray-600 text-sm">Expertise: {reviewer.fieldOfExpertise}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Reviewer {index + 1}
                          </span>
                        </div>
                        {selectedRecord.reviewerRemarks?.[reviewerId] && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Remarks
                            </label>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              selectedRecord.reviewerRemarks[reviewerId] === 'excellent' ? 'bg-green-100 text-green-800' :
                              selectedRecord.reviewerRemarks[reviewerId] === 'acceptable' ? 'bg-blue-100 text-blue-800' :
                              selectedRecord.reviewerRemarks[reviewerId] === 'acceptable-with-revision' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {selectedRecord.reviewerRemarks[reviewerId].split('-').map((word: string) => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                  {(!selectedRecord.reviewers || selectedRecord.reviewers.length === 0) && (
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

export default StaffPublished;