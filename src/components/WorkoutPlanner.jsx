import { useState, useEffect } from 'react';
import {
  FiClock,
  FiActivity,
  FiRepeat,
  FiPlus,
  FiSearch,
  FiX,
  FiCalendar,
  FiZap,
} from 'react-icons/fi';
import { useFitness } from '../context/FitnessContext';
import { format } from 'date-fns';

function WorkoutPlanner() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { state, dispatch } = useFitness();
  const { schedule, exercises } = state;
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [hoveredExercise, setHoveredExercise] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [exerciseToReplace, setExerciseToReplace] = useState(null);

  // New state for exercise timers
  const [exerciseTimers, setExerciseTimers] = useState({});

  useEffect(() => {
    const dayWorkouts = state.completedWorkouts.filter(
      (workout) => format(new Date(workout.date), 'yyyy-MM-dd') === selectedDate
    );
    const totalCals = dayWorkouts.reduce(
      (sum, workout) => sum + workout.calories,
      0
    );
    setTotalCaloriesBurned(totalCals);
  }, [state.completedWorkouts, selectedDate]);

  // Function to format time in mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer for an exercise
  const startTimer = (exercise) => {
    let duration = 0;
    if (exercise.type === 'cardio') {
      duration = parseInt(exercise.duration) * 60;
    } else if (exercise.sets && exercise.reps) {
      duration = exercise.sets * 45; // Adjust as needed
    }

    // Prevent multiple intervals for the same exercise
    if (exerciseTimers[exercise.name]?.intervalId) {
      return;
    }

    const intervalId = setInterval(() => {
      setExerciseTimers((prevTimers) => {
        const currentTimeLeft = prevTimers[exercise.name].timeLeft - 1;
        if (currentTimeLeft <= 0) {
          clearInterval(prevTimers[exercise.name].intervalId);
          return {
            ...prevTimers,
            [exercise.name]: {
              ...prevTimers[exercise.name],
              timeLeft: 0,
              intervalId: null,
            },
          };
        } else {
          return {
            ...prevTimers,
            [exercise.name]: {
              ...prevTimers[exercise.name],
              timeLeft: currentTimeLeft,
            },
          };
        }
      });
    }, 1000);

    setExerciseTimers((prevTimers) => ({
      ...prevTimers,
      [exercise.name]: {
        timeLeft: duration,
        totalTime: duration,
        intervalId: intervalId,
      },
    }));
  };

  // Stop timer for an exercise
  const stopTimer = (exercise) => {
    const exerciseTimer = exerciseTimers[exercise.name];
    if (exerciseTimer && exerciseTimer.intervalId) {
      clearInterval(exerciseTimer.intervalId);
      const timeSpent = exerciseTimer.totalTime - exerciseTimer.timeLeft;
      setExerciseTimers((prevTimers) => ({
        ...prevTimers,
        [exercise.name]: {
          ...prevTimers[exercise.name],
          intervalId: null,
        },
      }));
      return timeSpent;
    }
    return 0;
  };

  // Handle exercise completion
  const handleCompleteExercise = (exercise) => {
    const timeSpent = stopTimer(exercise);
    dispatch({
      type: 'COMPLETE_WORKOUT',
      payload: {
        name: exercise.name,
        calories:
          exercise.type === 'cardio'
            ? calculateCardioCalories(exercise.duration, exercise.intensity)
            : calculateStrengthCalories(exercise.sets, exercise.reps),
        date: new Date(selectedDate).toISOString(),
        sets: exercise.sets,
        reps: exercise.reps,
        duration: timeSpent,
      },
    });
  };

  const calculateCardioCalories = (duration, intensity) => {
    const minutes = parseInt(duration);
    const intensityMultiplier =
      intensity === 'high' ? 12 : intensity === 'moderate' ? 8 : 5;
    return minutes * intensityMultiplier;
  };

  const calculateStrengthCalories = (sets, reps) => {
    const totalReps = sets * parseInt(String(reps).split('-')[0]);
    return totalReps * 0.5;
  };

  // Filter exercises based on search term and category
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || exercise.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const currentDayWorkout = schedule.find((day) => day.day === selectedDay);

  const addExerciseToDay = (exercise) => {
    dispatch({
      type: 'ADD_EXERCISE_TO_DAY',
      payload: {
        day: selectedDay,
        exercise: {
          ...exercise,
          sets: 3,
          reps: '12-15',
          scheduledDate: selectedDate,
        },
      },
    });
    setShowExerciseSearch(false);
  };

  const replaceExerciseInDay = (exercise) => {
    dispatch({
      type: 'REMOVE_EXERCISE_FROM_DAY',
      payload: {
        day: selectedDay,
        exerciseName: exerciseToReplace.name,
      },
    });
    dispatch({
      type: 'ADD_EXERCISE_TO_DAY',
      payload: {
        day: selectedDay,
        exercise: {
          ...exercise,
          sets: 3,
          reps: '12-15',
          scheduledDate: selectedDate,
        },
      },
    });
    setExerciseToReplace(null);
    setShowExerciseSearch(false);
  };

  const openReplaceModalWithFilters = (exercise) => {
    setExerciseToReplace(exercise);
    setShowExerciseSearch(true);
  };

  const removeExerciseFromDay = (exerciseName) => {
    dispatch({
      type: 'REMOVE_EXERCISE_FROM_DAY',
      payload: {
        day: selectedDay,
        exerciseName,
      },
    });
  };

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      Object.values(exerciseTimers).forEach((timer) => {
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
        }
      });
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <FiCalendar className="text-primary text-xl flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-3">
            <FiZap className="text-primary text-xl flex-shrink-0" />
            <span className="text-sm">Calories: {totalCaloriesBurned}</span>
          </div>
          <div className="flex items-center space-x-3">
            <FiClock className="text-primary text-xl flex-shrink-0" />
            <span className="text-sm">
              Time:{' '}
              {formatTime(
                Object.values(exerciseTimers).reduce(
                  (total, timer) => total + (timer.totalTime - timer.timeLeft),
                  0
                )
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Workout Planner</h1>
        <button
          onClick={() => setShowExerciseSearch(!showExerciseSearch)}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-colors"
        >
          <FiPlus />
          <span>Add Exercise</span>
        </button>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex space-x-2">
          {schedule.map((day) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedDay === day.day
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Search Modal */}
      {showExerciseSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add or Replace Exercise</h2>
              <button
                onClick={() => setShowExerciseSearch(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded-lg py-2 px-3"
              >
                <option value="all">All</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="stretching">Stretching</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">
                    {exercise.primaryMuscles.join(', ')}
                  </p>
                  <button
                    onClick={() => addExerciseToDay(exercise)}
                    className="mt-2 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-opacity-90 transition-colors"
                  >
                    Add to {selectedDay}
                  </button>
                  {exerciseToReplace && (
                    <button
                      onClick={() => replaceExerciseInDay(exercise)}
                      className="mt-2 ml-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                    >
                      Replace Selected
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout List */}
      {currentDayWorkout && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{currentDayWorkout.focus}</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Complete all exercises in order
            </p>
          </div>

          <div className="space-y-4">
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
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {exercise.imageLinks &&
                        exercise.imageLinks.length > 0 && (
                          <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                            <img
                              src={exercise.imageLinks[currentImageIndex]}
                              alt={exercise.name}
                              className="w-full h-full object-cover rounded-lg"
                              onMouseOver={() =>
                                hoveredExercise === exercise.name &&
                                setCurrentImageIndex(1)
                              }
                              onMouseOut={() =>
                                hoveredExercise === exercise.name &&
                                setCurrentImageIndex(0)
                              }
                            />
                          </div>
                        )}
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{exercise.name}</h3>
                        {exercise.type === 'cardio' ? (
                          <div className="flex items-center text-gray-600 mt-2">
                            <FiClock className="mr-2 flex-shrink-0" />
                            <span className="text-sm">
                              {exercise.duration} • {exercise.intensity}{' '}
                              intensity
                            </span>
                          </div>
                        ) : exercise.sets ? (
                          <div className="flex items-center text-gray-600 mt-2">
                            <FiRepeat className="mr-2 flex-shrink-0" />
                            <span className="text-sm">
                              {exercise.sets} sets × {exercise.reps} reps
                            </span>
                          </div>
                        ) : null}
                        {exercise.description && (
                          <p className="text-gray-600 mt-2 text-sm">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
                    {exerciseTimers[exercise.name]?.intervalId ? (
                      <>
                        <button
                          onClick={() => handleCompleteExercise(exercise)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                        >
                          Stop Timer
                        </button>
                        <div className="text-sm text-gray-700">
                          Time Left:{' '}
                          {formatTime(exerciseTimers[exercise.name]?.timeLeft)}
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => startTimer(exercise)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
                      >
                        Start Timer
                      </button>
                    )}
                    <button
                      onClick={() => openReplaceModalWithFilters(exercise)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Select to Replace
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
