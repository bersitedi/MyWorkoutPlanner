import axios from 'axios';

const API_KEY = '1ea536d07fmsh866dfa3db6f4733p1f571bjsn30dfc137173d'; // Store in .env later

const exerciseDbApi = axios.create({
  baseURL: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
  }
});

export const fetchExerciseDemo = async (exerciseName) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/name/${exerciseName}`);
    return response.data[0]; // First matching exercise
  } catch (error) {
    console.error("Failed to fetch exercise demo", error);
    return null;
  }
};

export const fetchAllExercises = async () => {
  try {
    const response = await exerciseDbApi.get('/exercises');
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
};

export const fetchExercisesByBodyPart = async (bodyPart) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/bodyPart/${bodyPart}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by body part:', error);
    return [];
  }
};

export const fetchExercisesByTarget = async (target) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/target/${target}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by target:', error);
    return [];
  }
};

export const fetchExercisesByEquipment = async (equipment) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/equipment/${equipment}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by equipment:', error);
    return [];
  }
};

// Helper function to transform ExerciseDB data to match our app's format
export const transformExerciseData = (exerciseDbData) => {
  return {
    name: exerciseDbData.name,
    type: 'strength',
    level: determineLevel(exerciseDbData),
    equipment: exerciseDbData.equipment,
    primaryMuscles: [exerciseDbData.target],
    secondaryMuscles: exerciseDbData.secondaryMuscles || [],
    instructions: exerciseDbData.instructions || [],
    imageLinks: [exerciseDbData.gifUrl],
    category: exerciseDbData.bodyPart,
    calorieBurnPerHour: estimateCalorieBurn(exerciseDbData)
  };
};

// Helper function to determine exercise level
const determineLevel = (exercise) => {
  const complexEquipment = ['barbell', 'cable', 'leverage machine'];
  const complexBodyParts = ['back', 'shoulders'];
  
  if (complexEquipment.includes(exercise.equipment) || complexBodyParts.includes(exercise.bodyPart)) {
    return 'intermediate';
  }
  
  if (exercise.equipment === 'body weight') {
    return 'beginner';
  }
  
  return 'intermediate';
};

// Helper function to estimate calorie burn
const estimateCalorieBurn = (exercise) => {
  const baseCalories = {
    'back': 300,
    'cardio': 400,
    'chest': 280,
    'lower arms': 150,
    'lower legs': 200,
    'neck': 100,
    'shoulders': 250,
    'upper arms': 200,
    'upper legs': 350,
    'waist': 200
  };

  return baseCalories[exercise.bodyPart] || 200;
};