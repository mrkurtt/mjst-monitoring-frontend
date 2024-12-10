import React, { useState, useRef } from 'react';
import { Upload, Search, X, Eye, Trash2 } from 'lucide-react';
import { useEditors } from '../contexts/EditorsContext';
import { useRecords } from '../contexts/RecordContext';
import { useDashboard } from '../contexts/DashboardContext';

interface ManuscriptDetails {
  id: string;
  title: string;
  authors: string;
  scope: string;
  scopeType: 'internal' | 'external';
  scopeCode: string;
  date: string;
  email: string;
  affiliation: string;
  editor: string;
  status: 'pre-review' | 'double-blind' | 'rejected';
  grammarScore: number;
  plagiarismScore: number;
}

const scopeCounters: { [key: string]: number } = {
  EA: 1087,
  IA: 905,
  ECBE: 1285,
  ICBE: 942,
  EECT: 1458,
  IECT: 1009,
  EMSP: 977,
  IMSP: 914,
  ORS: 1160,
};

export const SCOPE_OPTIONS = [
  { code: 'EA', name: 'Agriculture', type: 'external', baseNumber: 1087 },
  { code: 'IA', name: 'Agriculture', type: 'internal', baseNumber: 905 },
  { code: 'ECBE', name: 'Chemistry Biology Environmental Science', type: 'external', baseNumber: 1285 },
  { code: 'ICBE', name: 'Chemistry Biology Environmental Science', type: 'internal', baseNumber: 942 },
  { code: 'EECT', name: 'Engineering, Communication, Technology', type: 'external', baseNumber: 1458 },
  { code: 'IECT', name: 'Engineering, Communication, Technology', type: 'internal', baseNumber: 1009 },
  { code: 'EMSP', name: 'Mathematics, Statistics, and Physics', type: 'external', baseNumber: 977 },
  { code: 'IMSP', name: 'Mathematics, Statistics, and Physics', type: 'internal', baseNumber: 914 },
  { code: 'ORS', name: 'Other Related Studies', type: 'other', baseNumber: 1160 },
];

