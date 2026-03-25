const connectDB = require('./helpers/db');
const User = require('./helpers/User');
const adminMiddleware = require('./helpers/adminMiddleware');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!adminMiddleware(req, res)) return;

  try {
    await connectDB();
    if (req.method === 'GET') {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json(users);
    } else if (req.method === 'POST') {
      const { email, password, deviceLimit, subscriptionDays } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      let subscriptionExpiry = null;
      if (subscriptionDays) {
          subscriptionExpiry = new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000);
      }
      const user = new User({ email, password: hashedPassword, deviceLimit, subscriptionExpiry });
      await user.save();
      return res.status(201).json({ message: 'User created' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
