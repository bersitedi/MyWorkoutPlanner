const STORAGE_KEY = 'workout_history';

const getUserHistory = (userId) => {
  const history = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
  return history ? JSON.parse(history) : [];
};

const getUserStats = (userId) => {
  const history = getUserHistory(userId);
  
  const stats = {
    totalWorkouts: history.length,
    workoutsByType: {},
    lastWorkout: history[0] || null,
    streakDays: calculateStreakDays(history)
  };

  // Calculate workouts by type
  history.forEach(workout => {
    if (workout.type) {
      stats.workoutsByType[workout.type] = (stats.workoutsByType[workout.type] || 0) + 1;
    }
  });

  return stats;
};

const calculateStreakDays = (history) => {
  if (!history.length) return 0;

  let streak = 0;
  let currentDate = new Date();
  let lastWorkoutDate = null;

  // Sort history by date in descending order
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Check for consecutive days
  for (let i = 0; i < sortedHistory.length; i++) {
    const workoutDate = new Date(sortedHistory[i].date);
    
    if (!lastWorkoutDate) {
      // First workout
      if (isToday(workoutDate) || isYesterday(workoutDate, currentDate)) {
        streak = 1;
        lastWorkoutDate = workoutDate;
      } else {
        break;
      }
    } else {
      // Check if this workout was the day before the last one
      if (isConsecutiveDay(workoutDate, lastWorkoutDate)) {
        streak++;
        lastWorkoutDate = workoutDate;
      } else {
        break;
      }
    }
  }

  return streak;
};

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const isYesterday = (date, currentDate) => {
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

const isConsecutiveDay = (date1, date2) => {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const diffInDays = Math.round((date2 - date1) / oneDayInMs);
  return diffInDays === 1;
};

const addWorkout = (userId, workout) => {
  const history = getUserHistory(userId);
  const newWorkout = {
    ...workout,
    id: Date.now(),
    date: new Date().toISOString(),
  };
  history.unshift(newWorkout); // Add to beginning of array
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(history));
  return newWorkout;
};

const updateWorkout = (userId, workoutId, updatedWorkout) => {
  const history = getUserHistory(userId);
  const index = history.findIndex((w) => w.id === workoutId);
  if (index !== -1) {
    history[index] = { ...history[index], ...updatedWorkout };
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(history));
    return history[index];
  }
  return null;
};

const deleteWorkout = (userId, workoutId) => {
  const history = getUserHistory(userId);
  const filteredHistory = history.filter((w) => w.id !== workoutId);
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filteredHistory));
};

export const workoutHistoryService = {
  getUserHistory,
  getUserStats,
  addWorkout,
  updateWorkout,
  deleteWorkout,
}; 