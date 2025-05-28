import React from 'react';
import { useFitness } from '../context/FitnessContext';
import { useAuth } from '../context/AuthContext';

function Progress() {
  const { state } = useFitness();
  const { currentUser } = useAuth();
  const { workoutHistory, stats } = state;

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your progress.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Workouts</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Current Streak</h3>
          <p className="text-3xl font-bold text-primary">{stats.streakDays} days</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Last Workout</h3>
          <p className="text-xl font-medium text-primary">
            {stats.lastWorkout ? new Date(stats.lastWorkout.completedAt).toLocaleDateString() : 'No workouts yet'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Most Common Type</h3>
          <p className="text-xl font-medium text-primary">
            {Object.entries(stats.workoutsByType).reduce((a, b) => (a[1] > b[1] ? a : b), ['None', 0])[0]}
          </p>
        </div>
      </div>

      {/* Workout History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Workout History</h2>
        {workoutHistory.length > 0 ? (
          <div className="space-y-4">
            {workoutHistory.map((workout) => (
              <div
                key={workout.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{workout.type}</h3>
                    <p className="text-gray-600">
                      {new Date(workout.completedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      {workout.exercises && workout.exercises.map((exercise, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {exercise.name}: {exercise.sets} sets × {exercise.reps} reps
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">
            No workout history yet. Start working out to track your progress!
          </p>
        )}
      </div>
    </div>
  );
}

export default Progress;