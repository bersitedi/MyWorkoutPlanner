import { createContext, useContext, useReducer, useEffect } from 'react';
import { exercises } from '../data/exerciseData';
import { workoutSchedule } from '../data/workoutSchedule';
import { workoutHistoryService } from '../services/workoutHistory';
import { useAuth } from './AuthContext';

const FitnessContext = createContext();

const initialState = {
  exercises: exercises,
  workoutSchedule: workoutSchedule,
  workoutHistory: [],
  completedWorkouts: [],
  stats: {
    totalWorkouts: 0,
    workoutsByType: {},
    lastWorkout: null,
    streakDays: 0
  }
};

function fitnessReducer(state, action) {
  switch (action.type) {
    case 'SET_WORKOUT_HISTORY':
      return {
        ...state,
        workoutHistory: action.payload
      };
    case 'ADD_WORKOUT':
      return {
        ...state,
        workoutHistory: [action.payload, ...state.workoutHistory]
      };
    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workoutHistory: state.workoutHistory.map(workout =>
          workout.id === action.payload.id ? { ...workout, ...action.payload.updates } : workout
        )
      };
    case 'DELETE_WORKOUT':
      return {
        ...state,
        workoutHistory: state.workoutHistory.filter(workout => workout.id !== action.payload)
      };
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload
      };
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        workoutSchedule: action.payload
      };
    case 'ADD_EXERCISE_TO_DAY':
      const updatedSchedule = [...state.workoutSchedule];
      const dayIndex = updatedSchedule.findIndex(day => day.day === action.payload.day);
      if (dayIndex !== -1) {
        updatedSchedule[dayIndex] = {
          ...updatedSchedule[dayIndex],
          exercises: [...updatedSchedule[dayIndex].exercises, action.payload.exercise]
        };
      }
      return {
        ...state,
        workoutSchedule: updatedSchedule
      };
    case 'REMOVE_EXERCISE_FROM_DAY':
      const newSchedule = [...state.workoutSchedule];
      const targetDayIndex = newSchedule.findIndex(day => day.day === action.payload.day);
      if (targetDayIndex !== -1) {
        newSchedule[targetDayIndex] = {
          ...newSchedule[targetDayIndex],
          exercises: newSchedule[targetDayIndex].exercises.filter(
            exercise => exercise.name !== action.payload.exerciseName
          )
        };
      }
      return {
        ...state,
        workoutSchedule: newSchedule
      };
    case 'UPDATE_DAY_EXERCISES':
      const scheduleWithUpdatedDay = [...state.workoutSchedule];
      const updateDayIndex = scheduleWithUpdatedDay.findIndex(day => day.day === action.payload.day);
      if (updateDayIndex !== -1) {
        scheduleWithUpdatedDay[updateDayIndex] = {
          ...scheduleWithUpdatedDay[updateDayIndex],
          exercises: action.payload.exercises
        };
      }
      return {
        ...state,
        workoutSchedule: scheduleWithUpdatedDay
      };
    case 'COMPLETE_WORKOUT':
      return {
        ...state,
        completedWorkouts: [...state.completedWorkouts, action.payload]
      };
    default:
      return state;
  }
}

export function FitnessProvider({ children }) {
  const [state, dispatch] = useReducer(fitnessReducer, initialState);
  const { currentUser } = useAuth();

  // Load user's workout history when user changes
  useEffect(() => {
    if (currentUser) {
      const history = workoutHistoryService.getUserHistory(currentUser.id);
      dispatch({ type: 'SET_WORKOUT_HISTORY', payload: history });
      
      const stats = workoutHistoryService.getUserStats(currentUser.id);
      dispatch({ type: 'UPDATE_STATS', payload: stats });
    }
  }, [currentUser]);

  const value = {
    state,
    dispatch,
    addWorkout: (workout) => {
      if (!currentUser) return;
      const newWorkout = workoutHistoryService.addWorkout(currentUser.id, workout);
      dispatch({ type: 'ADD_WORKOUT', payload: newWorkout });
      const stats = workoutHistoryService.getUserStats(currentUser.id);
      dispatch({ type: 'UPDATE_STATS', payload: stats });
    },
    updateWorkout: (workoutId, updates) => {
      if (!currentUser) return;
      workoutHistoryService.updateWorkout(currentUser.id, workoutId, updates);
      dispatch({ type: 'UPDATE_WORKOUT', payload: { id: workoutId, updates } });
      const stats = workoutHistoryService.getUserStats(currentUser.id);
      dispatch({ type: 'UPDATE_STATS', payload: stats });
    },
    deleteWorkout: (workoutId) => {
      if (!currentUser) return;
      workoutHistoryService.deleteWorkout(currentUser.id, workoutId);
      dispatch({ type: 'DELETE_WORKOUT', payload: workoutId });
      const stats = workoutHistoryService.getUserStats(currentUser.id);
      dispatch({ type: 'UPDATE_STATS', payload: stats });
    }
  };

  return (
    <FitnessContext.Provider value={value}>
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  return useContext(FitnessContext);
}
