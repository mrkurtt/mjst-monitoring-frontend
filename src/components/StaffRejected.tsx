import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';

const StaffRejected: React.FC = () => {
  const { rejectedRecords } = useRecords();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Generate year options from 2025 to 2100
  const yearOptions = Array.from({ length: 76 }, (_, i) => (2025 + i).toString());

  const filteredRecords = rejectedRecords.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = selectedYear === 'all' || 
      new Date(record.date).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesYear;
  });

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleViewComments = (record: any) => {
    setSelectedRecord(record);
    setIsCommentsModalOpen(true);
  };

  return (
    <div className="staff-rejected-container">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Rejected Records</h3>
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
                <th className="py-3 px-4 text-left">Date Rejected</th>
                <th className="py-3 px-4 text-left">Rejection Reason</th>
                <th className="py-3 px-4 text-left">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-4">{record.scopeCode}</td>
                  <td className="py-4 px-4">{record.title}</td>
                  <td className="py-4 px-4">{`${record.scopeType.charAt(0).toUpperCase() + record.scopeType.slice(1)} ${record.scope}`}</td>
                  <td className="py-4 px-4">{record.date}</td>
                  <td className="py-4 px-4">{record.rejectionReason}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleViewComments(record)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      View Comments
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedRecord && (
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
                <label className="font-semibold block">Manuscript Title:</label>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>
              <div>
                <label className="font-semibold block">File Code:</label>
                <p className="text-gray-700">{selectedRecord.scopeCode}</p>
              </div>
              <div>
                <label className="font-semibold block">Author/s:</label>
                <p className="text-gray-700">{selectedRecord.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Scope:</label>
                <p className="text-gray-700">{`${selectedRecord.scopeType.charAt(0).toUpperCase() + selectedRecord.scopeType.slice(1)} ${selectedRecord.scope}`}</p>
              </div>
              <div>
                <label className="font-semibold block">Date Rejected:</label>
                <p className="text-gray-700">{selectedRecord.date}</p>
              </div>
              <div>
                <label className="font-semibold block">Rejection Reason:</label>
                <p className="text-gray-700">{selectedRecord.rejectionReason}</p>
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

      {/* Comments Modal */}
      {isCommentsModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Rejection Comments</h3>
              <button onClick={() => setIsCommentsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block">Manuscript Title:</label>
                <p className="text-gray-700">{selectedRecord.title}</p>
              </div>
              <div>
                <label className="font-semibold block">Author/s:</label>
                <p className="text-gray-700">{selectedRecord.authors}</p>
              </div>
              <div>
                <label className="font-semibold block">Rejection Reason:</label>
                <p className="text-gray-700">{selectedRecord.rejectionReason}</p>
              </div>
              <div>
                <label className="font-semibold block">Additional Comments:</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {selectedRecord.rejectionComment ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedRecord.rejectionComment}</p>
                  ) : (
                    <p className="text-gray-500 italic">No additional comments provided</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCommentsModalOpen(false)}
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

export default StaffRejected;