const connectDB = require('./helpers/db');
const User = require('./helpers/User');
const Session = require('./helpers/Session');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    await connectDB();
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(200).json({ valid: false, reason: "invalid_token" });
    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(200).json({ valid: false, reason: "invalid_token" });
    }
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(200).json({ valid: false, reason: "user_not_found" });

    // Optional constraint to block favoriting if banned/expired, but generally standard API defense
    if (user.isBanned) return res.status(200).json({ valid: false, reason: "banned" });

    // Verify session
    const session = await Session.findOne({ token, userId: user._id });
    if (!session || !session.isActive) {
        return res.status(200).json({ valid: false, reason: "session_killed" });
    }

    const { favorites } = req.body;
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ error: "favorites_must_be_array" });
    }

    // Overwrite the user's favorites array
    user.favorites = favorites;
    await user.save();

    return res.status(200).json({ success: true, favorites: user.favorites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
};
