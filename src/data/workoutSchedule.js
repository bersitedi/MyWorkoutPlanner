export const workoutSchedule = [
  {
    day: 'Monday',
    focus: 'Upper Body (Chest & Triceps) + Cardio',
    exercises: [
      {
        name: 'Treadmill Warm-Up',
        type: 'cardio',
        duration: '10 minutes',
        intensity: 'moderate'
      },
      {
        name: 'Chest Press Machine',
        sets: 4,
        reps: '10-12',
        description: 'Sit on the chest press machine, adjust the seat so handles are at chest level. Push the handles forward until arms are extended, then return slowly.'
      },
      {
        name: 'Incline Chest Press Machine',
        sets: 3,
        reps: '10-12',
        description: 'Similar to the chest press but at an incline to target upper chest.'
      },
      {
        name: 'Pec Deck Machine',
        sets: 3,
        reps: '12-15',
        description: 'Sit with your back against the pad, place forearms on the pads, and bring the arms together in front of you, squeezing the chest.'
      },
      {
        name: 'Tricep Extension Machine',
        sets: 3,
        reps: '10-12',
        description: 'Adjust the seat and handles, extend your arms downward by pushing the handles, then return slowly.'
      },
      {
        name: 'Cable Tricep Pushdown',
        sets: 3,
        reps: '12-15',
        description: 'Using a cable machine with a bar attachment, push the bar down until arms are fully extended, then return.'
      },
      {
        name: 'Elliptical',
        type: 'cardio',
        duration: '15 minutes',
        intensity: 'moderate'
      }
    ]
  },
  {
    day: 'Tuesday',
    focus: 'Lower Body (Legs & Glutes) + Core',
    exercises: [
      {
        name: 'Stationary Bike Warm-Up',
        type: 'cardio',
        duration: '10 minutes',
        intensity: 'moderate'
      },
      {
        name: 'Leg Press Machine',
        sets: 4,
        reps: '10-12',
        description: 'Sit on the leg press, place feet shoulder-width apart on the platform, and push to extend legs without locking knees, then return.'
      },
      {
        name: 'Leg Extension Machine',
        sets: 3,
        reps: '12-15',
        description: 'Adjust the machine so your knees align with the pivot point, extend your legs fully, then return.'
      },
      {
        name: 'Leg Curl Machine',
        sets: 3,
        reps: '12-15',
        description: 'Position yourself on the leg curl machine, curl your legs towards your buttocks, then return.'
      },
      {
        name: 'Glute Bridge Machine',
        sets: 3,
        reps: '12-15',
        description: 'Position hips on the pad, thrust upward by engaging glutes, then lower.'
      },
      {
        name: 'Abdominal Crunch Machine',
        sets: 3,
        reps: '15-20',
        description: 'Adjust the seat, perform controlled crunches focusing on the abdominal contraction.'
      }
    ]
  },
  {
    day: 'Wednesday',
    focus: 'Back & Biceps + Cardio',
    exercises: [
      {
        name: 'Rowing Machine Warm-Up',
        type: 'cardio',
        duration: '10 minutes',
        intensity: 'moderate'
      },
      {
        name: 'Lat Pulldown Machine',
        sets: 4,
        reps: '10-12',
        description: 'Pull the bar down to your chest, squeezing shoulder blades together, then return.'
      },
      {
        name: 'Seated Cable Row Machine',
        sets: 4,
        reps: '10-12',
        description: 'Pull the handles towards your torso, squeeze the back muscles, then extend arms.'
      },
      {
        name: 'T-Bar Row Machine',
        sets: 3,
        reps: '10-12',
        description: 'Pull the weighted bar towards your chest while keeping your back straight.'
      },
      {
        name: 'Bicep Curl Machine',
        sets: 4,
        reps: '10-12',
        description: 'Adjust the seat and handles, curl the weight towards your shoulders, then lower.'
      },
      {
        name: 'Stair Climber',
        type: 'cardio',
        duration: '15 minutes',
        intensity: 'moderate'
      }
    ]
  },
  {
    day: 'Thursday',
    focus: 'Shoulders & Core',
    exercises: [
      {
        name: 'Shoulder Press Machine',
        sets: 4,
        reps: '10-12',
        description: 'Press the handles upward until arms are extended, then lower.'
      },
      {
        name: 'Lateral Raise Machine',
        sets: 3,
        reps: '12-15',
        description: 'Raise arms to the sides up to shoulder level, then lower.'
      },
      {
        name: 'Rear Delt Fly Machine',
        sets: 3,
        reps: '12-15',
        description: 'Focus on squeezing the rear shoulders by pulling the handles backward.'
      },
      {
        name: 'Shrug Machine',
        sets: 3,
        reps: '12-15',
        description: 'Elevate shoulders towards ears, hold briefly, then lower.'
      },
      {
        name: 'Abdominal Twist Machine',
        sets: 3,
        reps: '15-20',
        description: 'Rotate torso against resistance, engaging oblique muscles.'
      }
    ]
  },
  {
    day: 'Friday',
    focus: 'Full Body Circuit + Cardio',
    exercises: [
      {
        name: 'Jump Rope Warm-Up',
        type: 'cardio',
        duration: '5-10 minutes',
        intensity: 'moderate'
      },
      {
        name: 'Circuit Training',
        rounds: 3,
        exercises: [
          { name: 'Leg Press Machine', reps: 12 },
          { name: 'Chest Press Machine', reps: 12 },
          { name: 'Lat Pulldown Machine', reps: 12 },
          { name: 'Shoulder Press Machine', reps: 12 },
          { name: 'Bicep Curl Machine', reps: 12 },
          { name: 'Tricep Extension Machine', reps: 12 },
          { name: 'Abdominal Crunch Machine', reps: 15 }
        ],
        restBetweenCircuits: '2 minutes'
      },
      {
        name: 'HIIT Cardio',
        type: 'cardio',
        duration: '15 minutes',
        description: '30 seconds sprint/high intensity, 30 seconds rest'
      }
    ]
  }
];