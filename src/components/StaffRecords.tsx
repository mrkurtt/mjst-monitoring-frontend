import React, { useState, useEffect } from 'react';
import { Eye, X, Bell } from 'lucide-react';
import { Editor } from '../contexts/EditorsContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';
import {
	getManuscriptByStepStatus,
	updateManuscript,
} from '../api/manuscript.api';
import moment from 'moment';
import { getEditors } from '../api/editor.api';
import { getReviewers } from '../api/reviewer.api';
import { sendMail } from '../api/mail.api';

interface RejectionData {
	rejectionReason: string;
	rejectionComment: string;
}

interface NotificationType {
	id: string;
	manuscriptId: string;
	message: string;
	editorId: string;
}

export interface ManuscriptDetails {
	id: string;
	title: string;
	authors: string;
	affiliation: string;
	scopeType: string;
	scope: string;
	scopeCode: string;
	dateSubmitted: string;
	email: string;
	status: string;
	revisionStatus: string;
	revisionComments?: string;
	rejectionReason?: string;
	rejectionComment?: string;
	grammarScore?: number;
	plagiarismScore?: number;
	editor?: string;
	editorDetails?: {
		name: string;
		expertise: string;
		email: string;
	};
}

const StaffRecords: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [isRejectionSuccessModalOpen, setIsRejectionSuccessModalOpen] =
		useState(false);
	const [isConfirmDoubleBlindModalOpen, setIsConfirmDoubleBlindModalOpen] =
		useState(false);
	const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
	const [isStatusViewModalOpen, setIsStatusViewModalOpen] = useState(false);
	const [selectedManuscript, setSelectedManuscript] = useState<
		ManuscriptDetails | any
	>(null);
	const [rejectionReason, setRejectionReason] = useState('');
	const [rejectionComment, setRejectionComment] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedStatus, setSelectedStatus] = useState('');
	const [showWarning, setShowWarning] = useState(false);
	const [notifications, setNotifications] = useState<NotificationType[]>([]);
	const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
	const [pendingReject, setPendingReject] = useState<ManuscriptDetails | null>(
		null
	);
	const revisionOptions = [
		'In Progress',
		'Accepted with revision',
		'Not acceptable',
		'Accepted',
		'Excellent',
	];

	const rejectionReasons = [
		'Out of Scope',
		'Irrelevant',
		'High Plagiarism Rate',
		'Withdrawn By the Author',
		'Poor Adherence',
		'Low Grammar Score (Below 85%)',
		'Insufficient Data',
	];

	// Grammar and plagiarism thresholds
	const GRAMMAR_PASSING_SCORE = 85;
	const PLAGIARISM_THRESHOLD = 15;

	// Helper function to get detailed rejection message
	const getDetailedRejectionMessage = (
		reason: string,
		comment: string,
		manuscript: ManuscriptDetails | null
	): string => {
		if (!manuscript) return comment;

		switch (reason) {
			case 'Low Grammar Score (Below 85%)':
				return `Grammar Score: ${
					manuscript.grammarScore ?? 'N/A'
				}% (Required: ${GRAMMAR_PASSING_SCORE}%)\n${comment}`;
			case 'High Plagiarism Rate':
				return `Plagiarism Rate: ${
					manuscript.plagiarismScore ?? 'N/A'
				}% (Threshold: ${PLAGIARISM_THRESHOLD}%)\n${comment}`;
			case 'Insufficient Data':
				return `Insufficient Data:\n${comment}\nPlease provide complete data and methodology.`;
			default:
				return comment;
		}
	};

	// const filteredRecords: ManuscriptDetails[] = manuscriptRecords.filter(
	// 	(record: ManuscriptDetails) =>
	// 		record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 		record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 		record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 		record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
	// );

	const handleViewDetails = (manuscript: ManuscriptDetails) => {
		setSelectedManuscript(manuscript);
		setIsModalOpen(true);
	};

	const handleViewStatusClick = (manuscript: ManuscriptDetails) => {
		setSelectedManuscript(manuscript);
		setIsStatusViewModalOpen(true);
	};

	const handleReviseClick = () => {
		setIsRevisionModalOpen(true);
		setIsModalOpen(false);
	};

	const handleUpdateStatus = async () => {
		if (selectedManuscript) {
			await updateManuscript(selectedManuscript._id, {
				progressStatus: 'For Revision',
				revisionComment,
			});

			await sendMail({
				message: `<p>Hello Author <br/> our manuscript entitled ${selectedManuscript.title} needs revision. <br/>Comment: ${revisionComment}</p>`,
				recipients: [selectedManuscript.authorEmail],
				subject: 'Manuscript Needs Revision',
			}).then(() => {
				setIsRevisionModalOpen(false);
				setRevisionComment('');
				setSelectedManuscript(null);
				getManuscripts();
			});
		}
	};

	const handleReviewerSelectionComplete = () => {
		const filledReviewers = selectedReviewers.filter(
			(reviewer) => reviewer !== ''
		);
		if (filledReviewers.length < 2) {
			setShowWarning(true);
		} else {
			setShowWarning(false);
			setIsConfirmDoubleBlindModalOpen(true);
			setIsReviewerModalOpen(false);
		}
	};

	const handleCancelDoubleBlind = () => {
		setIsConfirmDoubleBlindModalOpen(false);
		setIsReviewerModalOpen(true);
	};

	const openRejectModal = (manuscript: ManuscriptDetails) => {
		setSelectedManuscript(manuscript);
		setIsRejectModalOpen(true);
		setIsModalOpen(false);
	};

	const isProceedEnabled = () => {
		// Count non-empty reviewer selections for required reviewers (positions 0 and 1)
		const requiredReviewersSelected = selectedReviewers
			.slice(0, 2)
			.filter((reviewer) => reviewer && reviewer.length > 0).length;
		return requiredReviewersSelected >= 2;
	};

	const resetAllModals = () => {
		setIsModalOpen(false);
		setIsRejectModalOpen(false);
		setIsReviewerModalOpen(false);
		setIsSuccessModalOpen(false);
		setIsRejectionSuccessModalOpen(false);
		setIsConfirmDoubleBlindModalOpen(false);
		setIsRevisionModalOpen(false);
		setIsStatusViewModalOpen(false);
		setSelectedManuscript(null);
		setSelectedReviewers([]);
		setRejectionReason('');
		setRejectionComment('');
		setSelectedStatus('');
		setShowWarning(false);
	};

	const handleSuccessModalClose = () => {
		resetAllModals();
	};

	const handleRejectionSuccessModalClose = () => {
		resetAllModals();
	};

	// Check for papers in Pre-Review over 5 days
	// useEffect(() => {
	// 	const checkPreReviewPapers = () => {
	// 		const currentDate = new Date();

	// 		manuscriptRecords.forEach((manuscript: any) => {
	// 			if (
	// 				manuscript.status === 'Pre-Review' &&
	// 				manuscript.submissionDate &&
	// 				manuscript.assignedEditor
	// 			) {
	// 				const submissionDate = new Date(manuscript.submissionDate);
	// 				const daysDifference = Math.floor(
	// 					(currentDate.getTime() - submissionDate.getTime()) /
	// 						(1000 * 60 * 60 * 24)
	// 				);

	// 				if (daysDifference >= 5) {
	// 					const notificationId = `pre-review-${manuscript.id}`;

	// 					// Only add notification if it doesn't exist
	// 					if (!notifications.some((n) => n.id === notificationId)) {
	// 						const newNotification = {
	// 							id: notificationId,
	// 							manuscriptId: manuscript.id,
	// 							message: `Manuscript "${manuscript.title}" has been in Pre-Review for more than 5 days`,
	// 							editorId: manuscript.assignedEditor,
	// 						};

	// 						setNotifications((prev) => [...prev, newNotification]);
	// 					}
	// 				}
	// 			}
	// 		});
	// 	};

	// 	// Run check immediately and every hour
	// 	checkPreReviewPapers();
	// 	const interval = setInterval(checkPreReviewPapers, 1000 * 60 * 60);

	// 	return () => clearInterval(interval);
	// }, [manuscriptRecords, notifications]);

	const dismissNotification = (notificationId: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
	};

	// Add useEffect to maintain record visibility
	// useEffect(() => {
	// const filteredRecords = manuscriptRecords.filter(
	// 	(record: any) =>
	// 		record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 		record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 		record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
	// 		record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
	// );
	// 	// Keep using the filtered records for display
	// }, [manuscriptRecords, searchTerm]);

	// Add useEffect to sync selected manuscript
	// useEffect(() => {
	// 	if (selectedManuscript) {
	// 		const currentRecord = manuscriptRecords.find(
	// 			(record: any) => record.id === selectedManuscript.id
	// 		);
	// 		if (currentRecord) {
	// 			setSelectedManuscript(currentRecord);
	// 		}
	// 	}
	// }, [manuscriptRecords]);

	const [manuscripts, setManuscripts] = useState([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);
	const [editors, setEditors] = useState([]);
	const [reviewers, setReviewers] = useState([]);
	const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
	const [isUpdateEditorSuccessModalOpen, setIsUpdateEditorSuccessModalOpen] =
		useState(false);

	const [revisionComment, setRevisionComment] = useState('');

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Pre-Review').then((res) => {
			setManuscripts(res.data);
		});
	};

	const getAllEditors = async () => {
		await getEditors().then((res) => {
			setEditors(res.data);
		});
	};

	const getAllReviewers = async () => {
		await getReviewers().then((res) => {
			setReviewers(res.data);
		});
	};

	const handleProceedToDoubleBlind = () => {
		setIsReviewerModalOpen(true);
		setIsModalOpen(false);
	};

	const confirmProceedToDoubleBlind = async () => {
		await updateManuscript(selectedManuscript._id, {
			status: 'Double-Blind',
			reviewers: selectedReviewers,
		});

		await sendMail({
			message: `<p>Hello ${selectedManuscript.authors[0]} <br/>Your manuscript entitled ${selectedManuscript.title} is now in Double-Blind Stage.</p>`,
			recipients: [selectedManuscript.authorEmail],
			subject: 'Manuscript Update: In Double-Blind Stage',
		});

		let reviewersEmail = [];

		for (let i = 0; i < selectedReviewers.length; i++) {
			const filteredReviewer: any = reviewers.filter(
				(reviewer: any) => reviewer._id == selectedReviewers[i]
			);

			reviewersEmail.push(filteredReviewer[0].email);
		}

		await sendMail({
			message: `<p>Hello Reviewer <br/>You are assigned as Reviewer for the manuscript entitled ${selectedManuscript.title} by ${selectedManuscript.authors[0]}.</p>`,
			recipients: reviewersEmail,
			subject: 'Manuscript Reviewer Assignment',
		}).then(() => {
			setIsReviewerModalOpen(false);
			setIsModalOpen(false);
			setIsConfirmDoubleBlindModalOpen(false);
			setSelectedReviewers([]);
			getManuscripts();
		});
	};

	const handleReject = () => {
		if (selectedManuscript && rejectionReason && rejectionComment) {
			setPendingReject(selectedManuscript);
			setShowRejectConfirmation(true);
		}
	};

	const confirmRejection = async () => {
		await updateManuscript(selectedManuscript._id, {
			progressStatus: 'Rejected',
			status: 'Rejected',
			rejectReason: rejectionReason,
			rejectDate: new Date().toISOString(),
		});

		await sendMail({
			message: `<p>Hello ${selectedManuscript.authors[0]} <br/> Your manuscript entitled ${selectedManuscript.title} has been rejected. <br/>Reason: ${rejectionReason}</p>`,
			recipients: [selectedManuscript.authorEmail],
			subject: 'Manuscript Rejected',
		}).then(() => {
			setShowRejectConfirmation(false);
			setIsRejectModalOpen(false);
			setIsRejectionSuccessModalOpen(true);
			setRejectionReason('');
			setRejectionComment('');
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

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);

	useEffect(() => {
		getManuscripts();
		getAllEditors();
		getAllReviewers();
	}, []);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-xl font-semibold mb-4">Pre Review Records</h3>

			<div className="mb-6">
				<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
			</div>

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
							? manuscripts.map((record: any, index) => (
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
														record.progressStatus === 'rejected'
															? 'bg-red-100 text-red-800'
															: record.progressStatus === 'For Revision'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.progressStatus}
												</span>
												{(record.revisionComments || record.rejectReason) && (
													<button
														onClick={() => handleViewStatusClick(record)}
														className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors w-fit"
													>
														View Status
													</button>
												)}
											</div>
										</td>
										<td className="py-4 px-4">
											<div className="flex space-x-2">
												<button
													onClick={() => handleViewDetails(record)}
													className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
												>
													<Eye size={16} className="mr-1" />
													View
												</button>
											</div>
										</td>
									</tr>
							  ))
							: filteredManuscripts.map((record: any, index) => (
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
														record.progressStatus === 'rejected'
															? 'bg-red-100 text-red-800'
															: record.progressStatus === 'For Revision'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.progressStatus}
												</span>
												{(record.revisionComments || record.rejectReason) && (
													<button
														onClick={() => handleViewStatusClick(record)}
														className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors w-fit"
													>
														View Status
													</button>
												)}
											</div>
										</td>
										<td className="py-4 px-4">
											<div className="flex space-x-2">
												<button
													onClick={() => handleViewDetails(record)}
													className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
												>
													<Eye size={16} className="mr-1" />
													View
												</button>
											</div>
										</td>
									</tr>
							  ))}
					</tbody>
				</table>
			</div>

			{/* Notification Display */}
			{notifications.length > 0 && (
				<div className="mb-4 space-y-2">
					{notifications.map((notification) => (
						<div
							key={notification.id}
							className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex justify-between items-center"
						>
							<div className="flex items-center space-x-2">
								<Bell className="h-5 w-5 text-yellow-400" />
								<span className="text-sm text-yellow-700">
									{notification.message}
								</span>
							</div>
							<button
								title="cancelbtn"
								onClick={() => dismissNotification(notification.id)}
								className="text-yellow-400 hover:text-yellow-600"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Details Modal */}
			{isModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Manuscript Details</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="font-semibold block">File Code:</label>
								<p className="text-gray-700">{selectedManuscript.fileCode}</p>
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
								<label className="font-semibold block">Affiliation:</label>
								<p className="text-gray-700">
									{selectedManuscript.affiliation}
								</p>
							</div>
							<div>
								<label className="font-semibold block">Field/Scope:</label>
								<p className="text-gray-700">{`${
									selectedManuscript.scopeType.charAt(0).toUpperCase() +
									selectedManuscript.scopeType.slice(1)
								} ${selectedManuscript.scope}`}</p>
							</div>
							<div>
								<label className="font-semibold block">Email:</label>
								<p className="text-gray-700">
									{selectedManuscript.authorEmail}
								</p>
							</div>
							<div>
								<label className="font-semibold block">Date Submitted:</label>
								<p className="text-gray-700">
									{moment(selectedManuscript.dateSubmitted).format('LL')}
								</p>
							</div>
							<div>
								<label className="font-semibold block">Status:</label>
								<p className="text-gray-700">
									{selectedManuscript.progressStatus}
								</p>
							</div>
							{selectedManuscript.revisionComments && (
								<div>
									<label className="font-semibold block">
										Revision Comments:
									</label>
									<p className="text-gray-700">
										{selectedManuscript.revisionComments}
									</p>
								</div>
							)}
							<div>
								<label className="font-semibold block mb-2">Editor:</label>
								<div className="flex flex-col space-y-2">
									<div className="text-gray-700 mb-2">
										Current Editor:{' '}
										{`${selectedManuscript?.editor.firstname} ${selectedManuscript?.editor.lastname}`}
									</div>

									<select
										title="selectEditor"
										value={selectedManuscript?.editor || ''}
										onChange={async (e) => {
											await updateManuscript(selectedManuscript._id, {
												editor: e.target.value,
											}).then(() => {
												setIsModalOpen(false);
												getManuscripts();
												setIsUpdateEditorSuccessModalOpen(true);
											});
										}}
										className="w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Select New Editor</option>
										{editors.map((editor: Editor) => (
											<option key={editor._id} value={`${editor._id}`}>
												{`${editor.firstname} ${editor.lastname} - ${editor.position}`}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Add Scores Display */}
							<div>
								<label className="font-semibold block mb-2">Scores:</label>
								<ScoresDisplay manuscript={selectedManuscript} />
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-3">
							<button
								onClick={() => handleProceedToDoubleBlind()}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
							>
								Proceed to Double Blind
							</button>
							<button
								onClick={() => handleReviseClick()}
								className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
							>
								Revise
							</button>
							<button
								onClick={() => openRejectModal(selectedManuscript)}
								className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
							>
								Reject
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revision Modal (Comments) */}
			{isRevisionModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Add Comments</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsRevisionModalOpen(false)}
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
									Comments
								</label>
								<textarea
									value={revisionComment}
									onChange={(e) => setRevisionComment(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
									placeholder="Enter your comments here..."
									required
								/>
							</div>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => setIsRevisionModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleUpdateStatus}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
								disabled={revisionComment.length === 0}
							>
								Save Comments
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Reject Modal */}
			{isRejectModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Reject Manuscript</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsRejectModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="font-semibold block mb-2">
									Reason for Rejection:
								</label>
								<select
									title="rejectreason"
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									className="w-full p-2 border rounded"
								>
									<option value="">Select a reason</option>
									{rejectionReasons.map((reason) => (
										<option key={reason} value={reason}>
											{reason}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="font-semibold block mb-2">
									Additional Comments:
								</label>
								<textarea
									value={rejectionComment}
									onChange={(e) => setRejectionComment(e.target.value)}
									className="w-full p-2 border rounded"
									rows={4}
									placeholder="Enter additional comments..."
								/>
							</div>
							<div className="flex justify-end">
								<button
									onClick={handleReject}
									className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
									disabled={!rejectionReason}
								>
									Confirm Rejection
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Confirmation Modal for Double Blind */}
			{isConfirmDoubleBlindModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-xl font-semibold mb-4">
							Confirm Double Blind Review
						</h3>
						<p className="mb-6">
							Are you sure you want to proceed with the selected reviewers for
							double blind review?
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={handleCancelDoubleBlind}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
							>
								No, Go Back
							</button>
							<button
								onClick={confirmProceedToDoubleBlind}
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Yes, Proceed
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Reviewer Selection Modal */}
			{isReviewerModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[600px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Select Reviewers</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsReviewerModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="space-y-4">
							{/* Required Reviewers */}
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
								onClick={() => {
									setIsReviewerModalOpen(false);
									setSelectedReviewers([]);
								}}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleReviewerSelectionComplete}
								disabled={!isProceedEnabled()}
								className={`px-4 py-2 rounded-md text-white ${
									isProceedEnabled()
										? 'bg-blue-500 hover:bg-blue-600'
										: 'bg-gray-400 cursor-not-allowed'
								}`}
							>
								Proceed
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
							<p className="text-gray-600 mb-6">
								The manuscript has been successfully moved to double-blind
								review.
							</p>
							<button
								onClick={handleSuccessModalClose}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Update Editor Modal */}
			{isUpdateEditorSuccessModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-4">Success!</h3>
							<p className="text-gray-600 mb-6">
								Editor has been updated successfully.
							</p>
							<button
								onClick={() => {
									setIsUpdateEditorSuccessModalOpen(false);
								}}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Rejection Success Modal */}
			{isRejectionSuccessModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<h3 className="text-xl font-semibold mb-4">
								Manuscript Rejected
							</h3>
							<p className="text-gray-600 mb-6">
								The manuscript has been successfully rejected.
							</p>
							<button
								onClick={handleRejectionSuccessModalClose}
								className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status View Modal */}
			{isStatusViewModalOpen && selectedManuscript && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Manuscript Status</h3>
							<button
								title="cancelbutton"
								onClick={() => setIsStatusViewModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="font-semibold block">Title:</label>
								<p className="text-gray-700">{selectedManuscript.title}</p>
							</div>
							<div>
								<label className="font-semibold block">Current Status:</label>
								<p className="text-gray-700">
									{selectedManuscript.revisionStatus || 'In Progress'}
								</p>
							</div>

							<div>
								<label className="font-semibold block">Editor:</label>
								<p className="text-gray-700">
									{selectedManuscript.editor || 'Not assigned'}
								</p>
							</div>

							{/* Add Scores Display */}
							<div>
								<label className="font-semibold block mb-2">Scores:</label>
								<ScoresDisplay manuscript={selectedManuscript} />
							</div>

							{selectedManuscript.revisionComments && (
								<div>
									<label className="font-semibold block">Comments:</label>
									<p className="text-gray-700 whitespace-pre-wrap">
										{selectedManuscript.revisionComments}
									</p>
								</div>
							)}
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
									<p>Reason: {rejectionReason}</p>
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
									onClick={confirmRejection}
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

export default StaffRecords;
