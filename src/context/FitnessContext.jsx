import { createContext, useContext, useReducer, useEffect } from 'react';
import { exercises } from '../data/exercises';
import { workoutSchedule } from '../data/workoutSchedule';

const FitnessContext = createContext();

const initialState = {
  completedWorkouts: [],
  caloriesBurned: 0,
  currentWeek: 1,
  exercises: exercises,
  schedule: workoutSchedule
};

function fitnessReducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_WORKOUT':
      return {
        ...state,
        completedWorkouts: [...state.completedWorkouts, action.payload],
        caloriesBurned: state.caloriesBurned + action.payload.calories
      };
    case 'SET_CURRENT_WEEK':
      return {
        ...state,
        currentWeek: action.payload
      };
    case 'ADD_EXERCISE_TO_DAY': {
      const updatedSchedule = state.schedule.map(day => {
        if (day.day === action.payload.day) {
          return {
            ...day,
            exercises: [...day.exercises, action.payload.exercise]
          };
        }
        return day;
      });
      return {
        ...state,
        schedule: updatedSchedule
      };
    }
    case 'REMOVE_EXERCISE_FROM_DAY': {
      const updatedSchedule = state.schedule.map(day => {
        if (day.day === action.payload.day) {
          return {
            ...day,
            exercises: day.exercises.filter(ex => ex.name !== action.payload.exerciseName)
          };
        }
        return day;
      });
      return {
        ...state,
        schedule: updatedSchedule
      };
    }
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
        exercises: exercises,
        schedule: workoutSchedule
      };
    default:
      return state;
  }
}

export function FitnessProvider({ children }) {
  const [state, dispatch] = useReducer(fitnessReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('fitnessState');
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitnessState', JSON.stringify(state));
  }, [state]);

  return (
    <FitnessContext.Provider value={{ state, dispatch }}>
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