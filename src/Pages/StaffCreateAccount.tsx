import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import bgImage from '../assets/Bg.jpeg';
import { registerUser } from '../api/auth.api';

const StaffCreateAccount: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleCreateAccount = async () => {
		if (password !== confirmPassword) {
			alert("Passwords don't match!");
			return;
		} else {
			await registerUser({
				email,
				password,
				role: 1,
			}).then((res) => {
				if (res.status === 201) {
					setEmail('');
					setPassword('');
					setConfirmPassword('');
				}
			});
		}
		// console.log('Staff account created:', { email });
		// navigate('/staff/login');
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
			style={{
				backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImage})`,
			}}
		>
			<div className="bg-white p-8 rounded-lg shadow-md w-96">
				<h2 className="text-2xl font-bold mb-6 text-center text-[#111877]">
					Create Staff Account
				</h2>
				<div>
					<div className="mb-4">
						<label
							htmlFor="email"
							className="block text-gray-700 text-sm font-bold mb-2"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#111877]"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="password"
							className="block text-gray-700 text-sm font-bold mb-2"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#111877]"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="mb-6">
						<label
							htmlFor="confirmPassword"
							className="block text-gray-700 text-sm font-bold mb-2"
						>
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#111877]"
							placeholder="Confirm your password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>
					<button
						type="submit"
						onClick={handleCreateAccount}
						className="w-full bg-[#111877] text-white py-2 px-4 rounded-md hover:bg-[#1c2680] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
					>
						<UserPlus className="inline mr-2" size={18} />
						Create Account
					</button>
				</div>
				<p className="mt-4 text-center text-sm text-gray-600">
					Already have an account?{' '}
					<Link to="/staff/login" className="text-[#111877] hover:underline">
						Login
					</Link>
				</p>
			</div>
		</div>
	);
};

export default StaffCreateAccount;
