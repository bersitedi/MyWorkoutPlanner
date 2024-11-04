import { useFitness } from '../context/FitnessContext';
import { format } from 'date-fns';
import { FiTrendingUp, FiActivity } from 'react-icons/fi';

function Progress() {
  const { state } = useFitness();

  const groupByDate = state.completedWorkouts.reduce((acc, workout) => {
    const date = format(new Date(workout.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = {
        workouts: [],
        totalCalories: 0,
      };
    }
    acc[date].workouts.push(workout);
    acc[date].totalCalories += workout.calories;
    return acc;
  }, {});

  const sortedDates = Object.keys(groupByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Progress Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <FiActivity className="text-primary text-xl" />
            <h2 className="text-xl font-semibold">Total Stats</h2>
          </div>
          <div className="space-y-2">
            <p>Total Workouts: {state.completedWorkouts.length}</p>
            <p>Total Calories: {state.caloriesBurned}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-6">
          <FiTrendingUp className="text-primary text-xl" />
          <h2 className="text-xl font-semibold">Workout History</h2>
        </div>

        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </h3>
                <span className="text-primary font-medium">
                  {groupByDate[date].totalCalories} calories
                </span>
              </div>
              <div className="space-y-2">
                {groupByDate[date].workouts.map((workout, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{workout.name}</span>
                    <span className="text-gray-500">
                      {workout.sets} sets × {workout.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Progress;