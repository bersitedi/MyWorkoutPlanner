import { Link } from 'react-router-dom';
import { FiHome, FiCalendar, FiActivity, FiList } from 'react-icons/fi';

function Navbar() {
  return (
    <nav className="bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white text-xl font-bold">FitTrack</Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-white flex items-center space-x-1">
              <FiHome />
              <span>Home</span>
            </Link>
            <Link to="/planner" className="text-white flex items-center space-x-1">
              <FiCalendar />
              <span>Planner</span>
            </Link>
            <Link to="/exercises" className="text-white flex items-center space-x-1">
              <FiList />
              <span>Exercises</span>
            </Link>
            <Link to="/progress" className="text-white flex items-center space-x-1">
              <FiActivity />
              <span>Progress</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;