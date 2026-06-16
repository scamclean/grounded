const { getDb, getUserId } = require('./firebase-init');

exports.handler = async (event, context) => {
  try {
    const userId = getUserId(event);
    const db = getDb();
    
    // Get past 7 days of logs
    const logsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('daily_logs')
      .orderBy('date', 'desc')
      .limit(7)
      .get();
    
    const logs = [];
    logsSnapshot.forEach(doc => logs.push(doc.data()));
    
    // Aggregate data
    let workoutA = 0, workoutB = 0, workoutC = 0, zumba = 0, walkingDays = 0;
    
    logs.forEach(log => {
      if (log.workoutA) workoutA++;
      if (log.workoutB) workoutB++;
      if (log.workoutC) workoutC++;
      if (log.zumba) zumba++;
      if (log.walking) walkingDays++;
    });
    
    const totalWorkouts = workoutA + workoutB + workoutC;
    const workoutGoal = 3;
    const walkingGoal = 4;
    
    const onPaceWorkouts = totalWorkouts >= workoutGoal;
    const onPaceWalking = walkingDays >= walkingGoal;
    const onPaceOverall = onPaceWorkouts && onPaceWalking ? 'On track' : 'Adjust needed';
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        period: 'past_7_days',
        loggedDays: logs.length,
        workouts: {
          A: workoutA,
          B: workoutB,
          C: workoutC,
          Zumba: zumba,
          total: totalWorkouts,
          goal: workoutGoal,
          onPace: onPaceWorkouts
        },
        walking: {
          days: walkingDays,
          goal: walkingGoal,
          onPace: onPaceWalking
        },
        overall: onPaceOverall
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
