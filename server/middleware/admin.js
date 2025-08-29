const adminMiddleware = (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // For now, allow all authenticated users (replace with actual role check)
    // TODO: Implement proper role-based access control
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = adminMiddleware;
