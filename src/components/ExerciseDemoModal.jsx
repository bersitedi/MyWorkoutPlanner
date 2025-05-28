import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'react-feather';

const ExerciseDemoModal = ({ exercise, onClose }) => {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExerciseGifs = async () => {
      try {
        const response = await axios.get(
          `https://exercisedb.p.rapidapi.com/exercises/name/${exercise.name}`,
          {
            headers: {
              'X-RapidAPI-Key': import.meta.env.REACT_APP_EXERCISEDB_API_KEY,
              'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
          }
        );
        setGifs(response.data);
      } catch (err) {
        setError('Failed to load exercise demos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (exercise) fetchExerciseGifs();
  }, [exercise]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">{exercise?.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gifs.map((gif, index) => (
                <div key={index} className="mb-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={gif.gifUrl} 
                      alt={`${exercise.name} demonstration`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold">Step {index + 1}</h4>
                    <p className="text-gray-600">{gif.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDemoModal;