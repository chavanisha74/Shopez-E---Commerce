const requireAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrative privileges are required for this action.'
  });
};

module.exports = { requireAdmin };
