const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        next();
    } catch {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// alias — some routes use 'authenticate'
const authenticate = verifyToken;

const isAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    res.status(403).json({ message: 'Admin access required.' });
};

const isManagerOrAdmin = (req, res, next) => {
    if (['admin', 'manager'].includes(req.user?.role)) return next();
    res.status(403).json({ message: 'Manager or Admin access required.' });
};

const requireRole = (roles) => (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    res.status(403).json({ message: `Access restricted to: ${roles.join(', ')}` });
};

module.exports = { verifyToken, authenticate, isAdmin, isManagerOrAdmin, requireRole };
