import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FitnessProvider } from './context/FitnessContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
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
    <AuthProvider>
      <FitnessProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <div className="container mx-auto px-4 py-6">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/planner"
                    element={
                      <PrivateRoute>
                        <WorkoutPlanner />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/exercises"
                    element={
                      <PrivateRoute>
                        <ExerciseList />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/exercise/:id"
                    element={
                      <PrivateRoute>
                        <ExerciseDetails />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/progress"
                    element={
                      <PrivateRoute>
                        <Progress />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/generate"
                    element={
                      <PrivateRoute>
                        <WorkoutGenerator />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </FitnessProvider>
    </AuthProvider>
  );
}

export default App;
