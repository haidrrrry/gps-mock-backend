const jwt = require('jsonwebtoken');

function adminMiddleware(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return false;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (decoded.role === 'admin') return true;
        res.status(403).json({ message: 'Not an admin' });
        return false;
    } catch (err) {
        res.status(401).json({ message: 'Invalid admin token' });
        return false;
    }
}

module.exports = adminMiddleware;
