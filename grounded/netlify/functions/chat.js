const { getDb, getUserId } = require('./firebase-init');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

exports.handler = async (event, context) => {
  try {
    const userId = getUserId(event);
    const db = getDb();
    
    if (event.httpMethod === 'POST') {
      // Send message and get Coach response
      const body = JSON.parse(event.body);
      const { message, mode } = body; // mode: 'analyze' or 'chat'
      
      if (!message) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Message required' }) };
      }
      
      // Get past 7 days of daily logs
      const logsSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('daily_logs')
        .orderBy('date', 'desc')
        .limit(7)
        .get();
      
      const logs = [];
      logsSnapshot.forEach(doc => logs.push(doc.data()));
      
      // Get chat history (last 10 messages)
      const chatSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('chat_messages')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      const chatHistory = [];
      chatSnapshot.forEach(doc => chatHistory.push(doc.data()));
      chatHistory.reverse(); // Oldest first
      
      // Build the system prompt
      const systemPrompt = `You are Stephanie's personal fitness coach. She's 37, working toward losing 20 lbs (from 250 lbs to 230 lbs) by November 6, 2026. She's ambitious, direct, and authentic. No fluff.

Her goals:
- 230 lbs by Nov 6 (20 lbs total)
- 3 strength workouts per week (Workout A, B, C)
- 4 walking sessions per week (20-30 min)
- Complete a 5K
- Complete an adventure race
- Achieve one unassisted pull-up

She also:
- Coaches others (Simply Steph brand)
- Works at EZRA (Senior Product Lead)
- Recently married, moved to Stoney Creek, ON
- Values: Legacy, Authenticity, Ambition, Faith
- Does Zumba Saturdays, dragonboats Wednesdays
- Runs Balance & Breathe accountability program June-Aug

Be warm but direct. Push back when needed. Celebrate wins. Help her troubleshoot obstacles.`;
      
      // Build weekly summary if analyzing
      let contextMessage = '';
      if (mode === 'analyze' || message.toLowerCase().includes('analyze') || message.toLowerCase().includes('week')) {
        const summary = aggregateWeekData(logs);
        contextMessage = `\n\nHER WEEK'S DATA:\n${summary}`;
      }
      
      // Build conversation history for Claude
      const messages = [];
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
      messages.push({
        role: 'user',
        content: message + contextMessage
      });
      
      // Call Claude API
      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 500,
        system: systemPrompt,
        messages
      });
      
      const coachMessage = response.content[0].text;
      
      // Save user message
      await db
        .collection('users')
        .doc(userId)
        .collection('chat_messages')
        .add({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });
      
      // Save coach response
      await db
        .collection('users')
        .doc(userId)
        .collection('chat_messages')
        .add({
          role: 'assistant',
          content: coachMessage,
          timestamp: new Date().toISOString()
        });
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: coachMessage,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    if (event.httpMethod === 'GET') {
      // Get chat history
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('chat_messages')
        .orderBy('timestamp', 'asc')
        .get();
      
      const messages = [];
      snapshot.forEach(doc => messages.push(doc.data()));
      
      return {
        statusCode: 200,
        body: JSON.stringify({ messages })
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

function aggregateWeekData(logs) {
  let workoutA = 0, workoutB = 0, workoutC = 0, zumba = 0, walkingDays = 0;
  
  logs.forEach(log => {
    if (log.workoutA) workoutA++;
    if (log.workoutB) workoutB++;
    if (log.workoutC) workoutC++;
    if (log.zumba) zumba++;
    if (log.walking) walkingDays++;
  });
  
  const totalWorkouts = workoutA + workoutB + workoutC + zumba;
  
  return `
Logged days: ${logs.length}/7
Workouts: A=${workoutA}, B=${workoutB}, C=${workoutC}, Zumba=${zumba} (target: 3/week minimum)
Walking: ${walkingDays} days (target: 4/week)
Total strength sessions: ${totalWorkouts}
`;
}
