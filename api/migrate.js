const connectDB = require('./helpers/db');
const User = require('./helpers/User');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  try {
    await connectDB();
    
    const email = 'test@test.com';
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (user) {
      user.password = hashedPassword;
      user.deviceLimit = 10; // Give 10 slots for testing
      user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
      return res.status(200).json({ message: 'User updated in Vercel DB', email, limit: 10 });
    } else {
      user = new User({
        email,
        password: hashedPassword,
        deviceLimit: 10,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      await user.save();
      return res.status(200).json({ message: 'User created in Vercel DB', email, limit: 10 });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
