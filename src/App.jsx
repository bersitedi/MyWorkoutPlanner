import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FitnessProvider } from './context/FitnessContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import ExerciseList from './components/ExerciseList';
import ExerciseDetails from './components/ExerciseDetails';
import Progress from './components/Progress';
import './App.css';

function App() {
  return (
    <FitnessProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planner" element={<WorkoutPlanner />} />
              <Route path="/exercises" element={<ExerciseList />} />
              <Route path="/exercise/:id" element={<ExerciseDetails />} />
              <Route path="/progress" element={<Progress />} />
            </Routes>
          </div>
        </div>
      </Router>
    </FitnessProvider>
  );
}

export default App;