import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import ExerciseCard from './ExerciseCard';
import { fetchAllExercises, fetchExercisesByBodyPart } from '../api/exerciseDB';

const bodyParts = [
  'all',
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist'
];

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 9;

  useEffect(() => {
    loadExercises();
  }, [selectedBodyPart]);

  const loadExercises = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (selectedBodyPart === 'all') {
        data = await fetchAllExercises();
      } else {
        data = await fetchExercisesByBodyPart(selectedBodyPart);
      }
      setExercises(data);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load exercises. Please try again later.');
      console.error('Error loading exercises:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredExercises = exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setExercises(filteredExercises);
    setCurrentPage(1);
  };

  const handleBodyPartClick = (bodyPart) => {
    setSelectedBodyPart(bodyPart);
    setSearchTerm('');
  };

  // Pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );
  const totalPages = Math.ceil(exercises.length / exercisesPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Body Parts */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-4 pb-4 min-w-max">
          {bodyParts.map((bodyPart) => (
            <button
              key={bodyPart}
              onClick={() => handleBodyPartClick(bodyPart)}
              className={`px-6 py-3 rounded-full text-lg font-medium transition-colors whitespace-nowrap
                ${selectedBodyPart === bodyPart
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">{error}</p>
        </div>
      ) : currentExercises.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentExercises.map((exercise) => (
              <ExerciseCard key={exercise.name} exercise={exercise} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No exercises found</p>
        </div>
      )}
    </div>
  );
}

export default ExerciseList;