import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';

const StaffAccepted: React.FC = () => {
  const { acceptedRecords, updateLayoutDetails } = useRecords();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutDetails, setLayoutDetails] = useState({
    dateSent: '',
    layoutCompletionDate: '',
    layoutArtist: '',
  });

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

  const handleLayoutClick = (manuscript: any) => {
    setSelectedManuscript(manuscript);
    setLayoutDetails({
      dateSent: new Date().toISOString().split('T')[0],
      layoutCompletionDate: '',
      layoutArtist: '',
    });
    setIsLayoutModalOpen(true);
  };

  const handleLayoutSubmit = () => {
    if (selectedManuscript && layoutDetails.dateSent && layoutDetails.layoutCompletionDate && layoutDetails.layoutArtist) {
      updateLayoutDetails(selectedManuscript.id, {
        ...layoutDetails,
        status: 'in-progress'
      });
      setIsLayoutModalOpen(false);
      setLayoutDetails({
        dateSent: '',
        layoutCompletionDate: '',
        layoutArtist: '',
      });
    }
  };

  const layoutArtists = [
    'John Smith',
    'Maria Garcia',
    'David Chen',
    'Sarah Johnson',
    'Michael Brown'
  ];

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
              <th className="py-3 px-4 text-left">Issue #</th>
              <th className="py-3 px-4 text-left">Volume</th>
              <th className="py-3 px-4 text-left">Date Accepted</th>
              <th className="py-3 px-4 text-left">Authors</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-4">{record.scopeCode}</td>
                <td className="py-4 px-4">{record.title}</td>
                <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                <td className="py-4 px-4">{record.issueNumber}</td>
                <td className="py-4 px-4">{record.volumeNumber}</td>
                <td className="py-4 px-4">{record.dateAccepted}</td>
                <td className="py-4 px-4">{record.authors}</td>
                <td className="py-4 px-4 space-x-2">
                  <button
                    onClick={() => handleViewDetails(record)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center inline-flex"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                  {!record.layoutDetails && (
                    <button
                      onClick={() => handleLayoutClick(record)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                    >
                      Layout
                    </button>
                  )}
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
                <label className="font-semibold block">Issue Number:</label>
                <p className="text-gray-700">{selectedManuscript.issueNumber}</p>
              </div>
              <div>
                <label className="font-semibold block">Volume:</label>
                <p className="text-gray-700">{selectedManuscript.volumeNumber}</p>
              </div>
              <div>
                <label className="font-semibold block">Date Accepted:</label>
                <p className="text-gray-700">{selectedManuscript.dateAccepted}</p>
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
                <label className="font-semibold block">Assistant Editor:</label>
                <p className="text-gray-700">{selectedManuscript.assistantEditor}</p>
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

      {/* Layout Modal */}
      {isLayoutModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Layout Details</h3>
              <button onClick={() => setIsLayoutModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block">File Code:</label>
                <p className="text-gray-700">{selectedManuscript.scopeCode}</p>
              </div>
              <div>
                <label className="font-semibold block">Journal/Research Title:</label>
                <p className="text-gray-700">{selectedManuscript.title}</p>
              </div>
              <div>
                <label className="font-semibold block">Field/Scope:</label>
                <p className="text-gray-700">{`${selectedManuscript.scopeType.charAt(0).toUpperCase() + selectedManuscript.scopeType.slice(1)} ${selectedManuscript.scope}`}</p>
              </div>
              <div>
                <label className="font-semibold block">Authors:</label>
                <p className="text-gray-700">{selectedManuscript.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Affiliation:</label>
                <p className="text-gray-700">{selectedManuscript.affiliation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Sent
                </label>
                <input
                  type="date"
                  value={layoutDetails.dateSent}
                  onChange={(e) => setLayoutDetails({ ...layoutDetails, dateSent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  value={layoutDetails.layoutCompletionDate}
                  onChange={(e) => setLayoutDetails({ ...layoutDetails, layoutCompletionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout Artist
                </label>
                <select
                  value={layoutDetails.layoutArtist}
                  onChange={(e) => setLayoutDetails({ ...layoutDetails, layoutArtist: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Layout Artist</option>
                  {layoutArtists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsLayoutModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLayoutSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                disabled={!layoutDetails.dateSent || !layoutDetails.layoutCompletionDate || !layoutDetails.layoutArtist}
              >
                Proceed to Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAccepted;