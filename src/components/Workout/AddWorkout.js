import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialState = {
  name: '',
  exercises: [],
  notes: ''
};

function AddWorkout() {
  const { currentUser } = useAuth();
  const [workout, setWorkout] = useState(initialState);
  const workoutsCollection = collection(db, 'workouts');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkout(prev => ({ ...prev, [name]: value }));
  };

  const saveWorkout = async () => {
    if (!currentUser) {
      toast.error('Please login to save workouts');
      return;
    }

    try {
      await addDoc(workoutsCollection, {
        ...workout,
        userId: currentUser.uid,
        completedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setWorkout(initialState);
      toast.success("Workout saved with timestamps!");
    } catch (err) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  return (
    <div className="workout-form">
      <h2>Create New Workout</h2>
      <input
        type="text"
        name="name"
        value={workout.name}
        onChange={handleChange}
        placeholder="Workout Name"
      />
      {/* Exercise selection UI would go here */}
      <button onClick={saveWorkout}>Save Workout</button>
    </div>
  );
}

export default AddWorkout;