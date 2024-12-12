import React, {
	createContext,
	useContext,
	useCallback,
	useRef,
	useEffect,
} from 'react';
import { useRecords } from './RecordContext';
import { useEditors } from './EditorsContext';
import { useReviewers } from './ReviewersContext';
import useLocalStorage from '../hooks/useLocalStorage';

interface MonthlySubmission {
	name: string;
	value: number;
}

interface DashboardStats {
	uploadCount: number;
	preReviewCount: number;
	doubleBlindCount: number;
	acceptedCount: number;
	publishedCount: number;
	rejectedCount: number;
	reviewersCount: number;
	editorsCount: number;
	firstHalfSubmissions: MonthlySubmission[];
	secondHalfSubmissions: MonthlySubmission[];
	internalSubmissions: number;
	externalSubmissions: number;
}

const initialMonthlyData = {
	firstHalf: [
		{ name: 'Jan', value: 0 },
		{ name: 'Feb', value: 0 },
		{ name: 'Mar', value: 0 },
		{ name: 'Apr', value: 0 },
		{ name: 'May', value: 0 },
		{ name: 'Jun', value: 0 },
	],
	secondHalf: [
		{ name: 'Jul', value: 0 },
		{ name: 'Aug', value: 0 },
		{ name: 'Sep', value: 0 },
		{ name: 'Oct', value: 0 },
		{ name: 'Nov', value: 0 },
		{ name: 'Dec', value: 0 },
	],
};

const DashboardContext = createContext<
	DashboardStats & { updateStats: () => void }
>({
	uploadCount: 0,
	preReviewCount: 0,
	doubleBlindCount: 0,
	acceptedCount: 0,
	publishedCount: 0,
	rejectedCount: 0,
	reviewersCount: 0,
	editorsCount: 0,
	firstHalfSubmissions: initialMonthlyData.firstHalf,
	secondHalfSubmissions: initialMonthlyData.secondHalf,
	internalSubmissions: 0,
	externalSubmissions: 0,
	updateStats: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const {
		manuscriptRecords,
		doubleBlindRecords,
		acceptedRecords,
		finalProofreadingRecords,
		publishedRecords,
		rejectedRecords,
	} = useRecords();
	const { editors } = useEditors();
	const { reviewers } = useReviewers();

	const [monthlyStats, setMonthlyStats] = useLocalStorage<{
		firstHalf: MonthlySubmission[];
		secondHalf: MonthlySubmission[];
	}>('monthlyStats', initialMonthlyData);

	const [stats, setStats] = useLocalStorage<
		Omit<DashboardStats, 'firstHalfSubmissions' | 'secondHalfSubmissions'>
	>('dashboardStats', {
		uploadCount: 0,
		preReviewCount: 0,
		doubleBlindCount: 0,
		acceptedCount: 0,
		publishedCount: 0,
		rejectedCount: 0,
		reviewersCount: 0,
		editorsCount: 0,
		internalSubmissions: 0,
		externalSubmissions: 0,
	});

	const [selectedYear, setSelectedYear] = useLocalStorage<number>(
		'selectedYear',
		new Date().getFullYear()
	);

	const updateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

	const calculateMonthlySubmissions = useCallback(() => {
		const allRecords = [
			...manuscriptRecords,
			...doubleBlindRecords,
			...acceptedRecords,
			...finalProofreadingRecords,
			...publishedRecords,
			...rejectedRecords,
		];

		// console.log(
		// 	'All Records:',
		// 	allRecords.map((record) => ({
		// 		date: record.date,
		// 		scopeCode: record.scopeCode,
		// 		status: record.status,
		// 	}))
		// );

		// Initialize monthly data array with zeros
		const monthlyData = new Array(12).fill(0);

		// Count submissions for each month based on submission date
		allRecords.forEach((record) => {
			if (record.date) {
				const submissionDate = new Date(record.date);
				const year = submissionDate.getFullYear();

				// Only count submissions for the selected year
				if (year === selectedYear) {
					const month = submissionDate.getMonth();
					monthlyData[month]++;
					console.log(
						`Counting submission for ${record.date}, Month: ${month}, Year: ${year}`
					);
				}
			} else {
				console.log('Record without date:', record);
			}
		});

		// Update first half (January to June: months 0-5)
		const updatedFirstHalf = [
			{ name: 'Jan', value: monthlyData[0] },
			{ name: 'Feb', value: monthlyData[1] },
			{ name: 'Mar', value: monthlyData[2] },
			{ name: 'Apr', value: monthlyData[3] },
			{ name: 'May', value: monthlyData[4] },
			{ name: 'Jun', value: monthlyData[5] },
		];

		// Update second half (July to December: months 6-11)
		const updatedSecondHalf = [
			{ name: 'Jul', value: monthlyData[6] },
			{ name: 'Aug', value: monthlyData[7] },
			{ name: 'Sep', value: monthlyData[8] },
			{ name: 'Oct', value: monthlyData[9] },
			{ name: 'Nov', value: monthlyData[10] },
			{ name: 'Dec', value: monthlyData[11] },
		];

		// console.log('First Half Submissions:', updatedFirstHalf);
		// console.log('Second Half Submissions:', updatedSecondHalf);

		setMonthlyStats({
			firstHalf: updatedFirstHalf,
			secondHalf: updatedSecondHalf,
		});

		return { firstHalf: updatedFirstHalf, secondHalf: updatedSecondHalf };
	}, [
		manuscriptRecords,
		doubleBlindRecords,
		acceptedRecords,
		finalProofreadingRecords,
		publishedRecords,
		rejectedRecords,
		setMonthlyStats,
		selectedYear,
	]);

	const calculateStats = useCallback(() => {
		const { firstHalf, secondHalf } = calculateMonthlySubmissions();

		const internalRecords = [
			...manuscriptRecords,
			...doubleBlindRecords,
		].filter((record) => record.scopeType === 'internal');
		const externalRecords = [
			...manuscriptRecords,
			...doubleBlindRecords,
		].filter((record) => record.scopeType === 'external');

		const newStats = {
			uploadCount:
				manuscriptRecords.length +
				doubleBlindRecords.length +
				acceptedRecords.length +
				finalProofreadingRecords.length +
				publishedRecords.length +
				rejectedRecords.length,
			preReviewCount: manuscriptRecords.length,
			doubleBlindCount: doubleBlindRecords.length,
			acceptedCount: acceptedRecords.length,
			publishedCount: publishedRecords.length,
			rejectedCount: rejectedRecords.length,
			reviewersCount: reviewers.length,
			editorsCount: editors.length,
			internalSubmissions: internalRecords.length,
			externalSubmissions: externalRecords.length,
		};

		setStats(newStats);
		return { firstHalf, secondHalf };
	}, [
		manuscriptRecords,
		doubleBlindRecords,
		acceptedRecords,
		finalProofreadingRecords,
		publishedRecords,
		rejectedRecords,
		reviewers,
		editors,
		calculateMonthlySubmissions,
		setStats,
	]);

	useEffect(() => {
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
		updateTimeoutRef.current = setTimeout(() => {
			calculateStats();
		}, 100);

		return () => {
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}
		};
	}, [calculateStats]);

	const updateStats = useCallback(() => {
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
		calculateStats();
	}, [calculateStats]);

	return (
		<DashboardContext.Provider
			value={{
				...stats,
				firstHalfSubmissions: monthlyStats.firstHalf,
				secondHalfSubmissions: monthlyStats.secondHalf,
				updateStats,
			}}
		>
			{children}
		</DashboardContext.Provider>
	);
};
