import React, { useState, useMemo, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import ExerciseCard from './ExerciseCard';
import FilterSelect from './FilterSelect';
import { FiSearch } from 'react-icons/fi';

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

  const ITEMS_PER_PAGE = 9;

  // Memoize filter options to prevent unnecessary recalculations
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

  // Adjust currentPage if it exceeds totalPages
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
            <ExerciseCard key={exercise.name} exercise={exercise} />
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
    </div>
  );
}

export default ExerciseList;