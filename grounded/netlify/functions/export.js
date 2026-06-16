const { getDb, getUserId } = require('./firebase-init');

exports.handler = async (event, context) => {
  try {
    const userId = getUserId(event);
    const db = getDb();
    
    // Get all daily logs
    const logsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('daily_logs')
      .orderBy('date', 'asc')
      .get();
    
    const dailyLogs = [];
    logsSnapshot.forEach(doc => dailyLogs.push(doc.data()));
    
    // Get all weekly checkins
    const checkinsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('weekly_checkins')
      .orderBy('date', 'asc')
      .get();
    
    const weeklyCheckins = [];
    checkinsSnapshot.forEach(doc => weeklyCheckins.push(doc.data()));
    
    // Get all chat messages
    const chatSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('chat_messages')
      .orderBy('timestamp', 'asc')
      .get();
    
    const chatMessages = [];
    chatSnapshot.forEach(doc => chatMessages.push(doc.data()));
    
    // Get user config
    const configDoc = await db
      .collection('users')
      .doc(userId)
      .collection('config')
      .doc('settings')
      .get();
    
    const config = configDoc.exists ? configDoc.data() : {};
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      config,
      dailyLogs,
      weeklyCheckins,
      chatMessages
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="grounded-export.json"',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportData, null, 2)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
