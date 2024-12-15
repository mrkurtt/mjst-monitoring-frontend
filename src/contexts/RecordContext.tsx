import React, { createContext, useContext, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

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
	status:
		| 'pre-review'
		| 'double-blind'
		| 'rejected'
		| 'accepted'
		| 'final-proofreading'
		| 'published';
	revisionStatus?: string;
	revisionComments?: string;
	rejectionReason?: string;
	rejectionComment?: string;
	layoutDetails?: {
		dateAccepted?: string;
		layoutArtist?: string;
		layoutArtistEmail?: string;
		status: 'pending' | 'in-progress' | 'completed' | 'revised';
		revisionStatus?: string;
		revisionComments?: string;
		dateAssigned?: string;
	};
	proofreadingDetails?: {
		dateSent: string;
		proofreader: string;
		status: 'pending' | 'in-progress' | 'completed';
		revisionStatus?: string;
	};
	publishDetails?: {
		scopeNumber: string;
		volumeYear: string;
		datePublished: string;
		paymentStatus?: 'paid' | 'not-paid';
	};
}

interface RecordContextType {
	manuscriptRecords: ManuscriptDetails[];
	doubleBlindRecords: ManuscriptDetails[];
	rejectedRecords: ManuscriptDetails[];
	acceptedRecords: ManuscriptDetails[];
	finalProofreadingRecords: ManuscriptDetails[];
	publishedRecords: ManuscriptDetails[];
	addManuscript: (manuscript: ManuscriptDetails) => void;
	updateManuscriptStatus: (
		id: string,
		status: ManuscriptDetails['status'],
		details?: Partial<ManuscriptDetails>
	) => void;
	updateLayoutDetails: (
		id: string,
		layoutDetails: ManuscriptDetails['layoutDetails']
	) => void;
	updateProofreadingDetails: (
		id: string,
		proofreadingDetails: ManuscriptDetails['proofreadingDetails']
	) => void;
	updatePaymentStatus: (id: string, paymentStatus: 'paid' | 'not-paid') => void;
	removeFromPreReview: (id: string) => void;
}

const RecordContext = createContext<RecordContextType>({
	manuscriptRecords: [],
	doubleBlindRecords: [],
	rejectedRecords: [],
	acceptedRecords: [],
	finalProofreadingRecords: [],
	publishedRecords: [],
	addManuscript: () => {},
	updateManuscriptStatus: () => {},
	updateLayoutDetails: () => {},
	updateProofreadingDetails: () => {},
	updatePaymentStatus: () => {},
	removeFromPreReview: () => {},
});

export const useRecords = () => useContext(RecordContext);

