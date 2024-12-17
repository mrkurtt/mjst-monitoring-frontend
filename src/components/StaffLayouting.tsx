import React, { useState, useEffect } from 'react';
import { Eye, X, CheckCircle } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';
import {
	getManuscriptByStepStatus,
	updateManuscript,
} from '../api/manuscript.api';
import moment from 'moment';
import { getRating } from '../api/rating.api';
import { sendMail } from '../api/mail.api';

const StaffLayouting: React.FC = () => {
	const { acceptedRecords } = useRecords();
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<any>(null);
	const [dateFinished, setDateFinished] = useState('');
	const [proofreader, setProofreader] = useState('');
	const [proofreaderEmail, setProofreaderEmail] = useState('');
	const [revisionComments, setRevisionComments] = useState('');
	const [missingFields, setMissingFields] = useState<string[]>([]);
	const [showFPRForm, setShowFPRForm] = useState(false);
	const [proofreaderError, setProofreaderError] = useState('');
	const [proofreaderEmailError, setProofreaderEmailError] = useState('');
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
	const [showRevisionConfirmation, setShowRevisionConfirmation] =
		useState(false);
	const [showRevisionSuccess, setShowRevisionSuccess] = useState(false);
	const [proofreadingDetails, setProofreadingDetails] = useState({
		dateFinished: '',
		proofreaderName: '',
		proofreaderEmail: '',
	});

	// Filter only records that have layout details
	const layoutRecords = acceptedRecords.map((record) => ({
		...record,
		layoutDetails: record.layoutDetails || {
			status: 'in-progress',
		},
	}));

	const filteredRecords = layoutRecords.filter(
		(record) =>
			record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.layoutDetails?.layoutArtist
				?.toLowerCase()
				.includes(searchTerm.toLowerCase())
	);

	const handleViewDetails = async (record: any) => {
		setSelectedRecord(record);
		setDateFinished(new Date().toISOString().split('T')[0]);
		setProofreader('');
		setProofreaderEmail('');
		setShowFPRForm(false);
		setIsModalOpen(true);
	};

	const handleRevise = () => {
		if (selectedRecord && revisionComments) {
			setShowRevisionConfirmation(true);
		}
	};

	const confirmRevision = async () => {
		if (selectedRecord && revisionComments) {
			await updateManuscript(selectedRecord._id, {
				progressStatus: 'For Revision',
				revisionComment: revisionComments,
			});

			await sendMail({
				message: `<p>Hello ${selectedRecord.authors[0]} <br/> Your manuscript entitled ${selectedRecord.title} needs revision. <br/>Comment: ${revisionComments}</p>`,
				recipients: [selectedRecord.authorEmail],
				subject: 'Manuscript Needs Revision',
			}).then(() => {
				// Clear form and close modals
				setRevisionComments('');
				setShowRevisionConfirmation(false);
				setIsReviseModalOpen(false);
				setShowRevisionSuccess(true);
				getManuscripts();
			});
		}
	};

	useEffect(() => {
		if (selectedRecord?.layoutDetails) {
			setSelectedRecord((prevRecord: any) => ({
				...prevRecord,
				layoutDetails: {
					...prevRecord?.layoutDetails,
					...selectedRecord.layoutDetails,
					status: selectedRecord.layoutDetails.status || 'in-progress',
				},
			}));
		}
	}, [selectedRecord?.id]);

	const handleProceedToFPRClick = () => {
		setShowFPRForm(true);
	};

	const handleConfirmProceedToFPR = async () => {
		if (selectedRecord && dateFinished && proofreader && proofreaderEmail) {
			await updateManuscript(selectedRecord._id, {
				layoutFinishDate: dateFinished,
				status: 'Final Proofreading',
				proofReaderName: proofreader,
				proofReaderEmail: proofreaderEmail,
				layoutStatus: 'Completed',
			});

			await sendMail({
				message: `<p>Hello ${selectedRecord.authors[0]} <br/>Your manuscript entitled ${selectedRecord.title} is now in Final Proofreading Stage.</p>`,
				recipients: [selectedRecord.authorEmail],
				subject: 'Manuscript Update: In Final Proofreading Stage',
			}).then(() => {
				setIsModalOpen(false);
				setDateFinished('');
				setProofreader('');
				setProofreaderEmail('');
				setMissingFields([]);
				setIsSuccessModalOpen(true);
				setIsConfirmationModalOpen(false);
				getManuscripts();
			});
		}
	};

	const validateFields = () => {
		const missing = [];
		if (!dateFinished) missing.push('Date Finished');
		if (!proofreader) missing.push('Proofreader Name');
		if (!proofreaderEmail) missing.push('Proofreader Email');
		setMissingFields(missing);
		return missing.length === 0;
	};

	const validateEmail = (email: string) => {
		if (!email) return 'Proofreader email is required.';
		if (!email.includes('@')) return 'Email must contain @ symbol.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return 'Please enter a valid email address.';
		return '';
	};

	const handleProofreaderEmailChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const email = e.target.value;
		setProofreaderEmail(email);
		setProofreaderEmailError(validateEmail(email));
	};

	const handleProofreaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		setProofreader(name);
		setProofreaderError(name ? '' : 'Proofreader name is required.');
	};

	const isFormComplete = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return (
			dateFinished.trim() !== '' &&
			proofreader.trim() !== '' &&
			proofreaderEmail.trim() !== '' &&
			emailRegex.test(proofreaderEmail)
		);
	};

	const closeAllModals = () => {
		setIsModalOpen(false);
		setIsReviseModalOpen(false);
		setIsStatusModalOpen(false);
		setIsConfirmationModalOpen(false);
		setShowRevisionSuccess(false);
		setShowRevisionConfirmation(false);
		// Reset any other modal states you have
	};

	const [manuscripts, setManuscripts] = useState<any>([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);
	const [remarks, setRemarks] = useState<any>([]);

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

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Layouting').then((res) => {
			setManuscripts(res.data);
		});
	};

	const getRemarks = async () => {
		for (let i = 0; i < selectedRecord?.reviewers.length; i++) {
			let reviewerId = selectedRecord?.reviewers[i]._id;

			await getRating(selectedRecord._id, reviewerId).then((res) =>
				setRemarks((prev: string[]) => [...prev, res?.data.remarks])
			);
		}
	};

	useEffect(() => {
		getRemarks();
	}, [selectedRecord]);

	useEffect(() => {
		getManuscripts();
	}, []);

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-xl font-semibold mb-4">Records</h3>
			<SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white">
					<thead className="bg-gray-100">
						<tr>
							<th className="py-3 px-4 text-left">File Code</th>
							<th className="py-3 px-4 text-left">Journal/Research Title</th>
							<th className="py-3 px-4 text-left">Field/Scope</th>
							<th className="py-3 px-4 text-left">Author</th>
							<th className="py-3 px-4 text-left">Date Submitted</th>
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
										<td className="py-4 px-4">
											{record.scope ||
												`${
													record.scopeType.charAt(0).toUpperCase() +
													record.scopeType.slice(1)
												} ${record.scope}`}
										</td>
										<td className="py-4 px-4">{record.authors[0]}</td>
										<td className="py-4 px-4">
											{moment(record.dateSubmitted).format('LL')}
										</td>
										<td className="py-4 px-4">
											<div className="flex items-center space-x-2">
												<span
													className={`px-2 py-1 rounded-full text-xs ${
														record.layoutStatus === 'completed'
															? 'bg-green-100 text-green-800'
															: record.layoutStatus === 'revised'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.layoutStatus === 'completed'
														? 'Completed'
														: record.layoutStatus === 'revised'
														? 'For Revision'
														: 'In Progress'}
												</span>
												{record.layoutDetails?.revisionComments && (
													<button
														onClick={() => {
															setSelectedRecord(record);
															setIsStatusModalOpen(true);
														}}
														className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
													>
														<Eye size={12} className="mr-1" />
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
										<td className="py-4 px-4">
											{record.scope ||
												`${
													record.scopeType.charAt(0).toUpperCase() +
													record.scopeType.slice(1)
												} ${record.scope}`}
										</td>
										<td className="py-4 px-4">{record.authors[0]}</td>
										<td className="py-4 px-4">
											{moment(record.dateSubmitted).format('LL')}
										</td>
										<td className="py-4 px-4">
											<div className="flex items-center space-x-2">
												<span
													className={`px-2 py-1 rounded-full text-xs ${
														record.layoutStatus === 'Completed'
															? 'bg-green-100 text-green-800'
															: record.layoutStatus === 'For Revision'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-blue-100 text-blue-800'
													}`}
												>
													{record.layoutStatus === 'completed'
														? 'Completed'
														: record.layoutStatus === 'revised'
														? 'For Revision'
														: 'In Progress'}
												</span>
												{record.layoutDetails?.revisionComments && (
													<button
														onClick={() => {
															setSelectedRecord(record);
															setIsStatusModalOpen(true);
														}}
														className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center"
													>
														<Eye size={12} className="mr-1" />
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

			{/* Layout Details Modal */}
			{isModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[1100px] max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">
								{showFPRForm
									? 'Proceed to Final Proofreading'
									: 'Manuscript Details'}
							</h3>
							<button
								title="cancelbtn"
								onClick={() => {
									setIsModalOpen(false);
									setShowFPRForm(false);
									setMissingFields([]);
									setSelectedRecord({});
									setRemarks([]);
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						{!showFPRForm ? (
							<div className="grid grid-cols-2 gap-4">
								<div className="flex-1 space-y-4">
									{/* Manuscript Information */}
									<div className="bg-gray-50 p-4 rounded-lg mb-6">
										<h4 className="font-semibold text-gray-800 mb-3">
											Manuscript Information
										</h4>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="font-medium text-gray-700 block">
													File Code:
												</label>
												<p className="text-gray-800">
													{selectedRecord.scopeCode}
												</p>
											</div>
											<div>
												<label className="font-medium text-gray-700 block">
													Date Submitted:
												</label>
												<p className="text-gray-800">
													{moment(selectedRecord.dateSubmitted).format('LL')}
												</p>
											</div>
											<div className="col-span-2">
												<label className="font-medium text-gray-700 block">
													Journal/Research Title:
												</label>
												<p className="text-gray-800">{selectedRecord.title}</p>
											</div>
											<div className="col-span-2">
												<label className="font-medium text-gray-700 block">
													Author/s:
												</label>
												<p className="text-gray-800">
													{selectedRecord.authors[0]}
												</p>
											</div>
											<div className="col-span-2">
												<label className="font-medium text-gray-700 block">
													Field/Scope:
												</label>
												<p className="text-gray-800">
													{selectedRecord.fieldScope ||
														`${
															selectedRecord.scopeType.charAt(0).toUpperCase() +
															selectedRecord.scopeType.slice(1)
														} ${selectedRecord.scope}`}
												</p>
											</div>
											<div className="col-span-2">
												<label className="font-medium text-gray-700 block">
													Editor:
												</label>
												<p className="text-gray-700">
													{selectedRecord.editor.firstname}{' '}
													{selectedRecord.editor.lastname}
												</p>
											</div>
										</div>
									</div>

									{/* Add Scores Display */}
									<div className="bg-gray-50 p-4 rounded-lg mb-6">
										<h4 className="font-semibold text-gray-800 mb-3">
											Manuscript Scores
										</h4>
										<ScoresDisplay manuscript={selectedRecord} />
									</div>

									{/* Layout Information */}
									<div className="bg-gray-50 p-4 rounded-lg mb-6">
										<h4 className="font-semibold text-gray-800 mb-3">
											Layout Information
										</h4>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="font-medium text-gray-700 block">
													Layout Artist:
												</label>
												<p className="text-gray-700">
													{selectedRecord.layoutArtistName || 'Not assigned'}
												</p>
											</div>
											<div>
												<label className="font-medium text-gray-700 block">
													Layout Artist Email:
												</label>
												<p className="text-gray-700">
													{selectedRecord.layoutArtistEmail || 'Not assigned'}
												</p>
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex justify-end space-x-4">
										<button
											onClick={() => setIsModalOpen(false)}
											className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
										>
											Close
										</button>
										<button
											onClick={() => setIsReviseModalOpen(true)}
											className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
										>
											Revise
										</button>
										<button
											onClick={handleProceedToFPRClick}
											className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
										>
											Proceed to FPR
										</button>
									</div>
								</div>

								{/* Assigned Reviewers Section */}
								<div className="w-[350px] border-l pl-6">
									<h4 className="text-lg font-semibold mb-4">
										Assigned Reviewers
									</h4>
									<div className="space-y-4">
										{selectedRecord.reviewers?.map(
											(reviewer: any, index: number) => (
												<div
													key={index}
													className="bg-white p-3 rounded-md shadow-sm border border-gray-100"
												>
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

													{selectedRecord && (
														<div className="mt-2">
															<label className="block text-sm font-medium text-gray-700 mb-1">
																Remarks
															</label>
															<span
																className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
																	remarks[index] === 'Excellent'
																		? 'bg-green-100 text-green-800'
																		: remarks[index] === 'acceptable'
																		? 'bg-blue-100 text-blue-800'
																		: remarks[index] ===
																		  'acceptable-with-revision'
																		? 'bg-yellow-100 text-yellow-800'
																		: 'bg-red-100 text-red-800'
																}`}
															>
																{remarks[index]
																	?.split('-')
																	.map(
																		(word: string) =>
																			word.charAt(0).toUpperCase() +
																			word.slice(1)
																	)
																	.join(' ') || 'No Remarks found'}
															</span>
														</div>
													)}
												</div>
											)
										)}
										{(!selectedRecord.reviewers ||
											selectedRecord.reviewers.length === 0) && (
											<p className="text-gray-500 italic">
												No reviewers assigned
											</p>
										)}
									</div>
								</div>
							</div>
						) : (
							<div>
								{/* FPR Form View */}
								<div className="space-y-6">
									{missingFields.length > 0 && (
										<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
											<p className="text-red-600 font-medium mb-2">
												Please fill out the following required fields:
											</p>
											<ul className="list-disc list-inside text-red-600">
												{missingFields.map((field, index) => (
													<li key={index}>{field}</li>
												))}
											</ul>
										</div>
									)}
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Date Finished
											</label>
											<input
												type="date"
												value={dateFinished}
												onChange={(e) => setDateFinished(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Proofreader Name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={proofreader}
												onChange={handleProofreaderChange}
												onBlur={() =>
													setProofreaderError(
														proofreader ? '' : 'Proofreader name is required.'
													)
												}
												className={`w-full px-3 py-2 border ${
													proofreaderError
														? 'border-red-500'
														: 'border-gray-300'
												} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
												placeholder="Enter proofreader name"
												required
											/>
											{proofreaderError && (
												<p className="text-red-500 text-sm mt-1">
													{proofreaderError}
												</p>
											)}
										</div>
										<div className="col-span-2">
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Proofreader Email{' '}
												<span className="text-red-500">*</span>
											</label>
											<input
												type="email"
												value={proofreaderEmail}
												onChange={handleProofreaderEmailChange}
												onBlur={() =>
													setProofreaderEmailError(
														validateEmail(proofreaderEmail)
													)
												}
												className={`w-full px-3 py-2 border ${
													proofreaderEmailError
														? 'border-red-500'
														: 'border-gray-300'
												} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
												placeholder="Enter proofreader email (e.g., proofreader@example.com)"
												required
											/>
											{proofreaderEmailError && (
												<p className="text-red-500 text-sm mt-1">
													{proofreaderEmailError}
												</p>
											)}
										</div>
									</div>

									{/* Add action buttons */}
									<div className="flex justify-end space-x-4 mt-6">
										<button
											onClick={() => setIsModalOpen(false)}
											className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
										>
											Cancel
										</button>
										<button
											onClick={() => setIsConfirmationModalOpen(true)}
											disabled={!isFormComplete()}
											className={`px-4 py-2 rounded-md transition-colors ${
												isFormComplete()
													? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
													: 'bg-gray-300 text-gray-500 cursor-not-allowed'
											}`}
										>
											Proceed to FPR
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Revision Modal */}
			{isReviseModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[600px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Revision Comments</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsReviseModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						{/* Manuscript Info */}
						<div className="mb-4 p-4 bg-gray-50 rounded-md">
							<h4 className="font-medium mb-2">Manuscript Details</h4>
							<p className="text-sm text-gray-600">
								Title: {selectedRecord.title}
							</p>
							<p className="text-sm text-gray-600">
								Author Email: {selectedRecord.authorEmail}
							</p>
						</div>

						{/* Comments Section */}
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Revision Comments
								</label>
								<textarea
									value={revisionComments}
									onChange={(e) => setRevisionComments(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={6}
									placeholder="Enter your revision comments here..."
									required
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => setIsReviseModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleRevise}
								disabled={!revisionComments}
								className={`px-4 py-2 rounded text-white ${
									revisionComments
										? 'bg-blue-500 hover:bg-blue-600'
										: 'bg-gray-400 cursor-not-allowed'
								} transition-colors`}
							>
								Submit Revision
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revision Confirmation Modal */}
			{showRevisionConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<h3 className="text-xl font-semibold mb-4">Confirm Revision</h3>
						<p className="text-gray-700 mb-6">
							Are you sure you want to send this manuscript for revision?
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setShowRevisionConfirmation(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={confirmRevision}
								className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Revision Success Modal */}
			{showRevisionSuccess && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px]">
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Success!
							</h3>
							<p className="text-sm text-gray-500 mb-6">
								The manuscript has been successfully sent for revision.
							</p>
							<button
								onClick={() => {
									setShowRevisionSuccess(false);
									closeAllModals();
								}}
								className="w-full inline-flex justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
							>
								Close
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
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Success!
							</h3>
							<p className="text-sm text-gray-500 mb-6">
								Successfully moved to Final Proofreading section!
							</p>
							<button
								onClick={() => {
									setIsSuccessModalOpen(false);
									setIsModalOpen(false);
									setShowFPRForm(false);
								}}
								className="w-full inline-flex justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Confirmation Modal */}
			{isConfirmationModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="mb-4">
							<h3 className="text-lg font-medium text-gray-900">
								Confirm Proceed to FPR
							</h3>
							<p className="text-sm text-gray-500 mt-2">
								Are you sure you want to proceed this manuscript to Final
								Proofreading?
							</p>
						</div>
						<div className="mt-6 flex justify-end space-x-4">
							<button
								onClick={() => setIsConfirmationModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmProceedToFPR}
								disabled={!isFormComplete()}
								className={`px-4 py-2 rounded-md transition-colors ${
									isFormComplete()
										? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status Modal */}
			{isStatusModalOpen && selectedRecord && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[500px]">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Layout Status</h3>
							<button
								title="cancelbtn"
								onClick={() => setIsStatusModalOpen(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold mb-2">Manuscript Title:</h4>
								<p className="text-gray-700">{selectedRecord.title}</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Status:</h4>
								<span
									className={`px-3 py-1 rounded-full text-sm ${
										selectedRecord.layoutStatus === 'completed'
											? 'bg-green-100 text-green-800'
											: selectedRecord.layoutStatus === 'revised'
											? 'bg-yellow-100 text-yellow-800'
											: 'bg-blue-100 text-blue-800'
									}`}
								>
									{selectedRecord.layoutStatus === 'completed'
										? 'Completed'
										: selectedRecord.layoutStatus === 'revised'
										? 'For Revision'
										: 'In Progress'}
								</span>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Layout Artist:</h4>
								<p className="text-gray-700">
									{selectedRecord.layoutDetails?.layoutArtist || 'Not assigned'}
								</p>
							</div>
							<div>
								<h4 className="font-semibold mb-2">Layout Artist Email:</h4>
								<p className="text-gray-700">
									{selectedRecord.layoutDetails?.layoutArtistEmail ||
										'Not assigned'}
								</p>
							</div>
							{selectedRecord.firstRevisionDate && (
								<div>
									<h4 className="font-semibold mb-2">First Revision Date:</h4>
									<p className="text-gray-700">
										{selectedRecord.firstRevisionDate}
									</p>
								</div>
							)}
							{selectedRecord.layoutDetails?.dateFinished && (
								<div>
									<h4 className="font-semibold mb-2">Date Finished:</h4>
									<p className="text-gray-700">
										{selectedRecord.layoutDetails.dateFinished}
									</p>
								</div>
							)}
							{/* Revision History Section */}
							{selectedRecord.layoutDetails?.revisionComments && (
								<div>
									<h4 className="font-semibold mb-2">Revision History:</h4>
									<div className="bg-gray-50 p-4 rounded-md">
										<div className="mb-2">
											<span className="text-sm text-gray-500">
												Revision Comment:
											</span>
										</div>
										<p className="text-gray-700 whitespace-pre-wrap">
											{selectedRecord.layoutDetails.revisionComments}
										</p>
									</div>
								</div>
							)}
						</div>
						<div className="mt-6 flex justify-end">
							<button
								onClick={() => setIsStatusModalOpen(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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

export default StaffLayouting;
