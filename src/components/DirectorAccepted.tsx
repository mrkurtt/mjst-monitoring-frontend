import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';

const DirectorAccepted: React.FC = () => {
  const { acceptedRecords } = useRecords();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = acceptedRecords.filter(record => 
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
      <h3 className="text-xl font-semibold mb-4">Accepted Records</h3>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">File Code</th>
              <th className="py-3 px-4 text-left">Journal/Research Title</th>
              <th className="py-3 px-4 text-left">Field/Scope</th>
              <th className="py-3 px-4 text-left">Date Accepted</th>
              <th className="py-3 px-4 text-left">Authors</th>
              <th className="py-3 px-4 text-left">Layout Artist</th>
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
                <td className="py-4 px-4">{record.layoutDetails?.dateAccepted}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4">{record.layoutDetails?.layoutArtist}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.layoutDetails?.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : record.layoutDetails?.status === 'revised'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {record.layoutDetails?.status === 'completed' 
                      ? 'Completed' 
                      : record.layoutDetails?.status === 'revised'
                      ? 'Revised'
                      : 'In Progress'}
                  </span>
                  {record.layoutDetails?.revisionStatus && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {record.layoutDetails.revisionStatus}
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
                <label className="font-semibold block">Field/Scope:</label>
                <p className="text-gray-700">{`${selectedManuscript.scopeType.charAt(0).toUpperCase() + selectedManuscript.scopeType.slice(1)} ${selectedManuscript.scope}`}</p>
              </div>
              <div>
                <label className="font-semibold block">Date Accepted:</label>
                <p className="text-gray-700">{selectedManuscript.layoutDetails?.dateAccepted}</p>
              </div>
              <div>
                <label className="font-semibold block">Layout Artist:</label>
                <p className="text-gray-700">{selectedManuscript.layoutDetails?.layoutArtist}</p>
              </div>
              <div>
                <label className="font-semibold block">Status:</label>
                <p className="text-gray-700 capitalize">{selectedManuscript.layoutDetails?.status}</p>
                {selectedManuscript.layoutDetails?.revisionStatus && (
                  <p className="text-blue-600 mt-1">{selectedManuscript.layoutDetails.revisionStatus}</p>
                )}
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

export default DirectorAccepted;