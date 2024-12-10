import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';

const DirectorPreReview: React.FC = () => {
  const { manuscriptRecords } = useRecords();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = manuscriptRecords.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (manuscript: any) => {
    setSelectedManuscript(manuscript);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Pre-Review Records</h3>
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
      {isModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manuscript Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block">File Code:</label>
                <p className="text-gray-700">{selectedManuscript.scopeCode}</p>
              </div>
              <div>
                <label className="font-semibold block">Manuscript Title:</label>
                <p className="text-gray-700">{selectedManuscript.title}</p>
              </div>
              <div>
                <label className="font-semibold block">Author/s:</label>
                <p className="text-gray-700">{selectedManuscript.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Scope:</label>
                <p className="text-gray-700">{`${selectedManuscript.scopeType.charAt(0).toUpperCase() + selectedManuscript.scopeType.slice(1)} ${selectedManuscript.scope}`}</p>
              </div>
              <div>
                <label className="font-semibold block">Date:</label>
                <p className="text-gray-700">{selectedManuscript.date}</p>
              </div>
              <div>
                <label className="font-semibold block">Email:</label>
                <p className="text-gray-700">{selectedManuscript.email}</p>
              </div>
              <div>
                <label className="font-semibold block">Affiliation:</label>
                <p className="text-gray-700">{selectedManuscript.affiliation}</p>
              </div>
              <div>
                <label className="font-semibold block">Editor:</label>
                <p className="text-gray-700">{selectedManuscript.editor}</p>
              </div>
              {selectedManuscript.revisionStatus && (
                <div>
                  <label className="font-semibold block">Revision Status:</label>
                  <p className="text-gray-700">{selectedManuscript.revisionStatus}</p>
                </div>
              )}
              {selectedManuscript.reviewers && selectedManuscript.reviewers.length > 0 && (
                <div>
                  <label className="font-semibold block">Reviewers:</label>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedManuscript.reviewers.map((reviewer: string, index: number) => (
                      <li key={index}>{reviewer}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <label className="font-semibold block mb-2">Scores:</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Grammar Score:</span>
                    <div className={`mt-1 text-sm ${
                      selectedManuscript.grammarScore >= 85 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {selectedManuscript.grammarScore}% ({selectedManuscript.grammarScore >= 85 ? 'Passed' : 'Failed'})
                      <div className="text-gray-500 text-xs">Passing score: 85%</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Plagiarism Score:</span>
                    <div className={`mt-1 text-sm ${
                      selectedManuscript.plagiarismScore <= 15 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {selectedManuscript.plagiarismScore}% ({selectedManuscript.plagiarismScore <= 15 ? 'Passed' : 'Failed'})
                      <div className="text-gray-500 text-xs">Threshold: 15%</div>
                    </div>
                  </div>
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

export default DirectorPreReview;