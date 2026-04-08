const passport = require("passport");

const authenticate = passport.authenticate("jwt", { session: false });

const requireAuth = (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Authentication error",
      });
    }
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
    next();
  });
};

module.exports = {
  requireAuth,
};
