import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchExerciseById } from '../api/exerciseDB';
import { FiClock, FiTarget, FiPackage } from 'react-icons/fi';

function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadExercise = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        console.log('Attempting to fetch exercise by ID:', id);
        const data = await fetchExerciseById(id);
        
        if (data) {
          setExercise(data);
        } else {
          throw new Error('Exercise not found');
        }
      } catch (err) {
        setError('Failed to load exercise details. Please try again later.');
        console.error('Error loading exercise:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercise();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-xl text-gray-600">Exercise not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Exercise Images */}
          <div className="relative aspect-w-16 aspect-h-9">
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://placehold.co/800x600/f3f4f6/000000?text=${encodeURIComponent(exercise.name)}`;
              }}
            />
          </div>

          {/* Exercise Details */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{exercise.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <FiTarget className="text-primary text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Target Muscle</p>
                  <p className="font-medium">{exercise.target}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiPackage className="text-primary text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Equipment</p>
                  <p className="font-medium">{exercise.equipment}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="text-primary text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Body Part</p>
                  <p className="font-medium">{exercise.bodyPart}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-2">
                {exercise.instructions?.map((instruction, index) => (
                  <li key={index} className="text-gray-700">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;