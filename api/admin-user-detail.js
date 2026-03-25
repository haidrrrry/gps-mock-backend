const connectDB = require('./helpers/db');
const User = require('./helpers/User');
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
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id param' });

    if (req.method === 'GET') {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      const sessions = await Session.find({ userId: id }).sort({ loggedInAt: -1 });
      return res.status(200).json({ user, sessions });
    } else if (req.method === 'DELETE') {
      await User.findByIdAndDelete(id);
      await Session.deleteMany({ userId: id });
      return res.status(200).json({ message: 'User deleted' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
