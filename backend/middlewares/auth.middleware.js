const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided!" }); // ✅ Matching test case expectation
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized!" }); // ✅ Matching test case expectation
    }

  
    
    req.user = { id: decoded.id, role: decoded.role }; // Store user details in req.user
    next();
  });
};

// Middleware to check if the user is an admin
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admins only!" });
  }
  next();
};
