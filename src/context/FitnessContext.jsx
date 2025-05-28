import { createContext, useContext, useReducer, useEffect } from 'react';
import { exercises } from '../data/exerciseData';
import { workoutSchedule } from '../data/workoutSchedule';
import { workoutHistoryService } from '../services/workoutHistory';
import { useAuth } from './AuthContext';

const FitnessContext = createContext();

const STORAGE_KEY = 'workoutPlannerState';

const loadInitialState = () => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    return JSON.parse(savedState);
  }
  return {
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
};

const initialState = loadInitialState();

function fitnessReducer(state, action) {
  let newState;
  
  switch (action.type) {
    case 'SET_WORKOUT_HISTORY':
      newState = {
        ...state,
        workoutHistory: action.payload
      };
      break;
      
    case 'ADD_WORKOUT':
      newState = {
        ...state,
        workoutHistory: [action.payload, ...state.workoutHistory]
      };
      break;
      
    case 'UPDATE_WORKOUT':
      newState = {
        ...state,
        workoutHistory: state.workoutHistory.map(workout =>
          workout.id === action.payload.id ? { ...workout, ...action.payload.updates } : workout
        )
      };
      break;
      
    case 'DELETE_WORKOUT':
      newState = {
        ...state,
        workoutHistory: state.workoutHistory.filter(workout => workout.id !== action.payload)
      };
      break;
      
    case 'UPDATE_STATS':
      newState = {
        ...state,
        stats: action.payload
      };
      break;
      
    case 'UPDATE_SCHEDULE':
      newState = {
        ...state,
        workoutSchedule: action.payload
      };
      break;
      
    case 'ADD_EXERCISE_TO_DAY':
      const updatedSchedule = [...state.workoutSchedule];
      const dayIndex = updatedSchedule.findIndex(day => day.day === action.payload.day);
      if (dayIndex !== -1) {
        updatedSchedule[dayIndex] = {
          ...updatedSchedule[dayIndex],
          exercises: [...updatedSchedule[dayIndex].exercises, action.payload.exercise]
        };
      }
      newState = {
        ...state,
        workoutSchedule: updatedSchedule
      };
      break;
      
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
      newState = {
        ...state,
        workoutSchedule: newSchedule
      };
      break;
      
    case 'UPDATE_DAY_EXERCISES':
      const scheduleWithUpdatedDay = [...state.workoutSchedule];
      const updateDayIndex = scheduleWithUpdatedDay.findIndex(day => day.day === action.payload.day);
      if (updateDayIndex !== -1) {
        scheduleWithUpdatedDay[updateDayIndex] = {
          ...scheduleWithUpdatedDay[updateDayIndex],
          exercises: action.payload.exercises
        };
      }
      newState = {
        ...state,
        workoutSchedule: scheduleWithUpdatedDay
      };
      break;
      
    case 'COMPLETE_WORKOUT':
      newState = {
        ...state,
        completedWorkouts: [...state.completedWorkouts, action.payload]
      };
      break;
      
    default:
      return state;
  }
  
  // Save to localStorage after every action
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
}

export function FitnessProvider({ children }) {
  const [state, dispatch] = useReducer(fitnessReducer, initialState);
  const { currentUser } = useAuth();

  // Load workout history when user changes
  useEffect(() => {
    if (currentUser) {
      const history = workoutHistoryService.getUserHistory(currentUser.uid);
      dispatch({ type: 'SET_WORKOUT_HISTORY', payload: history });
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
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
}
