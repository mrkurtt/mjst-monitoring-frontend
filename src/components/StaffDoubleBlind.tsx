import React, { useState, useEffect } from 'react';
import { Eye, X, FileEdit, Bell } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import {
	ManuscriptDetails,
	Status,
	UpdateDetails,
} from '../contexts/RecordContext';
import ScoresDisplay from './shared/ScoresDisplay';
import { getManuscriptByStepStatus } from '../api/manuscript.api';

interface ExtendedManuscriptDetails extends ManuscriptDetails {
	firstRevisionDate?: string;
	revisionComments?: string;
	reviewerRemarks?: { [reviewerId: string]: string };
}

const StaffDoubleBlind: React.FC = () => {
	const { doubleBlindRecords, updateManuscriptStatus } = useRecords();
	const { reviewers } = useReviewers();
	const [searchTerm, setSearchTerm] = useState('');
	const [modalState, setModalState] = useState<{
		isModalOpen: boolean;
		isRejectModalOpen: boolean;
		isLayoutModalOpen: boolean;
		isReviseModalOpen: boolean;
		isLayoutConfirmModalOpen: boolean;
		isStatusModalOpen: boolean;
		isUpdateReviewersModalOpen: boolean;
	}>({
		isModalOpen: false,
		isRejectModalOpen: false,
		isLayoutModalOpen: false,
		isReviseModalOpen: false,
		isLayoutConfirmModalOpen: false,
		isStatusModalOpen: false,
		isUpdateReviewersModalOpen: false,
	});
	const [selectedManuscript, setSelectedManuscript] =
		useState<ExtendedManuscriptDetails | null>(null);
	const [layoutArtist, setLayoutArtist] = useState('');
	const [layoutArtistEmail, setLayoutArtistEmail] = useState('');
	const [revisionComments, setRevisionComments] = useState('');
	const [revisionDate, setRevisionDate] = useState('');
	const [rejectionComments, setRejectionComments] = useState('');
	const [firstRevisionDate, setFirstRevisionDate] = useState<string | null>(
		null
	);
	const [layoutArtistError, setLayoutArtistError] = useState('');
	const [layoutArtistEmailError, setLayoutArtistEmailError] = useState('');
	const [reviewerRemarks, setReviewerRemarks] = useState<{
		[reviewerId: string]: string;
	}>({});
	const [isUpdateReviewersModalOpen, setIsUpdateReviewersModalOpen] =
		useState(false);
	const [updatedReviewers, setUpdatedReviewers] = useState<string[]>([]);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
	const [pendingReject, setPendingReject] =
		useState<ExtendedManuscriptDetails | null>(null);
	const [isRejectFormValid, setIsRejectFormValid] = useState(false);
	const [isReviseFormValid, setIsReviseFormValid] = useState(false);

	useEffect(() => {
		setIsRejectFormValid(rejectionComments.trim() !== '');
	}, [rejectionComments]);

	useEffect(() => {
		const isValid =
			revisionComments.trim() !== '' && revisionDate.trim() !== '';
		setIsReviseFormValid(isValid);
	}, [revisionComments, revisionDate]);

	const validateEmail = (email: string) => {
		if (!email) return 'Layout artist email is required.';
		if (!email.includes('@')) return 'Email must contain @ symbol.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return 'Please enter a valid email address.';
		return '';
	};

	const handleLayoutArtistEmailChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const email = e.target.value;
		setLayoutArtistEmail(email);
		setLayoutArtistEmailError(validateEmail(email));
	};

	const handleLayoutArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		setLayoutArtist(name);
		setLayoutArtistError(name ? '' : 'Layout artist name is required.');
	};

	const handleProceedToLayout = () => {
		try {
			if (selectedManuscript) {
				const acceptedManuscript: Partial<ManuscriptDetails> = {
					...selectedManuscript,
					status: 'accepted' as const,
					layoutDetails: {
						layoutArtist,
						layoutArtistEmail,
						status: 'pending' as const,
						dateAssigned: new Date().toISOString().split('T')[0],
					},
					reviewerRemarks,
				};

				updateManuscriptStatus(
					selectedManuscript.id,
					'accepted',
					acceptedManuscript
				);

				// Show success modal instead of alert
				setIsSuccessModalOpen(true);

				// Reset form fields
				setLayoutArtist('');
				setLayoutArtistEmail('');
				setLayoutArtistError('');
				setLayoutArtistEmailError('');
				closeAllModals();
			}
		} catch (error) {
			console.error('Error updating manuscript status:', error);
			alert('An error occurred while updating the manuscript status.');
		}
	};

	const filteredRecords = doubleBlindRecords.filter(
		(record) =>
			record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const closeAllModals = () => {
		setModalState({
			isModalOpen: false,
			isRejectModalOpen: false,
			isLayoutModalOpen: false,
			isReviseModalOpen: false,
			isLayoutConfirmModalOpen: false,
			isStatusModalOpen: false,
			isUpdateReviewersModalOpen: false,
		});
	};

	const handleViewDetails = (manuscript: ManuscriptDetails) => {
		setSelectedManuscript(manuscript as ExtendedManuscriptDetails);
		setModalState((prev) => ({ ...prev, isModalOpen: true }));
	};

	const handleProceedToLayoutConfirm = () => {
		setModalState((prev) => ({
			...prev,
			isLayoutModalOpen: false,
			isLayoutConfirmModalOpen: true,
		}));
	};

	const handleRevise = () => {
		if (selectedManuscript && revisionComments && revisionDate) {
			try {
				const updatedManuscript: UpdateDetails = {
					status: 'double-blind',
					revisionStatus: 'For Revision',
					revisionComments,
					revisionDate: revisionDate,
					firstRevisionDate:
						selectedManuscript.firstRevisionDate || revisionDate,
				};
				updateManuscriptStatus(
					selectedManuscript.id,
					'double-blind',
					updatedManuscript
				);
				closeAllModals();
				setRevisionComments('');
				setRevisionDate('');
			} catch (error) {
				console.error('Error updating manuscript status:', error);
			}
		}
	};

	const handleReject = () => {
		if (selectedManuscript && rejectionComments) {
			setPendingReject(selectedManuscript);
			setShowRejectConfirmation(true);
		}
	};

	const handleUpdateReviewers = () => {
		if (selectedManuscript && updatedReviewers.filter((r) => r).length >= 2) {
			const updatedManuscript = {
				...selectedManuscript,
				reviewers: updatedReviewers.filter((r) => r),
			};

			updateManuscriptStatus(
				selectedManuscript.id,
				selectedManuscript.status,
				updatedManuscript
			);

			setIsUpdateReviewersModalOpen(false);
			closeAllModals();
		}
	};

	const isLayoutFormComplete = () => {
		return (
			layoutArtist.trim() !== '' &&
			layoutArtistEmail.trim() !== '' &&
			validateEmail(layoutArtistEmail) === ''
		);
	};

	const [manuscripts, setManuscripts] = useState([]);

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Double-Blind').then((res) => {
			setManuscripts(res.data);
		});
	};

	useEffect(() => {
		getManuscripts();
	}, []);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-xl font-semibold mb-4">Double-Blind Records</h3>
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
							<th className="py-3 px-4 text-left">Status</th>
							<th className="py-3 px-4 text-left">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{manuscripts.map((record, index) => (
							<tr key={index} className="hover:bg-gray-50">
								<td className="py-4 px-4">{record.scopeCode}</td>
								<td className="py-4 px-4">{record.title}</td>
								<td className="py-4 px-4">{`${
									record.scopeType.charAt(0).toUpperCase() +
									record.scopeType.slice(1)
								} ${record.scope}`}</td>
								<td className="py-4 px-4">{record.date}</td>
								<td className="py-4 px-4">{record.authors}</td>
								<td className="py-4 px-4">
									<div className="flex flex-col space-y-2">
										<span
											className={`px-2 py-1 rounded-full text-sm ${
												record.revisionStatus === 'For Revision'
													? 'bg-yellow-100 text-yellow-800'
													: record.revisionStatus === 'Rejected'
													? 'bg-red-100 text-red-800'
													: 'bg-blue-100 text-blue-800'
											}`}
										>
											{record.revisionStatus || 'In Progress'}
										</span>
										{(record.revisionComments || record.rejectionComment) && (
											<button
												onClick={() => {
													setSelectedManuscript(record);
													setModalState((prev) => ({
														...prev,
														isStatusModalOpen: true,
													}));
												}}
												className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-200 transition-colors"
											>
												View Status
											</button>
										)}
									</div>
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
			{modalState.isModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Manuscript Details</h3>
							<button
								onClick={() => closeAllModals()}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="flex gap-6">
							<div className="flex-1 space-y-4">
								<div>
									<label className="font-semibold block">File Code:</label>
									<p className="text-gray-700">
										{selectedManuscript.scopeCode}
									</p>
								</div>
								<div>
									<label className="font-semibold block">
										Manuscript Title:
									</label>
									<p className="text-gray-700">{selectedManuscript.title}</p>
								</div>
								<div>
									<label className="font-semibold block">Author/s:</label>
									<p className="text-gray-700">{selectedManuscript.authors}</p>
								</div>
								<div>
									<label className="font-semibold block">Affiliation:</label>
									<p className="text-gray-700">
										{selectedManuscript.affiliation}
									</p>
								</div>
								<div>
									<label className="font-semibold block">Scope:</label>
									<p className="text-gray-700">{`${
										selectedManuscript.scopeType.charAt(0).toUpperCase() +
										selectedManuscript.scopeType.slice(1)
									} ${selectedManuscript.scope}`}</p>
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
									<label className="font-semibold block">Editor:</label>
									<p className="text-gray-700">{selectedManuscript.editor}</p>
								</div>
								<div>
									<label className="font-semibold block mb-2">Scores:</label>
									<ScoresDisplay manuscript={selectedManuscript} />
								</div>
							</div>

							<div className="w-[350px] border-l pl-6">
								<div className="flex justify-between items-center mb-4">
									<h4 className="text-lg font-semibold">Assigned Reviewers</h4>
									<button
										onClick={() => {
											setUpdatedReviewers(selectedManuscript.reviewers || []);
											setIsUpdateReviewersModalOpen(true);
											setModalState((prev) => ({
												...prev,
												isModalOpen: false,
											}));
										}}
										className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
									>
										<FileEdit size={16} className="mr-1" />
										Update Reviewers
									</button>
								</div>
								<div className="space-y-4">
									{selectedManuscript.reviewers?.map(
										(reviewerId: string, index: number) => {
											const reviewer = reviewers.find(
												(r) => r.id.toString() === reviewerId
											);
											return reviewer ? (
												<div
													key={index}
													className="bg-white p-4 rounded-lg shadow border border-gray-200"
												>
													<div className="flex flex-col">
														<div className="flex justify-between items-start mb-3">
															<div>
																<p className="font-medium text-gray-800">
																	{reviewer.firstName} {reviewer.middleName}{' '}
																	{reviewer.lastName}
																</p>
																<p className="text-gray-600 text-sm">
																	{reviewer.email}
																</p>
																<p className="text-gray-600 text-sm">
																	Expertise: {reviewer.fieldOfExpertise}
																</p>
															</div>
															<span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
																Reviewer {index + 1}
															</span>
														</div>

														<div className="mt-2">
															<label className="block text-sm font-medium text-gray-700 mb-2">
																Remarks
															</label>
															<select
																value={reviewerRemarks[reviewerId] || ''}
																onChange={(e) => {
																	setReviewerRemarks((prev) => ({
																		...prev,
																		[reviewerId]: e.target.value,
																	}));
																}}
																className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
															>
																<option value="">Select Remarks</option>
																<option value="excellent">Excellent</option>
																<option value="acceptable">Acceptable</option>
																<option value="acceptable-with-revision">
																	Acceptable with Revision
																</option>
																<option value="not-acceptable">
																	Not Acceptable
																</option>
															</select>

															{reviewerRemarks[reviewerId] && (
																<div className="mt-3">
																	<span
																		className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
																			reviewerRemarks[reviewerId] ===
																			'excellent'
																				? 'bg-green-100 text-green-800'
																				: reviewerRemarks[reviewerId] ===
																				  'acceptable'
																				? 'bg-blue-100 text-blue-800'
																				: reviewerRemarks[reviewerId] ===
																				  'acceptable-with-revision'
																				? 'bg-yellow-100 text-yellow-800'
																				: 'bg-red-100 text-red-800'
																		}`}
																	>
																		{reviewerRemarks[reviewerId]
																			.split('-')
																			.map(
																				(word) =>
																					word.charAt(0).toUpperCase() +
																					word.slice(1)
																			)
																			.join(' ')}
																	</span>
																</div>
															)}
														</div>
													</div>
												</div>
											) : null;
										}
									)}
									{(!selectedManuscript.reviewers ||
										selectedManuscript.reviewers.length === 0) && (
										<p className="text-gray-500 italic">
											No reviewers assigned
										</p>
									)}
								</div>
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => {
									closeAllModals();
									setModalState((prev) => ({
										...prev,
										isRejectModalOpen: true,
									}));
								}}
								className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
							>
								Reject Manuscript
							</button>
							<button
								onClick={() => {
									closeAllModals();
									setModalState((prev) => ({
										...prev,
										isReviseModalOpen: true,
									}));
								}}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
							>
								Revise
							</button>
							<button
								onClick={() => {
									closeAllModals();
									setModalState((prev) => ({
										...prev,
										isLayoutModalOpen: true,
									}));
								}}
								className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
							>
								Proceed to Layout
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Layout Modal */}
			{modalState.isLayoutModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Layouting Details</h3>
							<button
								onClick={() => closeAllModals()}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold mb-2">Manuscript Title:</h4>
								<p className="text-gray-700">{selectedManuscript.title}</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Author/s:</h4>
								<p className="text-gray-700">{selectedManuscript.authors}</p>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Layout Artist <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={layoutArtist}
									onChange={handleLayoutArtistChange}
									onBlur={() =>
										setLayoutArtistError(
											layoutArtist ? '' : 'Layout artist name is required.'
										)
									}
									className={`w-full px-3 py-2 border ${
										layoutArtistError ? 'border-red-500' : 'border-gray-300'
									} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
									placeholder="Enter layout artist name"
								/>
								{layoutArtistError && (
									<p className="text-red-500 text-sm mt-1">
										{layoutArtistError}
									</p>
								)}
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Layout Artist Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									value={layoutArtistEmail}
									onChange={handleLayoutArtistEmailChange}
									onBlur={() =>
										setLayoutArtistEmailError(validateEmail(layoutArtistEmail))
									}
									className={`w-full px-3 py-2 border ${
										layoutArtistEmailError
											? 'border-red-500'
											: 'border-gray-300'
									} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
									placeholder="Enter layout artist email (e.g., artist@example.com)"
								/>
								{layoutArtistEmailError && (
									<p className="text-red-500 text-sm mt-1">
										{layoutArtistEmailError}
									</p>
								)}
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => closeAllModals()}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleProceedToLayoutConfirm}
								disabled={!isLayoutFormComplete()}
								className={`px-4 py-2 rounded-md transition-colors ${
									isLayoutFormComplete()
										? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								Proceed To Layout
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Layout Confirmation Modal */}
			{modalState.isLayoutConfirmModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">
								Confirm Layout Transition
							</h3>
							<button
								onClick={() => closeAllModals()}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<p className="text-gray-700">
								Are you sure you want to proceed with layouting for this
								manuscript?
							</p>
							<div className="bg-gray-50 p-4 rounded-md">
								<h4 className="font-semibold mb-2">Manuscript Details:</h4>
								<div className="space-y-2">
									<p>
										<span className="font-medium">Title:</span>{' '}
										{selectedManuscript.title}
									</p>
									<p>
										<span className="font-medium">Author(s):</span>{' '}
										{selectedManuscript.authors}
									</p>
									<p>
										<span className="font-medium">Layout Artist:</span>{' '}
										{layoutArtist}
									</p>
									<p>
										<span className="font-medium">Layout Artist Email:</span>{' '}
										{layoutArtistEmail}
									</p>
								</div>
							</div>
							<div className="bg-yellow-50 p-4 rounded-md">
								<p className="text-yellow-800">
									<span className="font-bold">Note:</span> Once you proceed to
									layout, this manuscript will be moved to the Staff Layouting
									section and can no longer be edited in the Double-Blind Review
									process.
								</p>
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() =>
									setModalState((prev) => ({
										...prev,
										isLayoutConfirmModalOpen: false,
									}))
								}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleProceedToLayout}
								disabled={!isLayoutFormComplete()}
								className={`px-4 py-2 rounded-md transition-colors ${
									isLayoutFormComplete()
										? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revision Modal */}
			{modalState.isReviseModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Revise Manuscript</h3>
							<button
								onClick={closeAllModals}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Revision Comments <span className="text-red-500">*</span>
								</label>
								<textarea
									value={revisionComments}
									onChange={(e) => setRevisionComments(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={4}
									placeholder="Enter revision comments"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Revision Date <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									value={revisionDate}
									onChange={(e) => setRevisionDate(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
						</div>

						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={closeAllModals}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleRevise}
								disabled={!isReviseFormValid}
								className={`px-4 py-2 rounded-md transition-colors ${
									isReviseFormValid
										? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								Submit Revision
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Reject Modal */}
			{modalState.isRejectModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Reject Manuscript</h3>
							<button
								onClick={() => closeAllModals()}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="mb-4">
							<h4 className="text-lg font-semibold mb-2">Manuscript Title:</h4>
							<p className="text-gray-700">{selectedManuscript.title}</p>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Rejection Comments
								</label>
								<textarea
									value={rejectionComments}
									onChange={(e) => setRejectionComments(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={4}
									placeholder="Enter rejection comments"
									required
								/>
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => closeAllModals()}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleReject}
								disabled={!isRejectFormValid}
								className={`px-4 py-2 rounded-md transition-colors ${
									isRejectFormValid
										? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								Confirm Rejection
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status Modal */}
			{modalState.isStatusModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Revision Status</h3>
							<button
								onClick={() => closeAllModals()}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold mb-2">Manuscript Title:</h4>
								<p className="text-gray-700">{selectedManuscript.title}</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Status:</h4>
								<p className="text-gray-700">
									{selectedManuscript.revisionStatus || 'In Progress'}
								</p>
							</div>
							{selectedManuscript.revisionDate && (
								<div>
									<h4 className="font-semibold mb-2">Revision Date:</h4>
									<p className="text-gray-700">
										{selectedManuscript.revisionDate}
									</p>
								</div>
							)}
							{selectedManuscript.firstRevisionDate && (
								<div>
									<h4 className="font-semibold mb-2">First Revision Date:</h4>
									<p className="text-gray-700">
										{selectedManuscript.firstRevisionDate}
									</p>
								</div>
							)}
							{selectedManuscript.revisionComments && (
								<div>
									<h4 className="font-semibold mb-2">Revision Comments:</h4>
									<div className="bg-gray-50 p-4 rounded-md">
										<p className="text-gray-700 whitespace-pre-wrap">
											{selectedManuscript.revisionComments}
										</p>
									</div>
								</div>
							)}
							{selectedManuscript.rejectionComment && (
								<div>
									<h4 className="font-semibold mb-2">Rejection Comments:</h4>
									<div className="bg-gray-50 p-4 rounded-md">
										<p className="text-gray-700 whitespace-pre-wrap">
											{selectedManuscript.rejectionComment}
										</p>
									</div>
								</div>
							)}
						</div>
						<div className="mt-6 flex justify-end">
							<button
								onClick={() => closeAllModals()}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Update Reviewers Modal */}
			{isUpdateReviewersModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Update Reviewers</h3>
							<button
								onClick={() => setIsUpdateReviewersModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="space-y-6">
							{[0, 1, 2, 3].map((index) => (
								<div key={index} className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Reviewer {index + 1}{' '}
										{index < 2 ? '(Required)' : '(Optional)'}
									</label>
									<select
										value={updatedReviewers[index] || ''}
										onChange={(e) => {
											const newReviewers = [...updatedReviewers];
											newReviewers[index] = e.target.value;
											setUpdatedReviewers(newReviewers);
										}}
										className={`w-full p-2 border rounded focus:ring-2 ${
											index < 2
												? 'focus:ring-blue-500 border-blue-200'
												: 'focus:ring-gray-500 border-gray-200'
										}`}
										required={index < 2}
									>
										<option value="">Select a reviewer</option>
										{reviewers
											.filter(
												(reviewer) =>
													!updatedReviewers.includes(reviewer.id.toString()) ||
													updatedReviewers[index] === reviewer.id.toString()
											)
											.map((reviewer) => (
												<option
													key={reviewer.id}
													value={reviewer.id.toString()}
												>
													{`${reviewer.firstName} ${reviewer.lastName}`}
												</option>
											))}
									</select>

									{updatedReviewers[index] && (
										<div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
											{(() => {
												const reviewer = reviewers.find(
													(r) => r.id.toString() === updatedReviewers[index]
												);
												if (!reviewer) return null;
												return (
													<div className="text-sm">
														<p>
															<span className="font-medium">Name:</span>{' '}
															{reviewer.firstName} {reviewer.lastName}
														</p>
														<p>
															<span className="font-medium">Email:</span>{' '}
															{reviewer.email}
														</p>
														<p>
															<span className="font-medium">Expertise:</span>{' '}
															{reviewer.fieldOfExpertise}
														</p>
													</div>
												);
											})()}
										</div>
									)}
								</div>
							))}
						</div>

						<div className="flex justify-end space-x-4 mt-6">
							<button
								onClick={() => setIsUpdateReviewersModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleUpdateReviewers}
								disabled={updatedReviewers.filter((r) => r).length < 2}
								className={`px-4 py-2 rounded text-white ${
									updatedReviewers.filter((r) => r).length >= 2
										? 'bg-blue-500 hover:bg-blue-600'
										: 'bg-gray-400 cursor-not-allowed'
								}`}
							>
								Update Reviewers
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
									Successfully moved to Staff Layouting section!
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

			{showRejectConfirmation && pendingReject && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-4">Confirm Rejection</h3>
							<div className="bg-white p-4 rounded-lg">
								<p className="text-gray-600">
									Are you sure you want to reject this manuscript?
								</p>
								<div className="mt-2 text-sm text-gray-500">
									<p>Title: {pendingReject.title}</p>
									<p>Comments: {rejectionComments}</p>
								</div>
							</div>
							<div className="mt-6 flex justify-center space-x-4">
								<button
									onClick={() => setShowRejectConfirmation(false)}
									className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
								>
									No
								</button>
								<button
									onClick={() => {
										const updatedManuscript = {
											...pendingReject,
											status: 'rejected',
											rejectionComment: rejectionComments,
											rejectionDate: new Date().toISOString().split('T')[0],
										};
										updateManuscriptStatus(
											pendingReject.id,
											'rejected',
											updatedManuscript
										);
										setShowRejectConfirmation(false);
										setModalState((prev) => ({
											...prev,
											isRejectModalOpen: false,
										}));
										setRejectionComments('');
										setIsRejectionSuccessModalOpen(true);
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

export default StaffDoubleBlind;
