const connectDB = require('./helpers/db');
const Session = require('./helpers/Session');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    await connectDB();
    const body = req.body || {};
    const token = body.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(200).json({ message: 'Logged out' });
    
    const session = await Session.findOne({ token });
    if (session) {
        session.isActive = false;
        await session.save();
    }
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
};
