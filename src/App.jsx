import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FitnessProvider } from './context/FitnessContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import ExerciseList from './components/ExerciseList';
import ExerciseDetails from './components/ExerciseDetails';
import Progress from './components/Progress';
import WorkoutGenerator from './components/WorkoutGenerator'; // Import WorkoutGenerator
import './App.css';

function App() {
  return (
    <FitnessProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/planner" element={<WorkoutPlanner />} />
                <Route path="/exercises" element={<ExerciseList />} />
                <Route path="/exercise/:id" element={<ExerciseDetails />} />
                <Route path="/progress" element={<Progress />} />
                {/* <Route path="/generate" element={<WorkoutGenerator />} />{' '}
                Add this route */}
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </FitnessProvider>
  );
}

export default App;
