import { FiAward, FiZap, FiCalendar } from 'react-icons/fi';
import { useFitness } from '../context/FitnessContext';

export default function Dashboard() {
  const { state } = useFitness();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <FiAward className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Workouts Completed</h2>
          </div>
          <p className="text-3xl font-bold mt-2">{state.completedWorkouts.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <FiZap className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Calories Burned</h2>
          </div>
          <p className="text-3xl font-bold mt-2">{state.caloriesBurned}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Current Week</h2>
          </div>
          <p className="text-3xl font-bold mt-2">{state.currentWeek}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {state.completedWorkouts.slice(-5).map((workout, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{workout.name}</p>
                <p className="text-sm text-gray-500">{new Date(workout.date).toLocaleDateString()}</p>
              </div>
              <span className="text-primary font-medium">{workout.calories} cal</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}