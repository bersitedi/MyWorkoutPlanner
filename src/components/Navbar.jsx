import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiCalendar,
  FiActivity,
  FiList,
  FiMenu,
  FiX,
  FiZap,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/planner', icon: FiCalendar, label: 'Planner' },
    { path: '/exercises', icon: FiList, label: 'Exercises' },
    { path: '/progress', icon: FiActivity, label: 'Progress' },
    { path: '/generate', icon: FiZap, label: 'Generate Workout' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-white text-xl font-bold flex items-center"
          >
            <FiActivity className="mr-2" />
            FitTrack
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`text-white flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive(path) ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="text-lg" />
                <span>{label}</span>
              </Link>
            ))}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="text-white flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-white/10">
          <div className="container mx-auto px-4 py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 text-white rounded-md transition-colors ${
                  isActive(path) ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="text-xl" />
                <span>{label}</span>
              </Link>
            ))}
            {currentUser && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white rounded-md hover:bg-white/10 transition-colors"
              >
                <FiLogOut className="text-xl" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;