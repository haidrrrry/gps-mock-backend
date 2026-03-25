const jwt = require('jsonwebtoken');
const User = require('./User');
const Session = require('./Session');

async function authMiddleware(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return null;
        }
        
        // Also verify session is active
        const session = await Session.findOne({ token, userId: user._id });
        if (!session || !session.isActive) {
            res.status(401).json({ message: 'Session is killed or invalid' });
            return null;
        }
        
        return user;
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
        return null;
    }
}

module.exports = authMiddleware;
