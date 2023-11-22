const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

async function findOrCreateUser({ id, displayName, emails }, refreshToken) {
  let user = await User.findOne({ where: { googleId: id } });

  if (!user) {
    user = await User.create({
      googleId: id,
      email: emails[0].value,
      username: displayName,
      refreshToken: refreshToken
    });
  } else {
    user.refreshToken = refreshToken;
    await user.save();
  }

  return user;
}

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, refreshToken);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
