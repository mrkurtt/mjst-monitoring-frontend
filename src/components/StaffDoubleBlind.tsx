import React, { useState, useEffect } from 'react';
import { Eye, X, FileEdit } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';
import {
	getManuscriptByStepStatus,
	updateManuscript,
} from '../api/manuscript.api';
import { ManuscriptDetails } from './StaffRecords';
import moment from 'moment';
import { createRating, getRating } from '../api/rating.api';
import { getReviewers } from '../api/reviewer.api';
import { sendMail } from '../api/mail.api';
import toast from 'react-hot-toast';

interface ExtendedManuscriptDetails extends ManuscriptDetails {
	firstRevisionDate?: string;
	revisionComments?: string;
	reviewerRemarks?: { [reviewerId: string]: string };
}

const StaffDoubleBlind: React.FC = () => {
	const { doubleBlindRecords, updateManuscriptStatus } = useRecords();
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
	const [selectedManuscript, setSelectedManuscript] = useState<
		ManuscriptDetails | any
	>(null);
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

	const handleRevise = async () => {
		if (selectedManuscript && revisionComments && revisionDate) {
			await updateManuscript(selectedManuscript._id, {
				revisionComment: revisionComments,
				revisionDate: revisionDate,
				progressStatus: 'For Revision',
			});

			await sendMail({
				message: `<p>Hello ${selectedManuscript.authors[0]} <br/> Your manuscript entitled ${selectedManuscript.title} needs revision. <br/>Comment: ${revisionComments}</p>`,
				recipients: [selectedManuscript.authorEmail],
				subject: 'Manuscript Needs Revision',
			}).then(() => {
				setRevisionComments('');
				setRevisionDate('');
				closeAllModals();
				getManuscripts();
			});
		}
	};

	const handleUpdateReviewers = () => {
		if (selectedManuscript && updatedReviewers.filter((r) => r).length >= 2) {
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

	const [manuscripts, setManuscripts] = useState<any>([]);

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Double-Blind').then((res) => {
			setManuscripts(res.data);
		});
	};

	const [reviewers, setReviewers] = useState<any>([]);
	const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

	const getAllReviewers = async () => {
		await getReviewers().then((res) => {
			setReviewers(res.data);
		});
	};

	const updateReviewers = async () => {
		await updateManuscript(selectedManuscript._id, {
			reviewers: selectedReviewers,
		});

		let reviewersEmail = [];

		for (let i = 0; i < selectedReviewers.length; i++) {
			const filteredReviewer: any = reviewers.filter(
				(reviewer: any) => reviewer._id == selectedReviewers[i]
			);

			reviewersEmail.push(filteredReviewer[0].email);
		}

		await sendMail({
			message: `<p>Hello Reviewer <br/> You are assigned as Reviewer for the manuscript entitled ${selectedManuscript.title} by ${selectedManuscript.authors[0]}.</p>`,
			recipients: reviewersEmail,
			subject: 'Manuscript Reviewer Assignment',
		}).then(() => {
			setIsUpdateReviewersModalOpen(false);
			closeAllModals();
			getManuscripts();
			setSelectedReviewers([]);
		});
	};

	const handleReject = () => {
		if (selectedManuscript && rejectionComments) {
			setPendingReject(selectedManuscript);
			setShowRejectConfirmation(true);
		}
	};

	const confirmRejectManuscript = async () => {
		await updateManuscript(selectedManuscript._id, {
			progressStatus: 'Rejected',
			status: 'Rejected',
			rejectComment: rejectionComments,
			rejectDate: new Date().toISOString(),
		});

		await sendMail({
			message: `<p>Hello ${selectedManuscript.authors[0]} <br/> Your manuscript entitled ${selectedManuscript.title} has been rejected. <br/>Reason: ${rejectionComments}</p>`,
			recipients: [selectedManuscript.authorEmail],
			subject: 'Manuscript Rejected',
		}).then(() => {
			setRejectionComments('');

			closeAllModals();
		});
	};

	const [remarks, setRemarks] = useState<any>([]);
	const [manuReviewers, setManuReviewers] = useState<any>([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);

	const handleProceedToLayout = async () => {
		await updateManuscript(selectedManuscript._id, {
			layoutArtistName: layoutArtist,
			layoutArtistEmail: layoutArtistEmail,
			layoutStatus: 'In Progress',
			status: 'Layouting',
		});

		await sendMail({
			message: `<p>Hello ${layoutArtist} <br/>You are assigned as Layout Artist for the manuscript entitled ${selectedManuscript.title} by ${selectedManuscript.authors[0]}</p>`,
			recipients: [layoutArtistEmail],
			subject: 'Layouting for Manuscript',
		});

		await sendMail({
			message: `<p>Hello ${selectedManuscript.authors[0]} <br/>Your manuscript entitled ${selectedManuscript.title} is now in Layouting stage.</p>`,
			recipients: [selectedManuscript.authorEmail],
			subject: 'Manuscript Update: In Layouting Stage',
		}).then(() => {
			closeAllModals();
			setLayoutArtist('');
			setLayoutArtistEmail('');
			getManuscripts();
		});
	};

	const filterRecords = () => {
		const filteredRecords = manuscripts.filter(
			(record: any) =>
				record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.authors[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
				record.fileCode.toLowerCase().includes(searchTerm.toLowerCase())
		);

		setFilteredManuscripts(filteredRecords);
	};

	const getRemarks = async () => {
		for (let i = 0; i < selectedManuscript?.reviewers.length; i++) {
			let reviewerId = selectedManuscript?.reviewers[i]._id;

			await getRating(selectedManuscript._id, reviewerId).then((res) =>
				setRemarks((prev: string[]) => [...prev, res?.data.remarks])
			);
		}
	};

	useEffect(() => {
		getManuscripts();
		getAllReviewers();
	}, []);

	useEffect(() => {
		getRemarks();
	}, [selectedManuscript]);

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);

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
						{searchTerm === ''
							? manuscripts.map((record: any, index: number) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="py-4 px-4">{record.fileCode}</td>
										<td className="py-4 px-4">{record.title}</td>
										<td className="py-4 px-4">{`${
											record.scopeType.charAt(0).toUpperCase() +
											record.scopeType.slice(1)
										} ${record.scope}`}</td>
										<td className="py-4 px-4">
											{moment(record.dateSubmitted).format('LL')}
										</td>
										<td className="py-4 px-4">{record.authors}</td>
										<td className="py-4 px-4">
											<div className="flex flex-col space-y-2">
												<span
													className={`px-2 py-1 rounded-full text-sm ${
														record.progressStatus === 'For Revision'
															? 'bg-yellow-100 text-yellow-800'
															: record.progressStatus === 'Rejected'
															? 'bg-red-100 text-red-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.progressStatus || 'In Progress'}
												</span>
												{(record.revisionComments ||
													record.rejectionComment) && (
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
							  ))
							: filteredManuscripts.map((record: any, index: number) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="py-4 px-4">{record.fileCode}</td>
										<td className="py-4 px-4">{record.title}</td>
										<td className="py-4 px-4">{`${
											record.scopeType.charAt(0).toUpperCase() +
											record.scopeType.slice(1)
										} ${record.scope}`}</td>
										<td className="py-4 px-4">
											{moment(record.dateSubmitted).format('LL')}
										</td>
										<td className="py-4 px-4">{record.authors}</td>
										<td className="py-4 px-4">
											<div className="flex flex-col space-y-2">
												<span
													className={`px-2 py-1 rounded-full text-sm ${
														record.progressStatus === 'For Revision'
															? 'bg-yellow-100 text-yellow-800'
															: record.progressStatus === 'Rejected'
															? 'bg-red-100 text-red-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.progressStatus || 'In Progress'}
												</span>
												{(record.revisionComments ||
													record.rejectionComment) && (
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
								title="cancelbtn"
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
									<p className="text-gray-700">{selectedManuscript.fileCode}</p>
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
									<p className="text-gray-700">
										{moment(selectedManuscript.dateSubmitted).format('LL')}
									</p>
								</div>
								<div>
									<label className="font-semibold block">Email:</label>
									<p className="text-gray-700">
										{selectedManuscript.authorEmail}
									</p>
								</div>
								<div>
									<label className="font-semibold block">Editor:</label>
									<p className="text-gray-700">
										{selectedManuscript?.editor.firstname}{' '}
										{selectedManuscript?.editor.lastname}
									</p>
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
										(reviewer: any, index: number) => (
											<div
												key={index}
												className="bg-white p-4 rounded-lg shadow border border-gray-200"
											>
												<div className="flex flex-col">
													<div className="flex justify-between items-start mb-3">
														<div>
															<p className="font-medium text-gray-800">
																{reviewer.firstname} {reviewer.middlename}{' '}
																{reviewer.lastname}
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
															title="selectRemarks"
															value={remarks[index]}
															onChange={async (e) => {
																await createRating({
																	reviewerId: reviewer._id,
																	manuscriptId: selectedManuscript._id,
																	remarks: e.target.value,
																}).then(() => {
																	setModalState((prev) => ({
																		...prev,
																		isModalOpen: false,
																	}));
																	toast.success('Remarks saved successfully.');
																	setRemarks([]);
																	getManuscripts();
																});
															}}
															className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
														>
															<option value="">
																{remarks[reviewer._id] || 'Select Remarks'}
															</option>
															<option value="Excellent">Excellent</option>
															<option value="Acceptable">Acceptable</option>
															<option value="Acceptable With Revision">
																Acceptable with Revision
															</option>
															<option value="Not Acceptable">
																Not Acceptable
															</option>
														</select>

														{/* {reviewerRemarks[reviewerId] && (
														<div className="mt-3">
															<span
																className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
																	reviewerRemarks[reviewerId] === 'excellent'
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
													)} */}
													</div>
												</div>
											</div>
										)
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
								title="cancelbtn"
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
								<p className="text-gray-700">{selectedManuscript.authors[0]}</p>
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
								title="cancelbtn"
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
								title="cancelbtn"
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
								title="cancelbtn"
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
								title="cancelbtn"
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
								title="cancelbtn"
								onClick={() => setIsUpdateReviewersModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Reviewer 1 (Required)
								</label>
								<select
									title="selectreviewers"
									value={selectedReviewers[0] || ''}
									onChange={(e) =>
										setSelectedReviewers((prevState) => [
											...prevState,
											e.target.value,
										])
									}
									className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
									required
								>
									<option value="">Select a reviewer</option>
									{reviewers.map((reviewer: any) => (
										<option key={reviewer._id} value={reviewer._id}>
											{`${reviewer.firstname} ${reviewer.lastname}`}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Reviewer 2 (Required)
								</label>
								<select
									title="selectreviewers"
									value={selectedReviewers[1] || ''}
									onChange={(e) =>
										setSelectedReviewers((prevState) => [
											...prevState,
											e.target.value,
										])
									}
									className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
									required
								>
									<option value="">Select a reviewer</option>
									{reviewers.map((reviewer: any) => (
										<option key={reviewer._id} value={reviewer._id}>
											{`${reviewer.firstname} ${reviewer.lastname}`}
										</option>
									))}
								</select>
							</div>

							{/* Optional Reviewers */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Reviewer 3 (Optional)
								</label>
								<select
									title="selectreviewers"
									value={selectedReviewers[2] || ''}
									onChange={(e) =>
										setSelectedReviewers((prevState) => [
											...prevState,
											e.target.value,
										])
									}
									className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500"
								>
									<option value="">Select a reviewer</option>
									{reviewers.map((reviewer: any) => (
										<option key={reviewer._id} value={reviewer._id}>
											{`${reviewer.firstname} ${reviewer.lastname}`}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Reviewer 4 (Optional)
								</label>
								<select
									title="selectreviewers"
									value={selectedReviewers[3] || ''}
									onChange={(e) =>
										setSelectedReviewers((prevState) => [
											...prevState,
											e.target.value,
										])
									}
									className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-500"
								>
									<option value="">Select a reviewer</option>
									{reviewers.map((reviewer: any) => (
										<option key={reviewer._id} value={reviewer._id}>
											{`${reviewer.firstname} ${reviewer.lastname}`}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex justify-end space-x-4 mt-6">
							<button
								onClick={() => setIsUpdateReviewersModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={updateReviewers}
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
									{/* <p>Title: {pendingReject.title}</p> */}
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
										confirmRejectManuscript();
										setShowRejectConfirmation(false);
										setModalState((prev) => ({
											...prev,
											isRejectModalOpen: false,
										}));
										setRejectionComments('');
										getManuscripts();
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
