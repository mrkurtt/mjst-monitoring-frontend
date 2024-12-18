import React, { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useRecords } from '../contexts/RecordContext';
import { useReviewers } from '../contexts/ReviewersContext';
import SearchBar from './SearchBar';
import ScoresDisplay from './shared/ScoresDisplay';
import { getManuscriptByStepStatus } from '../api/manuscript.api';
import moment from 'moment';
import { getRating } from '../api/rating.api';

const DirectorDoubleBlind: React.FC = () => {
	const { doubleBlindRecords } = useRecords();
	const { reviewers } = useReviewers();
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedManuscript, setSelectedManuscript] = useState<any>(null);

	const filteredRecords = doubleBlindRecords.filter(
		(record) =>
			record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.scopeCode.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleViewDetails = async (manuscript: any) => {
		try {
			console.log('Attempting to view manuscript:', manuscript);
			// First set the basic manuscript details
			setSelectedManuscript(manuscript);
			setIsModalOpen(true);

			// Update the fetch URL to match your API endpoint
			// const response = await fetch(`/api/doubleblind/${manuscript.id}`);
			// if (!response.ok) {
			// 	throw new Error('Failed to fetch manuscript details');
			// }
			// const data = await response.json();
			// console.log('Fetched manuscript details:', data);

			// // Update the manuscript with staff details
			// setSelectedManuscript((prev) => ({
			// 	...prev,
			// 	staffDoubleBlind: {
			// 		reviewer1: data.reviewer1,
			// 		reviewer2: data.reviewer2,
			// 		reviewer3: data.reviewer3,
			// 	},
			// }));
		} catch (error) {
			console.error('Error in handleViewDetails:', error);
		}
	};

	const [manuscripts, setManuscripts] = useState([]);
	const [filteredManuscripts, setFilteredManuscripts] = useState([]);
	const [remarks, setRemarks] = useState<any>([]);

	const getManuscripts = async () => {
		await getManuscriptByStepStatus('Double-Blind').then((res) => {
			setManuscripts(res.data);
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
		getRemarks();
	}, [selectedManuscript]);

	useEffect(() => {
		getManuscripts();
	}, []);

	useEffect(() => {
		filterRecords();
	}, [searchTerm]);

	return (
		<div className="bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-xl font-semibold mb-4">
				Double-Blind Review Records
			</h3>
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
							<th className="py-3 px-4 text-left">Affiliation</th>
							<th className="py-3 px-4 text-left">Status</th>
							<th className="py-3 px-4 text-left">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{manuscripts.map((record: any, index: number) => (
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
								<td className="py-4 px-4">{record.authors[0]}</td>
								<td className="py-4 px-4">{record.affiliation}</td>
								<td className="py-4 px-4">
									{record.revisionStatus && (
										<span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
											{record.progressStatus}
										</span>
									)}
								</td>
								<td className="py-4 px-4">
									<button
										onClick={() => {
											console.log('View button clicked for record:', record);
											handleViewDetails(record);
										}}
										className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors inline-flex items-center cursor-pointer"
										type="button"
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
					<div className="bg-white p-6 rounded-lg w-[1100px] max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">
								Double-Blind Review Details
							</h3>
							<button
								title="cancelbtn"
								onClick={() => {
									setIsModalOpen(false);
									setRemarks([]);
								}}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={24} />
							</button>
						</div>

						<div className="grid grid-cols-3 gap-6">
							{/* Left Column - Manuscript Info */}
							<div className="col-span-2 space-y-6">
								{/* Basic Information */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-semibold text-gray-800 mb-3">
										Manuscript Information
									</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="font-medium text-gray-700 block">
												File Code:
											</label>
											<p className="text-gray-700">
												{selectedManuscript.fileCode}
											</p>
										</div>
										<div>
											<label className="font-medium text-gray-700 block">
												Date Submitted:
											</label>
											<p className="text-gray-700">
												{moment(selectedManuscript?.dateSubmitted).format('LL')}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Title:
											</label>
											<p className="text-gray-700">
												{selectedManuscript.title}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Author/s:
											</label>
											<p className="text-gray-700">
												{selectedManuscript.authors[0]}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Field/Scope:
											</label>
											<p className="text-gray-700">
												{`${
													selectedManuscript.scopeType.charAt(0).toUpperCase() +
													selectedManuscript.scopeType.slice(1)
												} ${selectedManuscript.scope}`}
											</p>
										</div>
										<div className="col-span-2">
											<label className="font-medium text-gray-700 block">
												Editor:
											</label>
											<p className="text-gray-700">
												{selectedManuscript.editor.firstname}{' '}
												{selectedManuscript.editor.lastname}
											</p>
										</div>
									</div>
								</div>

								{/* Manuscript Scores */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="font-semibold text-gray-800 mb-3">
										Manuscript Scores
									</h4>
									<ScoresDisplay manuscript={selectedManuscript} />
								</div>
							</div>

							{/* Right Column - Assigned Reviewers */}
							<div>
								<h4 className="font-semibold text-gray-800 mb-3">
									Assigned Reviewers
								</h4>
								<div className="space-y-4">
									{selectedManuscript.reviewers?.map(
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

												{selectedManuscript && (
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
																		word.charAt(0).toUpperCase() + word.slice(1)
																)
																.join(' ') || 'No Remarks found'}
														</span>
													</div>
												)}
											</div>
										)
									)}

									{!selectedManuscript?.reviewers && (
										<p className="text-gray-500 italic">
											No reviewers assigned
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								onClick={() => {
									setIsModalOpen(false);
									setRemarks([]);
								}}
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

export default DirectorDoubleBlind;
