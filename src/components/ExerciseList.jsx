import React, { useState, useMemo, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import ExerciseCard from './ExerciseCard';
import FilterSelect from './FilterSelect';
import { FiSearch, FiPlay } from 'react-icons/fi';
import axios from 'axios';

// Modal Component (defined here for simplicity, can be moved to separate file)
const ExerciseDemoModal = ({ exercise, onClose }) => {
  const [exerciseData, setExerciseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(exercise.name)}`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
          }
        );
        setExerciseData(response.data[0]);
      } catch (err) {
        console.error("Error fetching demo:", err);
        setError('Failed to load exercise demo');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDemo();
  }, [exercise.name]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="float-right font-bold hover:text-primary"
        >
          ✕
        </button>
        
        {isLoading ? (
          <p className="text-center py-8">Loading demo...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : exerciseData ? (
          <>
            <h3 className="text-xl font-bold mb-2">{exerciseData.name}</h3>
            <img 
              src={exerciseData.gifUrl} 
              alt={exerciseData.name}
              className="w-full h-48 object-contain mb-4"
            />
            <div className="space-y-2">
              <p><strong>Equipment:</strong> {exerciseData.equipment}</p>
              <p><strong>Target Muscles:</strong> {exerciseData.target}</p>
              <p><strong>Secondary Muscles:</strong> {exerciseData.secondaryMuscles?.join(', ') || 'None'}</p>
            </div>
          </>
        ) : (
          <p>No demo available</p>
        )}
      </div>
    </div>
  );
};

function ExerciseList() {
  const { state } = useFitness();
  const { exercises } = state;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    equipment: '',
    primaryMuscle: '',
    category: '',
  });
  const [selectedExercise, setSelectedExercise] = useState(null);

  const ITEMS_PER_PAGE = 9;

  // Memoize filter options
  const levelOptions = useMemo(() => {
    return Array.from(
      new Set(exercises.map((e) => e.level).filter(Boolean))
    ).sort();
  }, [exercises]);

  const equipmentOptions = useMemo(() => {
    return Array.from(
      new Set(exercises.map((e) => e.equipment).filter(Boolean))
    ).sort();
  }, [exercises]);

  const muscleOptions = useMemo(() => {
    return Array.from(
      new Set(exercises.flatMap((e) => e.primaryMuscles).filter(Boolean))
    ).sort();
  }, [exercises]);

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(exercises.map((e) => e.category).filter(Boolean))
    ).sort();
  }, [exercises]);

  // Memoize filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLevel =
        !filters.level || exercise.level === filters.level;
      const matchesEquipment =
        !filters.equipment || exercise.equipment === filters.equipment;
      const matchesMuscle =
        !filters.primaryMuscle ||
        exercise.primaryMuscles.includes(filters.primaryMuscle);
      const matchesCategory =
        !filters.category || exercise.category === filters.category;

      return (
        matchesSearch &&
        matchesLevel &&
        matchesEquipment &&
        matchesMuscle &&
        matchesCategory
      );
    });
  }, [exercises, searchTerm, filters]);

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExercises.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredExercises, currentPage]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">
        Exercise Library
      </h1>

      <div className="mb-8 space-y-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterSelect
            label="Level"
            options={levelOptions}
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
          />
          <FilterSelect
            label="Equipment"
            options={equipmentOptions}
            value={filters.equipment}
            onChange={(value) => handleFilterChange('equipment', value)}
          />
          <FilterSelect
            label="Primary Muscle"
            options={muscleOptions}
            value={filters.primaryMuscle}
            onChange={(value) => handleFilterChange('primaryMuscle', value)}
          />
          <FilterSelect
            label="Category"
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>
      </div>

      {paginatedExercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedExercises.map((exercise) => (
            <div key={exercise.name} className="relative group">
              <ExerciseCard exercise={exercise} />
              <button
                onClick={() => setSelectedExercise(exercise)}
                className="absolute top-3 right-3 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="View exercise demo"
              >
                <FiPlay />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No exercises found matching your criteria.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm"
            aria-label="Previous Page"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm"
            aria-label="Next Page"
          >
            Next
          </button>
        </div>
      )}

      {selectedExercise && (
        <ExerciseDemoModal 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)} 
        />
      )}
    </div>
  );
}

export default ExerciseList;