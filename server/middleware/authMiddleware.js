import jwt from 'jsonwebtoken';

// 1. Verify User is Logged In
export const protect = async (req, res, next) => {
  try {
    // Read token from cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to the request object
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

// 2. Check User Role (RBAC)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role '${req.user?.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};