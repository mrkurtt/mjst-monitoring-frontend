import React, { useState } from 'react';
import { UserPlus, X, User, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useReviewers } from '../contexts/ReviewersContext';
import { useDashboard } from '../contexts/DashboardContext';

const StaffReviewersInfo: React.FC = () => {
  const { reviewers, addReviewer, removeReviewer, updateReviewer } = useReviewers();
  const { updateStats } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    affiliation: '',
    email: '',
    fieldOfExpertise: '',
    publicationsLink: '',
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [reviewerToDelete, setReviewerToDelete] = useState<number | null>(null);
  const [showAddConfirmation, setShowAddConfirmation] = useState(false);
  const [pendingReviewer, setPendingReviewer] = useState<any>(null);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      affiliation: '',
      email: '',
      fieldOfExpertise: '',
      publicationsLink: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReviewer = {
      ...formData,
      id: editingId || Date.now(),
    };
    
    if (editingId) {
      setPendingUpdate(newReviewer);
      setShowUpdateConfirmation(true);
    } else {
      setPendingReviewer(newReviewer);
      setShowAddConfirmation(true);
    }
  };

  const handleEdit = (reviewer: any) => {
    setFormData({
      firstName: reviewer.firstName,
      middleName: reviewer.middleName,
      lastName: reviewer.lastName,
      affiliation: reviewer.affiliation,
      email: reviewer.email,
      fieldOfExpertise: reviewer.fieldOfExpertise,
      publicationsLink: reviewer.publicationsLink,
    });
    setEditingId(reviewer.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setReviewerToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="staff-reviewers-info-container">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Reviewers List</h3>
          <button
            onClick={handleAddNew}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <UserPlus className="mr-2" size={18} />
            Add Reviewer
          </button>
        </div>
        
        {reviewers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviewers added yet.</p>
        ) : (
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
                  <p className="text-blue-600">{reviewer.fieldOfExpertise}</p>
                  <p className="text-gray-600">{reviewer.email}</p>
                  <p className="text-gray-500">{reviewer.affiliation}</p>
                </div>
                <div className="flex-shrink-0 space-x-2">
                  <button 
                    onClick={() => handleEdit(reviewer)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(reviewer.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                  {reviewer.publicationsLink && (
                    <a
                      href={reviewer.publicationsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-700 p-1"
                      title="View Publications"
                    >
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Reviewer' : 'Add New Reviewer'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affiliation
                </label>
                <input
                  type="text"
                  name="affiliation"
                  value={formData.affiliation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field of Expertise
                </label>
                <input
                  type="text"
                  name="fieldOfExpertise"
                  value={formData.fieldOfExpertise}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publications Link
                </label>
                <input
                  type="url"
                  name="publicationsLink"
                  value={formData.publicationsLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <UserPlus className="mr-2" size={18} />
                {editingId ? 'Update Reviewer' : 'Add Reviewer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Success!</h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  {editingId ? 'Reviewer has been successfully updated.' : 'Reviewer has been successfully added.'}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  Are you sure you want to delete this reviewer?
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    if (reviewerToDelete) {
                      removeReviewer(reviewerToDelete);
                      updateStats();
                      setShowDeleteConfirmation(false);
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Confirm Add Reviewer</h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  Are you sure you want to add this reviewer?
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Name: {formData.firstName} {formData.lastName}</p>
                  <p>Field: {formData.fieldOfExpertise}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddConfirmation(false)}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    if (pendingReviewer) {
                      addReviewer(pendingReviewer);
                      updateStats();
                      setShowAddConfirmation(false);
                      setIsModalOpen(false);
                      setIsSuccessModalOpen(true);
                      resetForm();
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Confirm Update</h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  Are you sure you want to update this reviewer?
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Name: {formData.firstName} {formData.lastName}</p>
                  <p>Field: {formData.fieldOfExpertise}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setShowUpdateConfirmation(false)}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    if (pendingUpdate && editingId) {
                      updateReviewer(editingId, pendingUpdate);
                      updateStats();
                      setShowUpdateConfirmation(false);
                      setIsModalOpen(false);
                      setIsSuccessModalOpen(true);
                      resetForm();
                    }
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffReviewersInfo;