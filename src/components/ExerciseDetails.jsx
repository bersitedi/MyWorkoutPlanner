import { useParams, useNavigate } from 'react-router-dom';
import { useFitness } from '../context/FitnessContext';
import { useState } from 'react';
import { FiClock, FiActivity, FiTarget, FiRepeat, FiArrowLeft, FiCalendar } from 'react-icons/fi';

function ExerciseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useFitness();
  const [selectedDay, setSelectedDay] = useState('');
  const exercise = state.exercises.find(ex => ex.name === decodeURIComponent(id));

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-primary hover:text-primary-dark mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Exercises
        </button>
        <div>Exercise not found</div>
      </div>
    );
  }

  const handleAddToDay = () => {
    if (selectedDay) {
      dispatch({
        type: 'ADD_EXERCISE_TO_DAY',
        payload: {
          day: selectedDay,
          exercise: {
            ...exercise,
            sets: 3,
            reps: '12-15'
          }
        }
      });
      setSelectedDay('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-primary hover:text-primary-dark"
      >
        <FiArrowLeft className="mr-2" /> Back to Exercises
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">{exercise.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exercise.imageLinks && exercise.imageLinks.length > 0 && (
              <div className="space-y-4">
                {exercise.imageLinks.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${exercise.name} position ${index + 1}`}
                    className="w-full rounded-lg shadow-md"
                  />
                ))}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiTarget className="text-primary" />
                    <span className="font-semibold">Target Muscles</span>
                  </div>
                  <p>{exercise.primaryMuscles.join(', ')}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiActivity className="text-primary" />
                    <span className="font-semibold">Level</span>
                  </div>
                  <p className="capitalize">{exercise.level}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiRepeat className="text-primary" />
                    <span className="font-semibold">Equipment</span>
                  </div>
                  <p className="capitalize">{exercise.equipment}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiClock className="text-primary" />
                    <span className="font-semibold">Calories</span>
                  </div>
                  <p>{exercise.calorieBurnPerHour} cal/hr</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-primary" />
                  <span className="font-semibold">Add to Planner</span>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">Select a day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToDay}
                    disabled={!selectedDay}
                    className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-opacity-90 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;