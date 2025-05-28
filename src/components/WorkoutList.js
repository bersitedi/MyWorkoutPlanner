import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function WorkoutList() {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      setWorkouts(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to JS Date
        completedAt: doc.data().completedAt?.toDate() 
      })));
    };
    fetchWorkouts();
  }, [currentUser]);

  return (
    <div className="workout-history">
      <h2>Workout History</h2>
      {workouts.map(workout => (
        <div key={workout.id} className="workout-item">
          <h3>{workout.name}</h3>
          <p>Completed: {workout.completedAt?.toLocaleString()}</p>
          <p>{workout.exercises.length} exercises</p>
        </div>
      ))}
    </div>
  );
}