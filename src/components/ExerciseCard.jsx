import React from 'react';
import { Link } from 'react-router-dom';

function ExerciseCard({ exercise }) {
  if (!exercise) return null;

  const {
    name,
    bodyPart,
    target,
    equipment,
    gifUrl
  } = exercise;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        <img
          src={gifUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/f3f4f6/000000?text=${encodeURIComponent(name)}`;
          }}
        />
      </div>
      <Link 
        to={`/exercise/${exercise.id}`} 
        className="block p-4"
      >
        <h3 className="font-medium text-lg mb-2">{name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Body Part: {bodyPart}</p>
          <p>Target: {target}</p>
          <p>Equipment: {equipment}</p>
        </div>
      </Link>
    </div>
  );
}

export default ExerciseCard;
