const connectDB = require('./helpers/db');
const User = require('./helpers/User');
const adminMiddleware = require('./helpers/adminMiddleware');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!adminMiddleware(req, res)) return;

  try {
    await connectDB();
    if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });
    const { id } = req.query;
    const { days } = req.body;
    const subscriptionExpiry = new Date(Date.now() + days * 86400000);
    await User.findByIdAndUpdate(id, { subscriptionExpiry });
    return res.status(200).json({ message: 'Subscription updated', subscriptionExpiry });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
