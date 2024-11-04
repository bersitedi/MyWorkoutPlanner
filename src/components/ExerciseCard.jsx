import React, { useState } from 'react';
import { FiClock, FiActivity, FiCalendar, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useFitness } from '../context/FitnessContext';

function ExerciseCard({ exercise, showAddToPlanner = true }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showDaySelect, setShowDaySelect] = useState(false);
  const { dispatch } = useFitness();

  if (!exercise) return null;

  const {
    name,
    level,
    equipment,
    primaryMuscles,
    instructions,
    imageLinks,
    calorieBurnPerHour
  } = exercise;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleAddToDay = (day) => {
    dispatch({
      type: 'ADD_EXERCISE_TO_DAY',
      payload: {
        day,
        exercise: {
          ...exercise,
          sets: 3,
          reps: '12-15'
        }
      }
    });
    setShowDaySelect(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {imageLinks && imageLinks.length > 0 && (
        <div 
          className="relative h-48 overflow-hidden"
          onMouseEnter={() => setCurrentImage(1)}
          onMouseLeave={() => setCurrentImage(0)}
        >
          <img
            src={imageLinks[currentImage]}
            alt={name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <Link 
            to={`/exercise/${encodeURIComponent(name)}`}
            className="text-primary hover:text-primary-dark"
          >
            <FiInfo size={20} />
          </Link>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <FiActivity className="mr-2" />
            <span>Level: {level}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <FiClock className="mr-2" />
            <span>{calorieBurnPerHour} calories/hour</span>
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Equipment:</span> {equipment}
          </div>
          
          <div className="text-sm">
            <span className="font-medium">Muscles:</span> {primaryMuscles.join(', ')}
          </div>
        </div>

        {showAddToPlanner && (
          <div className="mt-4">
            {showDaySelect ? (
              <div className="space-y-2">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleAddToDay(day)}
                    className="w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded"
                  >
                    {day}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setShowDaySelect(true)}
                className="flex items-center space-x-2 text-primary hover:text-primary-dark"
              >
                <FiCalendar />
                <span>Add to Planner</span>
              </button>
            )}
          </div>
        )}
        
        <div className="mt-4">
          <details className="text-sm">
            <summary className="font-medium cursor-pointer">Instructions</summary>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </details>
        </div>
      </div>
    </div>
  );
}

export default ExerciseCard;