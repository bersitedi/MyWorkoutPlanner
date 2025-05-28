import axios from 'axios';

const API_KEY = '1ea536d07fmsh866dfa3db6f4733p1f571bjsn30dfc137173d'; // Store in .env later

export const fetchExerciseDemo = async (exerciseName) => {
  try {
    const response = await axios.get(
      `https://exercisedb.p.rapidapi.com/exercises/name/${exerciseName}`,
      {
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      }
    );
    return response.data[0]; // First matching exercise
  } catch (error) {
    console.error("Failed to fetch exercise demo", error);
    return null;
  }
};