const StaffUpload: React.FC = () => {
  const { editors } = useEditors();
  const { addManuscript } = useRecords();
  const { updateStats } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [manuscriptDetails, setManuscriptDetails] = useState<ManuscriptDetails>({
    id: '',
    title: '',
    authors: '',
    scope: '',
    scopeType: 'external',
    scopeCode: '',
    date: '',
    email: '',
    affiliation: '',
    editor: '',
    status: 'pre-review',
    grammarScore: 0,
    plagiarismScore: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scopeCheckResult, setScopeCheckResult] = useState('');
  const [grammarCheckResult, setGrammarCheckResult] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [showRemoveSuccess, setShowRemoveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManuscriptDetails({ ...manuscriptDetails, [name]: value });
  };

  const generateScopeId = (scopeCode: string): string => {
    const scopePrefix = scopeCode.split('-')[0];
    scopeCounters[scopePrefix] = (scopeCounters[scopePrefix] || 1000) + 1;
    return `${scopePrefix}${scopeCounters[scopePrefix]}`;
  };

  const handleScopeChange = (scopeCode: string) => {
    const [prefix] = scopeCode.split('-');
    const selectedScope = SCOPE_OPTIONS.find(option => option.code === prefix);
    if (selectedScope) {
      const newScopeId = generateScopeId(prefix);
      setManuscriptDetails({
        ...manuscriptDetails,
        scopeCode: newScopeId,
        scope: selectedScope.name,
        scopeType: selectedScope.type as 'internal' | 'external'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newManuscript = {
      ...manuscriptDetails,
      id: manuscriptDetails.scopeCode,
      status: 'pre-review' as const,
      date: currentDate,
      grammarScore: manuscriptDetails.grammarScore || 0,
      plagiarismScore: manuscriptDetails.plagiarismScore || 0,
      editor: manuscriptDetails.editor || '',
      staffUpload: {
        dateSubmitted: currentDate,
        fieldScope: `${manuscriptDetails.scopeType} ${manuscriptDetails.scope}`
      },
    };

    addManuscript(newManuscript);
    updateStats();
    setIsConfirmModalOpen(false);
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    setManuscriptDetails({
      id: '',
      title: '',
      authors: '',
      scope: '',
      scopeType: 'external',
      scopeCode: '',
      date: '',
      email: '',
      affiliation: '',
      editor: '',
      status: 'pre-review',
      grammarScore: 0,
      plagiarismScore: 0,
    });
    setSelectedFile(null);
  };

  const handleScopeCheck = () => {
    setScopeCheckResult('Checking scope compatibility...\nField: Environmental Science\nStatus: Compatible\nRecommendation: Proceed with submission');
  };

  const handleGrammarCheck = () => {
    setGrammarCheckResult('Grammar check complete...\nSpelling: 100%\nGrammar: 98%\nReadability: High\nSuggested improvements: 2 minor edits');
  };

  const handlePreviewClick = () => {
    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(fileUrl);
      setShowPreview(true);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setFilePreviewUrl(null);
  };

  const handleRemoveFile = () => {
    setShowRemoveConfirmation(true);
  };

  const confirmRemoveFile = () => {
    setSelectedFile(null);
    setShowRemoveConfirmation(false);
    setShowRemoveSuccess(true);
    setTimeout(() => {
      setShowRemoveSuccess(false);
    }, 2000);
  };

  const isFormComplete = () => {
    return (
      manuscriptDetails.title.trim() !== '' &&
      manuscriptDetails.authors.trim() !== '' &&
      manuscriptDetails.scopeCode !== '' &&
      manuscriptDetails.date !== '' &&
      manuscriptDetails.email.trim() !== '' &&
      manuscriptDetails.affiliation.trim() !== '' &&
      manuscriptDetails.editor !== '' &&
      manuscriptDetails.grammarScore > 0 &&
      manuscriptDetails.plagiarismScore > 0
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Upload File</h3>
      <div className="mb-6 flex justify-center">
        <div 
          className="w-full max-w-md p-8 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all"
          onClick={handleUploadClick}
        >
          <div className="p-4 bg-blue-200 rounded-full mb-4">
            <Upload size={32} className="text-blue-600" />
          </div>
          <span className="text-lg font-medium text-blue-800 mb-2">Click to upload your file</span>
          <p className="text-sm text-blue-600">
            Supported formats: <span className="font-semibold">PDF</span> or <span className="font-semibold">DOCX</span>
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="hidden"
          />
        </div>
      </div>
      {selectedFile && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="text-blue-600" size={20} />
              </div>
              <div>
                <span className="font-medium text-blue-900">{selectedFile.name}</span>
                <p className="text-sm text-blue-600">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePreviewClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition-all shadow-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleRemoveFile}
                className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md flex items-center hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[95vw] h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">File Preview</h3>
              <button 
                onClick={closePreview} 
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-2">
              {filePreviewUrl && (
                <iframe
                  src={filePreviewUrl}
                  className="w-full h-full border-0"
                  title="File Preview"
                  style={{ minHeight: "85vh" }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Remove File</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this file?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRemoveConfirmation(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveFile}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Success Message */}
      {showRemoveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          File successfully removed
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <Search className="mr-2" size={20} />
            Scope Check result:
          </h4>
          <div className="h-64 bg-white rounded p-3 mb-2 overflow-y-auto whitespace-pre-line text-base">
            {scopeCheckResult || 'No scope check performed yet'}
          </div>
          <button
            onClick={handleScopeCheck}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
          >
            Perform Scope Check
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <Search className="mr-2" size={20} />
            Grammar check results:
          </h4>
          <div className="h-64 bg-white rounded p-3 mb-2 overflow-y-auto whitespace-pre-line text-base">
            {grammarCheckResult || 'No grammar check performed yet'}
          </div>
          <button
            onClick={handleGrammarCheck}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
          >
            Perform Grammar Check
          </button>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button
          className={`px-8 py-3 rounded-lg transition-colors text-lg font-medium ${
            selectedFile 
              ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => {
            if (selectedFile) {
              setIsModalOpen(true);
            }
          }}
          disabled={!selectedFile}
        >
          {selectedFile ? 'Proceed' : 'Upload a file to proceed'}
        </button>
      </div>

      {/* Add Manuscript Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manuscript Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="title"
                  value={manuscriptDetails.title}
                  onChange={handleInputChange}
                  placeholder="Manuscript Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="authors"
                  value={manuscriptDetails.authors}
                  onChange={handleInputChange}
                  placeholder="Author/s"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope or Field</label>
                <div className="space-y-2">
                  {SCOPE_OPTIONS.map((option) => (
                    <div key={option.code} className="flex items-center">
                      <input
                        type="radio"
                        id={option.code}
                        name="scopeCode"
                        value={`${option.code}-${option.type}`}
                        checked={manuscriptDetails.scopeCode.startsWith(option.code)}
                        onChange={(e) => handleScopeChange(e.target.value)}
                        className="mr-2"
                      />
                      <label htmlFor={option.code} className="text-sm text-gray-700">
                        {`${option.code} - ${option.type.charAt(0).toUpperCase() + option.type.slice(1)} ${option.name}`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Grammar Score</label>
                <input
                  type="number"
                  name="grammarScore"
                  value={manuscriptDetails.grammarScore}
                  onChange={handleInputChange}
                  placeholder="Enter Grammar Score"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Plagiarism Test Score</label>
                <input
                  type="number"
                  name="plagiarismScore"
                  value={manuscriptDetails.plagiarismScore}
                  onChange={handleInputChange}
                  placeholder="Enter Plagiarism Test Score"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Submitted</label>
                <input
                  type="date"
                  name="date"
                  value={manuscriptDetails.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  value={manuscriptDetails.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="affiliation"
                  value={manuscriptDetails.affiliation}
                  onChange={handleInputChange}
                  placeholder="Affiliation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Editor</label>
                <select
                  name="editor"
                  value={manuscriptDetails.editor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Editor</option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={`${editor.firstName} ${editor.lastName}`}>
                      {`${editor.firstName} ${editor.lastName} - ${editor.position} (${editor.department})`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isFormComplete()}
                className={`w-full py-3 rounded-lg transition-all duration-200 font-medium ${
                  isFormComplete()
                    ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Confirm Submission</h3>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">Are you sure you want to submit this manuscript?</p>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800">{manuscriptDetails.title}</h4>
                <p className="text-sm text-gray-600 mt-1">Authors: {manuscriptDetails.authors}</p>
                <p className="text-sm text-gray-600">Scope: {manuscriptDetails.scope}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleConfirmSubmit();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with improved design */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Success!</h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  The manuscript has been successfully moved to prereview records review.
                </p>
              </div>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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

export default StaffUpload;