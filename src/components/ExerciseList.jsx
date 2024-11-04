import React, { useState, useMemo } from 'react';
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
    category: ''
  });

  const ITEMS_PER_PAGE = 9;

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !filters.level || exercise.level === filters.level;
      const matchesEquipment = !filters.equipment || exercise.equipment === filters.equipment;
      const matchesMuscle = !filters.primaryMuscle || 
        exercise.primaryMuscles.includes(filters.primaryMuscle);
      const matchesCategory = !filters.category || exercise.category === filters.category;

      return matchesSearch && matchesLevel && matchesEquipment && 
             matchesMuscle && matchesCategory;
    });
  }, [exercises, searchTerm, filters]);

  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const paginatedExercises = filteredExercises.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Exercise Library</h1>

      <div className="mb-8 space-y-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterSelect
            label="Level"
            options={Array.from(new Set(exercises.map(e => e.level)))}
            value={filters.level}
            onChange={(value) => handleFilterChange('level', value)}
          />
          <FilterSelect
            label="Equipment"
            options={Array.from(new Set(exercises.map(e => e.equipment)))}
            value={filters.equipment}
            onChange={(value) => handleFilterChange('equipment', value)}
          />
          <FilterSelect
            label="Primary Muscle"
            options={Array.from(new Set(exercises.flatMap(e => e.primaryMuscles)))}
            value={filters.primaryMuscle}
            onChange={(value) => handleFilterChange('primaryMuscle', value)}
          />
          <FilterSelect
            label="Category"
            options={Array.from(new Set(exercises.map(e => e.category)))}
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedExercises.map((exercise) => (
          <ExerciseCard key={exercise.name} exercise={exercise} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ExerciseList;