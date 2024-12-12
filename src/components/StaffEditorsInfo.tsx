import React, { useEffect, useState } from 'react';
import { UserPlus, X, User, Edit, Trash2 } from 'lucide-react';
import { Editor } from '../contexts/EditorsContext';
import {
	createEditor,
	deleteEditor,
	getEditors,
	updateEditor,
} from '../api/editor.api';

const StaffEditorsInfo: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [editingId, setEditingId] = useState<string>('');
	const [newEditor, setNewEditor] = useState({
		firstname: '',
		middlename: '',
		lastname: '',
		position: '',
		email: '',
		department: '',
		profileLink: '',
	});
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [editorToDelete, setEditorToDelete] = useState<string>('');
	const [showAddConfirmation, setShowAddConfirmation] = useState(false);
	const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

	const [editorsList, setEditorsList] = useState<Editor[]>([]);
	const [isEditMode, setIsEditMode] = useState(false);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setNewEditor({ ...newEditor, [name]: value });
	};

	const resetForm = () => {
		setNewEditor({
			firstname: '',
			middlename: '',
			lastname: '',
			position: '',
			email: '',
			department: '',
			profileLink: '',
		});
		setEditingId('');
	};

	const handleEdit = (editor: Editor) => {
		setIsEditMode(true);
		setNewEditor({
			firstname: editor.firstname,
			middlename: editor.middlename,
			lastname: editor.lastname,
			position: editor.position,
			email: editor.email,
			department: editor.department,
			profileLink: editor.profileLink,
		});

		setEditingId(editor._id);
		setIsModalOpen(true);
	};

	const handleSubmitEdit = () => {
		setShowUpdateConfirmation(true);
	};

	const confirmEdit = async () => {
		await updateEditor(editingId, {
			firstname: newEditor.firstname,
			middlename: newEditor.middlename,
			lastname: newEditor.lastname,
			position: newEditor.position,
			email: newEditor.email,
			department: newEditor.department,
			profileLink: newEditor.profileLink,
		}).then(() => {
			resetForm();
			setShowUpdateConfirmation(false);
			setIsModalOpen(false);
			getAllEditors();
		});
	};

	const handleDelete = (id: string) => {
		setEditorToDelete(id);
		setShowDeleteConfirmation(true);
	};

	const confirmDelete = async () => {
		await deleteEditor(editorToDelete).then(() => {
			setShowDeleteConfirmation(false);
			getAllEditors();
		});
	};

	const handleCreateNewEditor = async () => {
		setShowAddConfirmation(true);
	};

	const confirmAddNewEditor = async () => {
		await createEditor(newEditor).then(() => {
			resetForm();
			getAllEditors();
			setShowAddConfirmation(false);
			setIsModalOpen(false);
			setIsSuccessModalOpen(true);
		});
	};

	const getAllEditors = async () => {
		await getEditors().then((res) => {
			const editors = res.data;
			setEditorsList(editors);
		});
	};

	useEffect(() => {
		getAllEditors();
	}, []);

	return (
		<div className="editors-info-container">
			<div className="bg-white p-6 rounded-lg shadow-md">
				{editorsList.length === 0 ? (
					<p className="text-gray-500">No editors added yet.</p>
				) : (
					<div className="space-y-4">
						{editorsList.map((editor) => (
							<div
								key={editor._id}
								className="flex items-center bg-gray-100 p-4 rounded-lg"
							>
								<div className="flex-shrink-0 mr-4">
									<User size={40} className="text-gray-500" />
								</div>
								<div className="flex-grow">
									<h3 className="text-lg font-semibold">
										{`${editor.firstname} ${editor.middlename} ${editor.lastname}`}
									</h3>
									<p className="text-blue-600 font-medium">{editor.position}</p>
									<p className="text-gray-600">{editor.department}</p>
									<p className="text-gray-500">{editor.email}</p>
								</div>
								<div className="flex-shrink-0 space-x-2">
									<button
										title="edit-button"
										type="button"
										onClick={() => handleEdit(editor)}
										className="text-blue-500 hover:text-blue-700"
									>
										<Edit size={20} />
									</button>
									<button
										title="delete-button"
										type="button"
										onClick={() => handleDelete(editor._id)}
										className="text-red-500 hover:text-red-700"
									>
										<Trash2 size={20} />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
				<button
					className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
					onClick={() => {
						resetForm();
						setIsModalOpen(true);
					}}
				>
					<UserPlus className="mr-2" size={18} />
					Add Editor
				</button>
			</div>

			{/* Add/Edit Editor Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-96">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">
								{editingId ? 'Edit Editor' : 'Add Editor'}
							</h3>
							<button
								title="cancel-button"
								type="button"
								onClick={() => {
									setIsModalOpen(false);
									resetForm();
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div>
							<div className="mb-4">
								<input
									type="text"
									name="firstname"
									value={newEditor.firstname}
									onChange={handleInputChange}
									placeholder="First Name"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									required
								/>
							</div>
							<div className="mb-4">
								<input
									type="text"
									name="middlename"
									value={newEditor.middlename}
									onChange={handleInputChange}
									placeholder="Middle Name"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
								/>
							</div>
							<div className="mb-4">
								<input
									type="text"
									name="lastname"
									value={newEditor.lastname}
									onChange={handleInputChange}
									placeholder="Last Name"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									required
								/>
							</div>
							<div className="mb-4">
								<select
									title="position-select"
									name="position"
									value={newEditor.position}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									required
								>
									<option value="">Select Position</option>
									<option value="Chief Editor">Chief Editor</option>
									<option value="Assistant Editor">Assistant Editor</option>
									<option value="Director">Director</option>
								</select>
							</div>
							<div className="mb-4">
								<input
									type="email"
									name="email"
									value={newEditor.email}
									onChange={handleInputChange}
									placeholder="Email"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									required
								/>
							</div>
							<div className="mb-4">
								<input
									type="text"
									name="department"
									value={newEditor.department}
									onChange={handleInputChange}
									placeholder="Department"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									required
								/>
							</div>
							<div className="mb-4">
								<input
									type="url"
									name="profileLink"
									value={newEditor.profileLink}
									onChange={handleInputChange}
									placeholder="Profile Link (optional)"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
								/>
							</div>
							<button
								onClick={!isEditMode ? handleCreateNewEditor : handleSubmitEdit}
								className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
							>
								<UserPlus className="mr-2" size={18} />
								{isEditMode ? 'Update Editor' : 'Add Editor'}
							</button>
						</div>
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
									{isEditMode
										? 'Editor has been successfully updated.'
										: 'Editor has been successfully added.'}
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
									Are you sure you want to delete this editor?
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
										if (editorToDelete) {
											confirmDelete();
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

			{/* Add Confirmation Modal */}
			{showAddConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-4">Confirm Add Editor</h3>
							<div className="bg-white p-4 rounded-lg">
								<p className="text-gray-600">
									Are you sure you want to add this editor?
								</p>
								<div className="mt-2 text-sm text-gray-500">
									<p>
										Name: {newEditor.firstname} {newEditor.lastname}
									</p>
									<p>Position: {newEditor.position}</p>
									<p>Department: {newEditor.department}</p>
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
										confirmAddNewEditor();
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

			{/* Update Confirmation Modal */}
			{showUpdateConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-4">Confirm Update</h3>
							<div className="bg-white p-4 rounded-lg">
								<p className="text-gray-600">
									Are you sure you want to update this editor?
								</p>
								<div className="mt-2 text-sm text-gray-500">
									<p>
										Name: {newEditor.firstname} {newEditor.lastname}
									</p>
									<p>Position: {newEditor.position}</p>
									<p>Department: {newEditor.department}</p>
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
									onClick={confirmEdit}
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

export default StaffEditorsInfo;
