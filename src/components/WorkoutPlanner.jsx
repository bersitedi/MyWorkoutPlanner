// WorkoutPlanner.js
import React, { useState, useEffect } from 'react';
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { workoutSchedule } from '../data/workoutSchedule';
import { toast } from 'react-hot-toast';

const DroppableExercises = ({ selectedDay, exercises, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={selectedDay} type="EXERCISE" mode="standard" direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {exercises.map((exercise, index) => (
              <Draggable
                key={exercise.name}
                draggableId={exercise.name}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white rounded-lg shadow-md p-4 ${
                      snapshot.isDragging ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Exercise content */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {exercise.gifUrl && (
                            <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                              <img
                                src={exercise.gifUrl}
                                alt={exercise.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">
                              {exercise.name}
                            </h3>
                            {exercise.type === 'cardio' ? (
                              <div className="flex items-center text-gray-600 mt-2">
                                <FiClock className="mr-2 flex-shrink-0" />
                                <span className="text-sm">
                                  {exercise.duration} • {exercise.intensity} intensity
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
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

function WorkoutPlanner() {
  const [schedule, setSchedule] = useState(workoutSchedule);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { state, dispatch } = useFitness();
  const { workoutSchedule: scheduleState, exercises } = state;
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
      duration = parseInt(exercise.duration) * 60; // Convert minutes to seconds
    } else if (exercise.sets && exercise.reps) {
      duration = exercise.sets * 45; // 45 seconds per set for strength exercises
    }

    // Prevent multiple intervals for the same exercise
    if (exerciseTimers[exercise.name]?.intervalId) {
      return;
    }

    const intervalId = setInterval(() => {
      setExerciseTimers((prevTimers) => {
        const currentTimeLeft = prevTimers[exercise.name]?.timeLeft - 1;
        
        if (currentTimeLeft <= 0) {
          clearInterval(prevTimers[exercise.name]?.intervalId);
          // Automatically complete the exercise when timer ends
          handleCompleteExercise(exercise, duration);
          return {
            ...prevTimers,
            [exercise.name]: {
              timeLeft: 0,
              totalTime: duration,
              intervalId: null,
            },
          };
        }

        return {
          ...prevTimers,
          [exercise.name]: {
            ...prevTimers[exercise.name],
            timeLeft: currentTimeLeft,
          },
        };
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

    // Show start message
    toast.info(`Started timer for ${exercise.name}`);
  };

  // Stop timer for an exercise
  const stopTimer = (exercise) => {
    const exerciseTimer = exerciseTimers[exercise.name];
    if (exerciseTimer?.intervalId) {
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
  const handleCompleteExercise = (exercise, timeSpent = 0) => {
    const currentTime = new Date().toISOString();
    const calories = exercise.type === 'cardio'
      ? calculateCardioCalories(exercise.duration, exercise.intensity)
      : calculateStrengthCalories(exercise.sets, exercise.reps);

    dispatch({
      type: 'COMPLETE_WORKOUT',
      payload: {
        id: Date.now(),
        name: exercise.name,
        type: exercise.type,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: timeSpent || (exercise.type === 'cardio' ? parseInt(exercise.duration) * 60 : exercise.sets * 45),
        intensity: exercise.intensity,
        calories,
        date: currentTime,
        day: selectedDay
      }
    });

    // Stop the timer if it's running
    stopTimer(exercise);

    // Show success message
    toast.success(`Completed ${exercise.name}!`);
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

  // Find the current day's workout
  const currentDayIndex = scheduleState.findIndex((day) => day.day === selectedDay);
  const currentDayWorkout = scheduleState[currentDayIndex];

  const addExerciseToDay = (exercise) => {
    dispatch({
      type: 'ADD_EXERCISE_TO_DAY',
      payload: {
        day: selectedDay,
        exercise: {
          ...exercise,
          sets: exercise.sets || 3,
          reps: exercise.reps || '12-15',
          scheduledDate: selectedDate,
          description: exercise.description || `${exercise.sets || 3} sets of ${exercise.reps || '12-15'} reps`,
          type: exercise.type || 'strength',
          intensity: exercise.intensity || 'moderate',
          duration: exercise.duration || '30',
          gifUrl: exercise.gifUrl || exercise.imageLinks?.[0] || `https://placehold.co/400x300/f3f4f6/000000.png?text=${encodeURIComponent(exercise.name)}&font-size=16`,
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
          description: exercise.description || '3 sets of 12-15 reps',
          type: exercise.type || 'strength',
          intensity: exercise.intensity || 'moderate',
          duration: exercise.duration || '30',
          gifUrl: exercise.gifUrl || exercise.imageLinks?.[0] || `https://placehold.co/400x300/f3f4f6/000000.png?text=${encodeURIComponent(exercise.name)}&font-size=16`,
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

  // Handle drag and drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const updatedExercises = Array.from(currentDayWorkout.exercises);
    const [removed] = updatedExercises.splice(sourceIndex, 1);
    updatedExercises.splice(destinationIndex, 0, removed);

    // Update the schedule in the state
    dispatch({
      type: 'UPDATE_DAY_EXERCISES',
      payload: {
        day: selectedDay,
        exercises: updatedExercises,
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Workout Planner</h1>

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
              Time: {formatTime(
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

      {/* Day Selection */}
      <div className="flex overflow-x-auto space-x-4 mb-8 pb-4">
        {schedule.map((day) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(day.day)}
            className={`px-6 py-3 rounded-full text-lg font-medium whitespace-nowrap transition-colors
              ${selectedDay === day.day
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            {day.day}
          </button>
        ))}
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
                  <div className="flex items-center mt-4 space-x-2">
                    {exerciseTimers[exercise.name]?.intervalId ? (
                      <button
                        onClick={() => {
                          const timeSpent = stopTimer(exercise);
                          handleCompleteExercise(exercise, timeSpent);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 flex items-center space-x-2"
                      >
                        <FiClock className="mr-1" />
                        <span>
                          {formatTime(exerciseTimers[exercise.name]?.timeLeft || 0)}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(exercise)}
                        className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-opacity-90 flex items-center space-x-2"
                      >
                        <FiClock className="mr-1" />
                        <span>Start Timer</span>
                      </button>
                    )}
                    <button
                      onClick={() => openReplaceModalWithFilters(exercise)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => removeExerciseFromDay(exercise.name)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout Schedule */}
      {currentDayWorkout && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-2">{currentDayWorkout.focus}</h2>
          <p className="text-gray-600 mb-6">Complete all exercises in order</p>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable 
              droppableId={selectedDay} 
              type="EXERCISE" 
              direction="vertical"
              mode="standard"
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  {currentDayWorkout.exercises.map((exercise, index) => (
                    <Draggable
                      key={exercise.name}
                      draggableId={exercise.name}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white border rounded-lg p-4 ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-2">
                                {exercise.name}
                              </h3>
                              {exercise.type === 'cardio' ? (
                                <div className="flex items-center text-gray-600">
                                  <FiClock className="mr-2" />
                                  <span>
                                    {exercise.duration} • {exercise.intensity} intensity
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-600">
                                  <FiRepeat className="mr-2" />
                                  <span>
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </span>
                                </div>
                              )}
                              {exercise.description && (
                                <p className="text-gray-600 mt-2 text-sm">
                                  {exercise.description}
                                </p>
                              )}
                              <div className="flex items-center mt-4 space-x-2">
                                {exerciseTimers[exercise.name]?.intervalId ? (
                                  <button
                                    onClick={() => {
                                      const timeSpent = stopTimer(exercise);
                                      handleCompleteExercise(exercise, timeSpent);
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 flex items-center space-x-2"
                                  >
                                    <FiClock className="mr-1" />
                                    <span>
                                      {formatTime(exerciseTimers[exercise.name]?.timeLeft || 0)}
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => startTimer(exercise)}
                                    className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-opacity-90 flex items-center space-x-2"
                                  >
                                    <FiClock className="mr-1" />
                                    <span>Start Timer</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => openReplaceModalWithFilters(exercise)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={() => removeExerciseFromDay(exercise.name)}
                                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}

export default WorkoutPlanner;