const connectDB = require('./helpers/db');
const Session = require('./helpers/Session');
const adminMiddleware = require('./helpers/adminMiddleware');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!adminMiddleware(req, res)) return;

  try {
    await connectDB();
    const { userId, sessionId } = req.query;

    if (req.method === 'GET') {
      if (!userId) return res.status(400).json({ error: 'Missing userId param' });
      const sessions = await Session.find({ userId }).sort({ loggedInAt: -1 });
      return res.status(200).json(sessions);
    } else if (req.method === 'DELETE') {
      if (!sessionId) return res.status(400).json({ error: 'Missing sessionId param' });
      await Session.findByIdAndUpdate(sessionId, { isActive: false });
      return res.status(200).json({ message: 'Session killed' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
