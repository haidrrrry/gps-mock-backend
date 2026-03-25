const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const email = String(req.body?.email || '');
  const password = String(req.body?.password || '');
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({ token });
  }
  return res.status(401).json({ message: 'Invalid admin credentials' });
};
