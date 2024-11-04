import { useState, useEffect } from 'react';
import { FiClock, FiActivity, FiRepeat, FiPlus, FiSearch, FiX, FiCalendar, FiZap } from 'react-icons/fi';
import { useFitness } from '../context/FitnessContext';
import { format } from 'date-fns';

function WorkoutPlanner() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { state, dispatch } = useFitness();
  const { schedule, exercises } = state;
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTimer, setActiveTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [hoveredExercise, setHoveredExercise] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);

  useEffect(() => {
    if (timeLeft > 0 && activeTimer) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, activeTimer]);

  useEffect(() => {
    // Calculate total calories burned for the day
    const dayWorkouts = state.completedWorkouts.filter(
      workout => format(new Date(workout.date), 'yyyy-MM-dd') === selectedDate
    );
    const totalCals = dayWorkouts.reduce((sum, workout) => sum + workout.calories, 0);
    setTotalCaloriesBurned(totalCals);
  }, [state.completedWorkouts, selectedDate]);

  const startTimer = (exercise) => {
    let duration = 0;
    if (exercise.type === 'cardio') {
      duration = parseInt(exercise.duration) * 60;
    } else if (exercise.sets && exercise.reps) {
      duration = exercise.sets * 45;
    }
    setTimeLeft(duration);
    setTotalTime(duration);
    setActiveTimer(exercise.name);
  };

  const stopTimer = () => {
    const timeSpent = totalTime - timeLeft;
    setTimeLeft(0);
    setActiveTimer(null);
    return timeSpent;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteExercise = (exercise) => {
    const timeSpent = stopTimer();
    dispatch({
      type: 'COMPLETE_WORKOUT',
      payload: {
        name: exercise.name,
        calories: exercise.type === 'cardio' ? 
          calculateCardioCalories(exercise.duration, exercise.intensity) : 
          calculateStrengthCalories(exercise.sets, exercise.reps),
        date: new Date(selectedDate).toISOString(),
        sets: exercise.sets,
        reps: exercise.reps,
        duration: timeSpent
      }
    });
  };

  const calculateCardioCalories = (duration, intensity) => {
    const minutes = parseInt(duration);
    const intensityMultiplier = intensity === 'high' ? 12 : intensity === 'moderate' ? 8 : 5;
    return minutes * intensityMultiplier;
  };

  const calculateStrengthCalories = (sets, reps) => {
    const totalReps = sets * parseInt(String(reps).split('-')[0]);
    return totalReps * 0.5;
  };

  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDayWorkout = schedule.find(day => day.day === selectedDay);

  const addExerciseToDay = (exercise) => {
    dispatch({
      type: 'ADD_EXERCISE_TO_DAY',
      payload: {
        day: selectedDay,
        exercise: {
          ...exercise,
          sets: 3,
          reps: '12-15',
          scheduledDate: selectedDate
        }
      }
    });
    setShowExerciseSearch(false);
  };

  const removeExerciseFromDay = (exerciseName) => {
    dispatch({
      type: 'REMOVE_EXERCISE_FROM_DAY',
      payload: {
        day: selectedDay,
        exerciseName
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-primary text-xl" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md px-2 py-1"
            />
          </div>
          <div className="flex items-center space-x-3">
            <FiZap className="text-primary text-xl" />
            <span>Calories Burned: {totalCaloriesBurned}</span>
          </div>
          <div className="flex items-center space-x-3">
            <FiClock className="text-primary text-xl" />
            <span>Total Time: {formatTime(totalTime)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Workout Planner</h1>
        <button
          onClick={() => setShowExerciseSearch(!showExerciseSearch)}
          className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors"
        >
          <FiPlus />
          <span>Add Exercise</span>
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {schedule.map((day) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(day.day)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedDay === day.day
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Exercise Search Modal */}
      {showExerciseSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Exercise</h2>
              <button
                onClick={() => setShowExerciseSearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">{exercise.primaryMuscles.join(', ')}</p>
                  <button
                    onClick={() => addExerciseToDay(exercise)}
                    className="mt-2 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-opacity-90 transition-colors"
                  >
                    Add to {selectedDay}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout List */}
      {currentDayWorkout && (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{currentDayWorkout.focus}</h2>
            <p className="text-gray-600 mt-2">Complete all exercises in order</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {currentDayWorkout.exercises.map((exercise, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4"
                onMouseEnter={() => {
                  setHoveredExercise(exercise.name);
                  setCurrentImageIndex(0);
                }}
                onMouseLeave={() => {
                  setHoveredExercise(null);
                  setCurrentImageIndex(0);
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      {exercise.imageLinks && exercise.imageLinks.length > 0 && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={exercise.imageLinks[currentImageIndex]}
                            alt={exercise.name}
                            className="w-full h-full object-cover rounded-lg"
                            onMouseOver={() => hoveredExercise === exercise.name && setCurrentImageIndex(1)}
                            onMouseOut={() => hoveredExercise === exercise.name && setCurrentImageIndex(0)}
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-lg">{exercise.name}</h3>
                        {exercise.type === 'cardio' ? (
                          <div className="flex items-center text-gray-600 mt-2">
                            <FiClock className="mr-2" />
                            <span>{exercise.duration} • {exercise.intensity} intensity</span>
                          </div>
                        ) : exercise.sets ? (
                          <div className="flex items-center text-gray-600 mt-2">
                            <FiRepeat className="mr-2" />
                            <span>{exercise.sets} sets × {exercise.reps} reps</span>
                          </div>
                        ) : null}
                        {exercise.description && (
                          <p className="text-gray-600 mt-2 text-sm">{exercise.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end space-x-2 md:space-x-0 md:space-y-2 w-full md:w-auto">
                    {activeTimer === exercise.name ? (
                      <div className="text-center">
                        <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
                        <button
                          onClick={stopTimer}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm mt-1 hover:bg-red-600 transition-colors"
                        >
                          Stop
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startTimer(exercise)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
                      >
                        Start Timer
                      </button>
                    )}
                    <button
                      onClick={() => handleCompleteExercise(exercise)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => removeExerciseFromDay(exercise.name)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutPlanner;