import React, { useState, useEffect } from 'react';
import { updateWorkoutSchedule } from '../data/workoutSchedule';
import { exercises as localExercises } from '../data/exerciseData';
import { 
  fetchAllExercises, 
  fetchExercisesByBodyPart, 
  transformExerciseData 
} from '../api/exerciseDB';

const WorkoutGenerator = () => {
  const [userPreferences, setUserPreferences] = useState({
    fitnessLevel: '',
    focusAreas: [],
    workoutDays: 3,
    includeCardio: false,
    age: '',
    sex: '',
    height: '',
    weight: '',
  });
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exercises, setExercises] = useState(localExercises);
  const [isUsingApi, setIsUsingApi] = useState(true);

  // Fetch exercises from ExerciseDB when component mounts
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const apiExercises = await fetchAllExercises();
        if (apiExercises.length > 0) {
          const transformedExercises = apiExercises.map(exercise => 
            transformExerciseData(exercise)
          );
          setExercises([...transformedExercises, ...localExercises]);
          setIsUsingApi(true);
        } else {
          setIsUsingApi(false);
        }
      } catch (error) {
        console.error('Failed to fetch from ExerciseDB:', error);
        setIsUsingApi(false);
      }
    };

    fetchExercises();
  }, []);

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateWorkoutSchedule = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!userPreferences.fitnessLevel) {
        throw new Error('Please select your fitness level');
      }
      if (userPreferences.focusAreas.length === 0) {
        throw new Error('Please select at least one focus area');
      }

      // Filter exercises based on user's fitness level
      const availableExercises = exercises.filter(exercise => {
        if (userPreferences.fitnessLevel === 'beginner') {
          return exercise.level === 'beginner';
        }
        if (userPreferences.fitnessLevel === 'intermediate') {
          return ['beginner', 'intermediate'].includes(exercise.level);
        }
        return true; // For advanced, include all exercises
      });

      // Create workout days based on user preferences
      const workoutDays = ['Monday', 'Wednesday', 'Friday', 'Tuesday', 'Thursday', 'Saturday'];
      const selectedDays = workoutDays.slice(0, userPreferences.workoutDays);

      // Generate schedule
      const newSchedule = await Promise.all(selectedDays.map(async day => {
        // Select focus area for the day
        const focusArea = userPreferences.focusAreas[Math.floor(Math.random() * userPreferences.focusAreas.length)];
        
        // Get exercises for the focus area
        let focusExercises = [];
        if (isUsingApi) {
          try {
            const apiExercises = await fetchExercisesByBodyPart(focusArea);
            focusExercises = apiExercises.map(ex => transformExerciseData(ex));
          } catch (error) {
            console.error('Failed to fetch focus area exercises:', error);
          }
        }
        
        // Combine with local exercises
        focusExercises = [
          ...focusExercises,
          ...availableExercises.filter(exercise => 
            exercise.category === focusArea || 
            exercise.primaryMuscles.some(muscle => focusArea.includes(muscle))
          )
        ];

        // Select 3-4 exercises for the day
        const selectedExercises = [];
        const numExercises = Math.floor(Math.random() * 2) + 3; // 3-4 exercises

        for (let i = 0; i < numExercises; i++) {
          if (focusExercises.length > 0) {
            const randomIndex = Math.floor(Math.random() * focusExercises.length);
            const exercise = focusExercises[randomIndex];
            
            selectedExercises.push({
              name: exercise.name,
              sets: userPreferences.fitnessLevel === 'beginner' ? 3 : 4,
              reps: userPreferences.fitnessLevel === 'beginner' ? 10 : 12,
              type: exercise.category,
              imageLinks: exercise.imageLinks,
              description: exercise.instructions?.join(' ') || exercise.description,
              intensity: exercise.intensity || 'moderate'
            });

            // Remove the exercise to avoid duplicates
            focusExercises.splice(randomIndex, 1);
          }
        }

        // Add cardio if requested
        if (userPreferences.includeCardio) {
          const cardioExercises = exercises.filter(ex => ex.type === 'cardio');
          if (cardioExercises.length > 0) {
            const cardio = cardioExercises[Math.floor(Math.random() * cardioExercises.length)];
            selectedExercises.unshift({
              name: cardio.name || 'Cardio Warm-up',
              duration: '15 minutes',
              type: 'cardio',
              intensity: 'moderate',
              imageLinks: cardio.imageLinks
            });
          }
        }

        return {
          day,
          focus: focusArea.charAt(0).toUpperCase() + focusArea.slice(1),
          exercises: selectedExercises
        };
      }));

      // Update workoutSchedule state and display schedule
      updateWorkoutSchedule(newSchedule);
      setGeneratedSchedule(newSchedule);
    } catch (error) {
      setError(error.message);
      console.error('Error generating workout schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-primary text-center">
          Generate Your Personalized Workout Schedule
        </h2>

        {/* User Preferences Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Fitness Level</span>
            <select
              name="fitnessLevel"
              value={userPreferences.fitnessLevel}
              onChange={handlePreferencesChange}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            >
              <option value="">Select...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Workout Days per Week</span>
            <select
              name="workoutDays"
              value={userPreferences.workoutDays}
              onChange={handlePreferencesChange}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            >
              {[2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} days</option>
              ))}
            </select>
          </label>

          <div className="col-span-2">
            <label className="block">
              <span className="text-gray-700 font-medium">Focus Areas</span>
              <select
                multiple
                name="focusAreas"
                value={userPreferences.focusAreas}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setUserPreferences(prev => ({ ...prev, focusAreas: selected }));
                }}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
              >
                <option value="back">Back</option>
                <option value="cardio">Cardio</option>
                <option value="chest">Chest</option>
                <option value="lower arms">Lower Arms</option>
                <option value="lower legs">Lower Legs</option>
                <option value="shoulders">Shoulders</option>
                <option value="upper arms">Upper Arms</option>
                <option value="upper legs">Upper Legs</option>
                <option value="waist">Core</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple areas</p>
            </label>
          </div>

          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="includeCardio"
                checked={userPreferences.includeCardio}
                onChange={handlePreferencesChange}
                className="form-checkbox text-primary focus:ring-primary"
              />
              <span className="text-gray-700 font-medium">Include Cardio Warm-up</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={generateWorkoutSchedule}
          disabled={loading}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Workout Schedule'}
        </button>

        {/* Display Generated Schedule */}
        {generatedSchedule && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Your Workout Schedule</h3>
            <div className="space-y-4">
              {generatedSchedule.map((day, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-bold text-lg text-primary">{day.day} - {day.focus}</h4>
                  <ul className="mt-2 space-y-2">
                    {day.exercises.map((exercise, i) => (
                      <li key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-4">
                          {exercise.imageLinks && exercise.imageLinks[0] && (
                            <img 
                              src={exercise.imageLinks[0]} 
                              alt={exercise.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <span className="font-medium">{exercise.name}</span>
                            {exercise.description && (
                              <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-600">
                          {exercise.type === 'cardio' 
                            ? `${exercise.duration} • ${exercise.intensity} intensity`
                            : `${exercise.sets} sets × ${exercise.reps} reps`
                          }
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutGenerator;
