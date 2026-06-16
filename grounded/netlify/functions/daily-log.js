const { getDb, getUserId } = require('./firebase-init');

exports.handler = async (event, context) => {
  try {
    const userId = getUserId(event);
    const db = getDb();
    
    if (event.httpMethod === 'POST') {
      // Save daily log
      const body = JSON.parse(event.body);
      const { date, workoutA, workoutB, workoutC, zumba, walking } = body;
      
      if (!date) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Date required' }) };
      }
      
      const docRef = db.collection('users').doc(userId).collection('daily_logs').doc(date);
      await docRef.set({
        date,
        workoutA: workoutA || false,
        workoutB: workoutB || false,
        workoutC: workoutC || false,
        zumba: zumba || false,
        walking: walking || false,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, date })
      };
    }
    
    if (event.httpMethod === 'GET') {
      // Get past 7 days of logs
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('daily_logs')
        .orderBy('date', 'desc')
        .limit(7)
        .get();
      
      const logs = [];
      snapshot.forEach(doc => {
        logs.push(doc.data());
      });
      
      return {
        statusCode: 200,
        body: JSON.stringify({ logs })
      };
    }
    
    return { statusCode: 405, body: 'Method not allowed' };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
