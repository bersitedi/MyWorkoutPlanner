import axios from 'axios';

const API_KEY = '1ea536d07fmsh866dfa3db6f4733p1f571bjsn30dfc137173d'; // Store in .env later

const exerciseDbApi = axios.create({
  baseURL: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
  }
});

// Local exercise data as fallback
const localExercises = [
  {
    name: 'Push-up',
    bodyPart: 'chest',
    equipment: 'body weight',
    target: 'pectorals',
    gifUrl: 'https://api.exercisedb.io/image/PNKAeqH9f6lxKB',
    instructions: [
      'Get down on all fours, placing your hands slightly wider than your shoulders.',
      'Straighten your arms and legs.',
      'Lower your body until your chest nearly touches the floor.',
      'Pause, then push yourself back up.',
      'Repeat.'
    ]
  },
  {
    name: 'Squat',
    bodyPart: 'upper legs',
    equipment: 'body weight',
    target: 'quads',
    gifUrl: 'https://api.exercisedb.io/image/JWoAqLVb8qF3Ey',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Lower your body as if sitting back into a chair.',
      'Keep your chest up and back straight.',
      'Return to starting position.',
      'Repeat.'
    ]
  },
  {
    name: 'Plank',
    bodyPart: 'waist',
    equipment: 'body weight',
    target: 'abs',
    gifUrl: 'https://api.exercisedb.io/image/vRdJJKqLyBxGdN',
    instructions: [
      'Get in a push-up position with forearms on the ground.',
      'Keep your body straight from head to heels.',
      'Hold this position.',
      'Engage your core and glutes.',
      'Maintain for desired duration.'
    ]
  },
  {
    name: 'Pull-up',
    bodyPart: 'back',
    equipment: 'body weight',
    target: 'lats',
    gifUrl: 'https://api.exercisedb.io/image/KWqd5JVbN8F3Ey',
    instructions: [
      'Grab the pull-up bar with hands slightly wider than shoulders.',
      'Hang with arms fully extended.',
      'Pull yourself up until your chin is over the bar.',
      'Lower yourself back down with control.',
      'Repeat.'
    ]
  }
];

export const fetchExerciseByName = async (exerciseName) => {
  try {
    console.log('API Key being used:', API_KEY);
    const normalizedName = exerciseName.toLowerCase().trim();
    console.log('Making API request for exercise:', normalizedName);
    const response = await exerciseDbApi.get(`/exercises/name/${normalizedName}`);
    console.log('API Response:', response.data);
    const exercises = response.data;
    
    // Try to find an exact match first
    let exercise = exercises.find(ex => ex.name.toLowerCase() === normalizedName);
    
    // If no exact match, take the first result
    if (!exercise && exercises.length > 0) {
      exercise = exercises[0];
    }
    
    if (exercise) {
      return transformExerciseData(exercise);
    }

    // Try local exercises if API fails
    const localExercise = localExercises.find(
      ex => ex.name.toLowerCase() === normalizedName
    );
    if (localExercise) {
      return transformExerciseData(localExercise);
    }

    throw new Error('Exercise not found');
  } catch (error) {
    console.error("Failed to fetch exercise", error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response data'
    });
    
    // Try local exercises as fallback
    const normalizedName = exerciseName.toLowerCase().trim();
    const localExercise = localExercises.find(
      ex => ex.name.toLowerCase() === normalizedName
    );
    if (localExercise) {
      return transformExerciseData(localExercise);
    }
    throw error;
  }
};

export const fetchAllExercises = async () => {
  try {
    const response = await exerciseDbApi.get('/exercises');
    return response.data.map(transformExerciseData);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return localExercises.map(transformExerciseData);
  }
};

export const fetchExercisesByBodyPart = async (bodyPart) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/bodyPart/${bodyPart}`);
    return response.data.map(transformExerciseData);
  } catch (error) {
    console.error('Error fetching exercises by body part:', error);
    return bodyPart === 'all' 
      ? localExercises.map(transformExerciseData)
      : localExercises.filter(ex => ex.bodyPart === bodyPart).map(transformExerciseData);
  }
};

export const fetchExercisesByTarget = async (target) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/target/${target}`);
    return response.data.map(transformExerciseData);
  } catch (error) {
    console.error('Error fetching exercises by target:', error);
    return localExercises.filter(ex => ex.target === target).map(transformExerciseData);
  }
};

export const fetchExercisesByEquipment = async (equipment) => {
  try {
    const response = await exerciseDbApi.get(`/exercises/equipment/${equipment}`);
    return response.data.map(transformExerciseData);
  } catch (error) {
    console.error('Error fetching exercises by equipment:', error);
    return localExercises.filter(ex => ex.equipment === equipment).map(transformExerciseData);
  }
};

export const fetchExerciseById = async (exerciseId) => {
  try {
    console.log('API Key being used:', API_KEY);
    console.log('Making API request for exercise ID:', exerciseId);
    const response = await exerciseDbApi.get(`/exercises/exercise/${exerciseId}`);
    console.log('API Response:', response.data);
    
    if (response.data) {
      return transformExerciseData(response.data);
    }

    throw new Error('Exercise not found');
  } catch (error) {
    console.error('Error fetching exercise by ID:', error);
    throw new Error('Exercise not found');
  }
};

// Helper function to transform ExerciseDB data to match our app's format
export const transformExerciseData = (exerciseDbData) => {
  return {
    id: exerciseDbData.id,
    name: exerciseDbData.name,
    type: 'strength',
    level: determineLevel(exerciseDbData),
    equipment: exerciseDbData.equipment,
    primaryMuscles: [exerciseDbData.target],
    secondaryMuscles: exerciseDbData.secondaryMuscles || [],
    instructions: exerciseDbData.instructions || [],
    gifUrl: exerciseDbData.gifUrl,
    bodyPart: exerciseDbData.bodyPart,
    target: exerciseDbData.target,
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