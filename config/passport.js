const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { getDB } = require("./db");
const { ObjectId } = require("mongodb");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || "your-secret-key",
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const db = getDB();
      const user = await db.collection("users").findOne({
        _id: new ObjectId(payload.userId),
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }),
);

module.exports = passport;
