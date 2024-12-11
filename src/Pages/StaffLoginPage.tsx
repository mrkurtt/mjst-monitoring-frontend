import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import bgImage from '../assets/Bg.jpeg';
import { login } from '../api/auth.api';
import toast from 'react-hot-toast';

const StaffLoginPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleLogin = async () => {
		await login({ email, password }).then((res) => {
			if (res.status === 200) {
				if (res.data.user.role === 1) {
					toast.success('Login successful.');
					navigate('/staff/dashboard');
				} else {
					toast.error('Login unauthorized.');
				}
			}
		});
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
					Staff Login
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
					<div className="mb-6">
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
				</div>
				<button
					type="submit"
					onClick={handleLogin}
					className="w-full bg-[#111877] text-white py-2 px-4 rounded-md hover:bg-[#1c2680] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
				>
					<LogIn className="inline mr-2" size={18} />
					Login as Staff
				</button>
				<p className="mt-4 text-center text-sm text-gray-600">
					Not a staff member?{' '}
					<Link to="/" className="text-[#111877] hover:underline">
						Go back
					</Link>
				</p>
			</div>
		</div>
	);
};

export default StaffLoginPage;
