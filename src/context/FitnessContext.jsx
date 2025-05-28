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

  const addWorkout = (workout) => {
    if (!currentUser) return;
    
    const newWorkout = workoutHistoryService.addWorkout(currentUser.id, workout);
    dispatch({ type: 'ADD_WORKOUT', payload: newWorkout });
    
    const stats = workoutHistoryService.getUserStats(currentUser.id);
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  const updateWorkout = (workoutId, updates) => {
    if (!currentUser) return;
    
    workoutHistoryService.updateWorkout(currentUser.id, workoutId, updates);
    dispatch({ type: 'UPDATE_WORKOUT', payload: { id: workoutId, updates } });
    
    const stats = workoutHistoryService.getUserStats(currentUser.id);
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  const deleteWorkout = (workoutId) => {
    if (!currentUser) return;
    
    workoutHistoryService.deleteWorkout(currentUser.id, workoutId);
    dispatch({ type: 'DELETE_WORKOUT', payload: workoutId });
    
    const stats = workoutHistoryService.getUserStats(currentUser.id);
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  };

  const value = {
    state,
    addWorkout,
    updateWorkout,
    deleteWorkout
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