export const RecordProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [manuscriptRecords, setManuscriptRecords] = useLocalStorage<
		ManuscriptDetails[]
	>('manuscriptRecords', []);
	const [doubleBlindRecords, setDoubleBlindRecords] = useLocalStorage<
		ManuscriptDetails[]
	>('doubleBlindRecords', []);
	const [rejectedRecords, setRejectedRecords] = useLocalStorage<
		ManuscriptDetails[]
	>('rejectedRecords', []);
	const [acceptedRecords, setAcceptedRecords] = useLocalStorage<
		ManuscriptDetails[]
	>('acceptedRecords', []);
	const [finalProofreadingRecords, setFinalProofreadingRecords] =
		useLocalStorage<ManuscriptDetails[]>('finalProofreadingRecords', []);
	const [publishedRecords, setPublishedRecords] = useLocalStorage<
		ManuscriptDetails[]
	>('publishedRecords', []);

	const addManuscript = (manuscript: ManuscriptDetails) => {
		setManuscriptRecords((prev) => [...prev, manuscript]);
	};

	const removeFromPreReview = (id: string) => {
		setManuscriptRecords((prev) => prev.filter((m) => m.id !== id));
	};

	const updateLayoutDetails = (
		id: string,
		layoutDetails: ManuscriptDetails['layoutDetails']
	) => {
		setAcceptedRecords((prev) =>
			prev.map((record) =>
				record.id === id
					? {
							...record,
							layoutDetails: {
								...record.layoutDetails,
								...layoutDetails,
							},
					  }
					: record
			)
		);
	};

	const updateProofreadingDetails = (
		id: string,
		proofreadingDetails: ManuscriptDetails['proofreadingDetails']
	) => {
		setFinalProofreadingRecords((prev) =>
			prev.map((record) =>
				record.id === id ? { ...record, proofreadingDetails } : record
			)
		);
	};

	const updatePaymentStatus = (
		id: string,
		paymentStatus: 'paid' | 'not-paid'
	) => {
		setPublishedRecords((prev) =>
			prev.map((record) =>
				record.id === id
					? {
							...record,
							publishDetails: {
								...record.publishDetails,
								paymentStatus,
							},
					  }
					: record
			)
		);
	};

	const updateManuscriptStatus = (
		id: string,
		status: ManuscriptDetails['status'],
		details?: Partial<ManuscriptDetails>
	) => {
		if (status === 'pre-review' && details?.revisionStatus === 'For Revision') {
			setManuscriptRecords((prev) =>
				prev.map((manuscript) =>
					manuscript.id === id
						? {
								...manuscript,
								...details,
								status: 'pre-review',
						  }
						: manuscript
				)
			);
			return;
		}

		const manuscript =
			manuscriptRecords.find((m) => m.id === id) ||
			doubleBlindRecords.find((m) => m.id === id) ||
			acceptedRecords.find((m) => m.id === id) ||
			finalProofreadingRecords.find((m) => m.id === id);

		if (!manuscript) return;

		const updatedManuscript = {
			...manuscript,
			...details,
			status,
			layoutDetails: {
				...manuscript.layoutDetails,
				...(details?.layoutDetails || {}),
			},
		};

		// Remove from current list
		if (manuscript.status === 'pre-review') {
			setManuscriptRecords((prev) => prev.filter((m) => m.id !== id));
		} else if (manuscript.status === 'double-blind') {
			setDoubleBlindRecords((prev) => prev.filter((m) => m.id !== id));
		} else if (manuscript.status === 'accepted') {
			setAcceptedRecords((prev) => prev.filter((m) => m.id !== id));
		} else if (manuscript.status === 'final-proofreading') {
			setFinalProofreadingRecords((prev) => prev.filter((m) => m.id !== id));
		}

		// Add to appropriate list based on status
		switch (status) {
			case 'double-blind':
				setDoubleBlindRecords((prev) => [...prev, updatedManuscript]);
				break;
			case 'rejected':
				setRejectedRecords((prev) => [...prev, updatedManuscript]);
				break;
			case 'accepted':
				setAcceptedRecords((prev) => [...prev, updatedManuscript]);
				break;
			case 'final-proofreading':
				setFinalProofreadingRecords((prev) => [...prev, updatedManuscript]);
				break;
			case 'published':
				setPublishedRecords((prev) => [
					...prev,
					{
						...updatedManuscript,
						publishDetails: {
							...updatedManuscript.publishDetails,
							paymentStatus: 'not-paid',
						},
					},
				]);
				break;
		}
	};

	const fetchPublishedRecords = async () => {
		try {
			const response = await fetch('/api/published');
			const data = await response.json();
			console.log('Raw Published Data:', data);

			// Fetch staff published details for each record
			const enrichedData = await Promise.all(
				data.map(async (record: any) => {
					try {
						const staffPublishedRes = await fetch(
							`/api/staff-published/${record.id}`
						);
						const staffPublished = await staffPublishedRes.json();
						console.log(
							`Staff Published Data for ${record.id}:`,
							staffPublished
						);

						return {
							...record,
							staffPublished: staffPublished,
						};
					} catch (error) {
						console.error(
							`Error fetching staff published data for record ${record.id}:`,
							error
						);
						return record;
					}
				})
			);

			console.log('Enriched Published Data:', enrichedData);
			setPublishedRecords(enrichedData);
		} catch (error) {
			console.error('Error fetching published records:', error);
		}
	};

	return (
		<RecordContext.Provider
			value={{
				manuscriptRecords,
				doubleBlindRecords,
				rejectedRecords,
				acceptedRecords,
				finalProofreadingRecords,
				publishedRecords,
				addManuscript,
				updateManuscriptStatus,
				updateLayoutDetails,
				updateProofreadingDetails,
				updatePaymentStatus,
				removeFromPreReview,
			}}
		>
			{children}
		</RecordContext.Provider>
	);
};

export default RecordContext;
