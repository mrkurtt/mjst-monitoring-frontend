import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog } from 'lucide-react';
import logoImage from '../assets/logo.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDirectorsClick = () => {
    navigate('/director/login');
  };

  const handleStaffClick = () => {
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/src/assets/Bg.jpeg)' }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8">
          <img 
            src={logoImage} 
            alt="MJST Logo" 
            className="w-64 h-64 object-contain rounded-lg"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-10">MJST Monitoring System</h1>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="bg-white/90 backdrop-blur-sm text-[#000765] rounded-lg shadow-lg p-6 flex flex-col items-center justify-center h-48 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl"
              onClick={handleDirectorsClick}
              onKeyDown={(e) => e.key === 'Enter' && handleDirectorsClick()}
              tabIndex={0}
              role="button"
              aria-label="Directors Login"
            >
              <UserCog size={48} className="mb-4" />
              <h2 className="text-xl font-semibold">Directors Login</h2>
            </div>
            <div 
              className="bg-white/90 backdrop-blur-sm text-[#000765] rounded-lg shadow-lg p-6 flex flex-col items-center justify-center h-48 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl"
              onClick={handleStaffClick}
              onKeyDown={(e) => e.key === 'Enter' && handleStaffClick()}
              tabIndex={0}
              role="button"
              aria-label="Staff Login"
            >
              <Users size={48} className="mb-4" />
              <h2 className="text-xl font-semibold">Staff Login</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;