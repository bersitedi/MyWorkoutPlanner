import React, { useState } from 'react';
import { updateWorkoutSchedule } from '../data/workoutSchedule';
import { exercises } from '../data/exerciseData';
import { workoutSchedule } from '../data/workoutSchedule';

const WorkoutGenerator = () => {
  const [apiKey, setApiKey] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    fitnessLevel: '',
    focusAreas: [],
    workoutDays: 3,
    includeCardio: false,
    age: '',
    sex: '',
    height: '',
    weight: '',
    waist: '',
    neck: '',
    availableEquipment: [],
  });
  const [generatedSchedule, setGeneratedSchedule] = useState(null); // State for displaying JSON
  const [error, setError] = useState(null);

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEquipmentChange = (e) => {
    const { options } = e.target;
    const selectedEquipment = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setUserPreferences((prev) => ({
      ...prev,
      availableEquipment: selectedEquipment,
    }));
  };

  const parseScheduleContent = (content) => {
    const schedule = [];
    const days = content.split('\n\n');

    days.forEach((day) => {
      const lines = day.split('\n');
      const dayName = lines[0].replace(':', '').trim();
      const exercises = lines.slice(1).map((line) => {
        const [name, details] = line.split(':').map((part) => part.trim());
        const [sets, reps] = details.match(/\d+/g) || [];

        return {
          name,
          sets: sets ? parseInt(sets) : null,
          reps: reps ? parseInt(reps) : null,
          description: details,
        };
      });

      schedule.push({
        day: dayName,
        focus: 'Core Workout', // Example focus, update as needed
        exercises,
      });
    });

    return schedule;
  };

  const generateWorkoutSchedule = async () => {
    setError(null);

    const prompt = `Create a weekly workout schedule based on the following preferences:
      Age: ${userPreferences.age},
      Sex: ${userPreferences.sex},
      Height: ${userPreferences.height} cm,
      Weight: ${userPreferences.weight} kg,
      Waist: ${userPreferences.waist} cm,
      Neck: ${userPreferences.neck} cm,
      Fitness Level: ${userPreferences.fitnessLevel},
      Focus Areas: ${userPreferences.focusAreas.join(', ')},
      Workout Days: ${userPreferences.workoutDays},
      Include Cardio: ${userPreferences.includeCardio},
      Available Equipment: ${userPreferences.availableEquipment.join(', ')},
      Please structure the response to fit a workout schedule format for each day of the week.`;

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      // Parse the response content into structured JSON
      const newSchedule = parseScheduleContent(content);

      // Update workoutSchedule state and display JSON
      updateWorkoutSchedule(newSchedule);
      setGeneratedSchedule(newSchedule);
    } catch (error) {
      setError(`Failed to generate schedule: ${error.message}`);
      console.error('Error generating workout schedule:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-primary text-center">
          Generate Your Personalized Workout Schedule
        </h2>

        {/* API Key Input */}
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">OpenAI API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API Key"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
          />
        </label>

        {/* User Preferences Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Age</span>
            <input
              type="number"
              name="age"
              value={userPreferences.age}
              onChange={handlePreferencesChange}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Sex</span>
            <select
              name="sex"
              onChange={handlePreferencesChange}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Height (cm)</span>
            <input
              type="number"
              name="height"
              value={userPreferences.height}
              onChange={handlePreferencesChange}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Weight (kg)</span>
            <input
              type="number"
              name="weight"
              value={userPreferences.weight}
              onChange={handlePreferencesChange}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            />
          </label>

          {/* Additional Inputs */}
          {/* ... other input fields as needed */}

          <label className="block col-span-2">
            <span className="text-gray-700 font-medium">Focus Areas</span>
            <select
              multiple
              name="focusAreas"
              onChange={(e) =>
                setUserPreferences({
                  ...userPreferences,
                  focusAreas: Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  ),
                })
              }
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary focus:ring-primary"
            >
              <option value="upper body">Upper Body</option>
              <option value="lower body">Lower Body</option>
              <option value="core">Core</option>
              <option value="cardio">Cardio</option>
            </select>
          </label>
        </div>

        <button
          onClick={generateWorkoutSchedule}
          className="mt-6 w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-dark transition"
        >
          Generate Workout Schedule
        </button>

        {/* Display Error Message if Any */}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        {/* Display JSON Output of the Generated Schedule */}
        {generatedSchedule && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-primary mb-4">
              Generated Workout Schedule (JSON)
            </h3>
            <pre className="bg-gray-200 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(generatedSchedule, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutGenerator;
