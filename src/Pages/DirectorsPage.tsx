import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { directorMenuItems } from '../contexts/MenuItems';
import DashboardContent from '../components/DashboardContent';
import DirectorPreReview from '../components/DirectorPreReview';
import DirectorDoubleBlind from '../components/DirectorDoubleBlind';
import DirectorPublished from '../components/DirectorPublished';
import DirectorRejected from '../components/DirectorRejected';
import DirectorReviewersInfo from '../components/DirectorReviewersInfo';
import DirectorEditorsInfo from '../components/DirectorEditorsInfo';
import DirectorCreateAccount from './DirectorCreateAccount';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';
import { DashboardProvider } from '../contexts/DashboardContext';
import logoImage from '../assets/logo.png';
import Cookies from 'js-cookie';

const DirectorsPage: React.FC = () => {
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [activeTab, setActiveTab] = useState('dashboard');
	const navigate = useNavigate();

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

	const handleMenuItemClick = (id: string) => {
		setActiveTab(id);
	};

	const renderContent = () => {
		switch (activeTab) {
			case 'dashboard':
				return <DashboardContent />;
			case 'pre-review':
				return <DirectorPreReview />;
			case 'double-blind':
				return <DirectorDoubleBlind />;
			case 'published':
				return <DirectorPublished />;
			case 'rejected':
				return <DirectorRejected />;
			case 'reviewers-info':
				return <DirectorReviewersInfo />;
			case 'editors-info':
				return <DirectorEditorsInfo />;
			case 'create-account':
				return <DirectorCreateAccount />;
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
						{directorMenuItems.map((section, index) => (
							<div key={index} className="mb-8">
								<h2 className="px-6 mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
									{section.title}
								</h2>
								<div>
									{section.items.map((item) => (
										<button
											key={item.id}
											onClick={() => handleMenuItemClick(item.id)}
											className={`w-full text-left py-3 px-6 hover:bg-blue-800 transition duration-200 flex items-center ${
												activeTab === item.id ? 'bg-blue-800' : ''
											}`}
										>
											{item.icon && <item.icon size={18} className="mr-3" />}
											<span>{item.name}</span>
										</button>
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
								title="sidebar"
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

export default DirectorsPage;
