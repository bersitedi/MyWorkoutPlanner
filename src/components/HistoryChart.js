import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

export default function HistoryChart({ workouts }) {
  // Group workouts by date
  const dataByDate = workouts.reduce((acc, workout) => {
    const date = workout.completedAt?.toLocaleDateString();
    if (date) acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(dataByDate),
    datasets: [{
      label: 'Workouts Completed',
      data: Object.values(dataByDate),
      borderColor: '#3B82F6',
      tension: 0.1
    }]
  };

  return <Line data={chartData} />;
}