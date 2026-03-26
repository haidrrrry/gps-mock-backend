const connectDB = require('./helpers/db');
const User = require('./helpers/User');
const Session = require('./helpers/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    await connectDB();
    const body = req.body || {};
    const email = String(body.email || '');
    const password = String(body.password || '');
    const deviceId = String(body.deviceId || '');
    const deviceName = String(body.deviceName || '');
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'not_found' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'wrong_password' });
    
    if (user.isBanned) return res.status(403).json({ error: "banned" });
    
    if (user.subscriptionExpiry && Date.now() > new Date(user.subscriptionExpiry).getTime()) {
        return res.status(403).json({ error: "expired" });
    }
    
    // DEVICE SLOT LOGIC:
    // - Each user starts with a limit (e.g. 3 slots).
    // - Every login attempt on ANY device (A, B, C, or switching back) costs 1 slot.
    // - All other active sessions are killed (only 1 concurrent session at a time).
    // - When limit reaches 0, the user CANNOT login anywhere until admin grants more slots.
    // - Admin can increase the limit at any time via the admin panel.
    //
    // Example flow (starting limit = 3):
    //   Login Device B  → kills Device A session → limit = 2
    //   Login Device A  → kills Device B session → limit = 1
    //   Login Device C  → kills Device A session → limit = 0
    //   Login Device A  → BLOCKED (limit = 0), must contact admin

    // Check if user has any login slots left
    if (user.deviceLimit <= 0) {
        return res.status(403).json({ 
           error: "device_limit_reached", 
           message: "Your login limit has been reached. Please contact your administrator to increase your limit." 
        });
    }

    // Invalidate ALL previous sessions (only one active session at a time)
    await Session.updateMany(
        { userId: user._id },
        { $set: { isActive: false } }
    );

    // Consume one slot from the limit for every login attempt (even switching back to an old device)
    await User.updateOne({ _id: user._id }, { $inc: { deviceLimit: -1 } });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    let session = await Session.findOne({ userId: user._id, deviceId });
    if (session) {
        session.token = token;
        session.isActive = true;
        session.loggedInAt = Date.now();
        session.deviceName = deviceName;
        await session.save();
    } else {
        session = new Session({
            userId: user._id,
            deviceId,
            deviceName,
            token,
            isActive: true
        });
        await session.save();
    }
    
    return res.status(200).json({ 
      token, 
      subscriptionExpiry: user.subscriptionExpiry,
      favorites: user.favorites || []
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
};
