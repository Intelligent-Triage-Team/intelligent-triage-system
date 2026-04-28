const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // ✅ FIX HERE
  let token;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // new format
  } else {
    token = authHeader; // old format
  }

  jwt.verify(token, "mysecretkey", (err, user) => {

    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();

  });

}

module.exports = authenticateToken;