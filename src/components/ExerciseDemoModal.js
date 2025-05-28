import { useState, useEffect } from 'react';
import { fetchExerciseDemo } from '../api/exerciseDB';

export default function ExerciseDemoModal({ exerciseName, onClose }) {
  const [exerciseData, setExerciseData] = useState(null);

  useEffect(() => {
    fetchExerciseDemo(exerciseName).then(setExerciseData);
  }, [exerciseName]);

  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      {exerciseData ? (
        <div>
          <h3>{exerciseData.name}</h3>
          <img src={exerciseData.gifUrl} alt={exerciseData.name} />
          <p>Equipment: {exerciseData.equipment}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}