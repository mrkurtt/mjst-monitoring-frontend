import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { DashboardProvider } from '../contexts/DashboardContext';
import { staffMenuItems } from '../contexts/MenuItems';
import StaffPreReview from './StaffPreReview';
import StaffDoubleBlind from './StaffDoubleBlind';
import StaffAccepted from './StaffAccepted';
import StaffPublished from './StaffPublished';
import StaffRejected from './StaffRejected';
import StaffReviewersInfo from './StaffReviewersInfo';
import StaffEditorsInfo from './StaffEditorsInfo';
import StaffLayouting from './StaffLayouting';
import StaffFinalProofreading from './StaffFinalProofreading';
import DashboardContent from './DashboardContent';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import StaffCreateAccount from '../Pages/StaffCreateAccount';
import logoImage from '../assets/logo.png';
import { Bar, Line, Pie } from 'react-chartjs-2';
import Cookies from 'js-cookie';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);

const StaffDashboard: React.FC = () => {
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [activeTab, setActiveTab] = useState('dashboard');
	const [expandedMenus, setExpandedMenus] = useState<{
		[key: string]: boolean;
	}>({
		'pre-review': false,
		accepted: false,
	});
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [showSummaryReport, setShowSummaryReport] = useState(false);
	const navigate = useNavigate();

	const [summaryData, setSummaryData] = useState({
		manuscriptStats: {
			totalSubmissions: 0,
			accepted: 0,
			rejected: 0,
			inReview: 0,
		},
		monthlySubmissions: {
			labels: [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec',
			],
			data: Array(12).fill(0),
		},
		statusDistribution: {
			labels: [
				'Pre-Review',
				'Double-Blind',
				'Accepted',
				'Published',
				'Rejected',
			],
			data: Array(5).fill(0),
		},
	});

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// Replace with your actual API endpoint
				const response = await fetch('/api/dashboard-stats');
				const data = await response.json();

				setSummaryData({
					manuscriptStats: {
						totalSubmissions: data.totalSubmissions,
						accepted: data.acceptedCount,
						rejected: data.rejectedCount,
						inReview: data.inReviewCount,
					},
					monthlySubmissions: {
						labels: [
							'Jan',
							'Feb',
							'Mar',
							'Apr',
							'May',
							'Jun',
							'Jul',
							'Aug',
							'Sep',
							'Oct',
							'Nov',
							'Dec',
						],
						data: data.monthlySubmissions,
					},
					statusDistribution: {
						labels: [
							'Pre-Review',
							'Double-Blind',
							'Accepted',
							'Published',
							'Rejected',
						],
						data: [
							data.preReviewCount,
							data.doubleBlindCount,
							data.acceptedCount,
							data.publishedCount,
							data.rejectedCount,
						],
					},
				});
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			}
		};

		fetchDashboardData();
	}, []);

	const handleLogoutClick = () => {
		setShowLogoutModal(true);
	};

	const handleLogoutConfirm = () => {
		setShowLogoutModal(false);
		Cookies.remove('access_token');
		Cookies.remove('role');
		navigate('/');
	};

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	const toggleSubmenu = (menuId: string) => {
		setExpandedMenus((prev) => ({
			...prev,
			[menuId]: !prev[menuId],
		}));
	};

	const barChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: 'top' as const },
			title: { display: true, text: 'Monthly Submissions' },
		},
	};

	const pieChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: 'right' as const },
			title: { display: true, text: 'Manuscript Status Distribution' },
		},
	};

	const renderContent = () => {
		if (showSummaryReport) {
			return (
				<div className="p-6 bg-white rounded-lg shadow">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold">
							Overall Summary Report - {selectedYear}
						</h2>
						<div className="flex items-center gap-4">
							<button
								onClick={() => setSelectedYear((prev) => prev - 1)}
								className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
							>
								Previous Year
							</button>
							<span className="font-semibold">{selectedYear}</span>
							<button
								onClick={() => setSelectedYear((prev) => prev + 1)}
								className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
							>
								Next Year
							</button>
						</div>
					</div>

					<div className="grid grid-cols-4 gap-4 mb-8">
						<div className="p-4 bg-blue-100 rounded-lg">
							<h3 className="text-lg font-semibold">Total Submissions</h3>
							<p className="text-2xl font-bold">
								{summaryData.manuscriptStats.totalSubmissions}
							</p>
						</div>
						<div className="p-4 bg-green-100 rounded-lg">
							<h3 className="text-lg font-semibold">Accepted</h3>
							<p className="text-2xl font-bold">
								{summaryData.manuscriptStats.accepted}
							</p>
						</div>
						<div className="p-4 bg-red-100 rounded-lg">
							<h3 className="text-lg font-semibold">Rejected</h3>
							<p className="text-2xl font-bold">
								{summaryData.manuscriptStats.rejected}
							</p>
						</div>
						<div className="p-4 bg-yellow-100 rounded-lg">
							<h3 className="text-lg font-semibold">In Review</h3>
							<p className="text-2xl font-bold">
								{summaryData.manuscriptStats.inReview}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-8 mb-8">
						<div className="p-4 bg-white rounded-lg shadow">
							<Bar
								data={{
									labels: summaryData.monthlySubmissions.labels,
									datasets: [
										{
											label: 'Submissions',
											data: summaryData.monthlySubmissions.data,
											backgroundColor: 'rgba(53, 162, 235, 0.5)',
										},
									],
								}}
								options={barChartOptions}
							/>
						</div>
						<div className="p-4 bg-white rounded-lg shadow">
							<Pie
								data={{
									labels: summaryData.statusDistribution.labels,
									datasets: [
										{
											data: summaryData.statusDistribution.data,
											backgroundColor: [
												'rgba(255, 99, 132, 0.5)',
												'rgba(54, 162, 235, 0.5)',
												'rgba(255, 206, 86, 0.5)',
												'rgba(75, 192, 192, 0.5)',
												'rgba(153, 102, 255, 0.5)',
											],
										},
									],
								}}
								options={pieChartOptions}
							/>
						</div>
					</div>
					<div className="flex justify-center">
						<button
							onClick={() => setShowSummaryReport(!showSummaryReport)}
							className="px-6 py-2 bg-[#000765] text-white rounded-lg hover:bg-blue-900 transition-colors"
						>
							Back to Dashboard
						</button>
					</div>
				</div>
			);
		}

		switch (activeTab) {
			case 'dashboard':
				return <DashboardContent />;
			case 'pre-review-upload':
			case 'pre-review-records':
				return <StaffPreReview activeSubTab={activeTab} />;
			case 'double-blind':
				return <StaffDoubleBlind />;
			case 'layouting':
				return <StaffLayouting />;
			case 'final-proofreading':
				return <StaffFinalProofreading />;
			case 'published':
				return <StaffPublished />;
			case 'rejected':
				return <StaffRejected />;
			case 'reviewers-info':
				return <StaffReviewersInfo />;
			case 'editors-info':
				return <StaffEditorsInfo />;
			case 'create-account':
				return <StaffCreateAccount />;
			default:
				return <DashboardContent />;
		}
	};

	return (
		<DashboardProvider>
			<div className="flex h-screen bg-gray-100">
				{/* Sidebar */}
				<div
					className={`bg-[#000765] text-white w-64 fixed h-full transition-all duration-300 ease-in-out transform ${
						sidebarOpen ? 'translate-x-0' : '-translate-x-full'
					} flex flex-col`}
				>
					{/* Fixed header part of sidebar */}
					<div className="p-4 border-b border-gray-700 flex-shrink-0">
						<div className="flex items-center justify-center mb-4">
							<img
								src={logoImage}
								alt="MJST Logo"
								className="w-16 h-16 object-contain rounded"
							/>
						</div>
						<h1 className="text-xl font-bold text-center">
							MJST Monitoring System
						</h1>
					</div>

					{/* Scrollable navigation part */}
					<nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
						{staffMenuItems.map((section, index) => (
							<div key={index} className="mb-8">
								<h2 className="px-6 mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
									{section.title}
								</h2>
								<div>
									{section.items.map((item) => (
										<div key={item.id}>
											<button
												onClick={() => {
													if (item.items) {
														toggleSubmenu(item.id);
													} else {
														setActiveTab(item.id);
													}
												}}
												className={`w-full text-left py-3 px-6 hover:bg-blue-800 transition duration-200 flex items-center justify-between ${
													activeTab === item.id ||
													(item.items &&
														item.items.some(
															(subItem) => subItem.id === activeTab
														))
														? 'bg-blue-800'
														: ''
												}`}
											>
												<div className="flex items-center">
													{item.icon && (
														<item.icon size={18} className="mr-3" />
													)}
													<span>{item.name}</span>
												</div>
												{item.items &&
													(expandedMenus[item.id] ? (
														<ChevronDown
															size={16}
															className="transition-transform duration-200"
														/>
													) : (
														<ChevronRight
															size={16}
															className="transition-transform duration-200"
														/>
													))}
											</button>
											{item.items && (
												<div
													className={`overflow-hidden transition-all duration-300 ease-in-out ${
														expandedMenus[item.id] ? 'max-h-96' : 'max-h-0'
													}`}
												>
													{item.items.map((subItem) => (
														<button
															key={subItem.id}
															onClick={() => setActiveTab(subItem.id)}
															className={`w-full text-left py-2 px-8 hover:bg-blue-800 transition duration-200 flex items-center ${
																activeTab === subItem.id ? 'bg-blue-800' : ''
															}`}
														>
															{subItem.icon && (
																<subItem.icon size={16} className="mr-3" />
															)}
															{subItem.name}
														</button>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						))}
					</nav>
				</div>

				{/* Main content */}
				<div
					className={`flex-1 flex flex-col transition-all duration-300 ${
						sidebarOpen ? 'ml-64' : 'ml-0'
					}`}
				>
					{/* Header */}
					<header className="bg-[#000765] shadow-sm z-10">
						<div className="flex items-center justify-between px-6 py-4">
							<button
								onClick={toggleSidebar}
								className="text-white focus:outline-none"
							>
								<Menu size={24} />
							</button>
							<div className="flex items-center">
								<button
									onClick={handleLogoutClick}
									className="text-white hover:text-gray-200 flex items-center space-x-2"
								>
									<LogOut size={20} />
									<span>Logout</span>
								</button>
							</div>
						</div>
					</header>

					{/* Dashboard content */}
					<main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
						<div className="container mx-auto px-6 py-8">
							<h3 className="text-gray-700 text-3xl font-medium mb-4">
								{activeTab
									.split('-')
									.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' ')}
							</h3>
							{renderContent()}
						</div>
					</main>
				</div>

				<LogoutConfirmationModal
					isOpen={showLogoutModal}
					onClose={() => setShowLogoutModal(false)}
					onConfirm={handleLogoutConfirm}
				/>
			</div>
		</DashboardProvider>
	);
};

export default StaffDashboard;
