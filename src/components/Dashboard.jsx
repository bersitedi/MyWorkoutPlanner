import { FiAward, FiZap, FiCalendar } from 'react-icons/fi';
import { useFitness } from '../context/FitnessContext';

export default function Dashboard() {
  const { state } = useFitness();
  const { workoutHistory, stats } = state;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <FiAward className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Total Workouts</h2>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.totalWorkouts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <FiZap className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Streak Days</h2>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.streakDays}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Last Workout</h2>
          </div>
          <p className="text-xl mt-2">
            {stats.lastWorkout ? new Date(stats.lastWorkout.date).toLocaleDateString() : 'No workouts yet'}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {workoutHistory.length > 0 ? (
            workoutHistory.slice(0, 5).map((workout, index) => (
              <div key={workout.id || index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{workout.type || 'Workout'}</p>
                  <p className="text-sm text-gray-500">{new Date(workout.date).toLocaleDateString()}</p>
                </div>
                <span className="text-primary font-medium">
                  {workout.duration ? `${workout.duration} min` : 'Completed'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No workout history yet. Start your fitness journey today!</p>
          )}
        </div>
      </div>
    </div>
  );
}