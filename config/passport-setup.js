const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const knex = require('knex');
const knexConfig = require('../knexfile');
const db = knex(knexConfig);

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      let fullName = profile.displayName.split(' ');
      let firstName = fullName[0];
      let lastName = fullName.length > 1 ? fullName.slice(1).join(' ') : '';
      let user = await db('users').where({ googleId: profile.id }).first();
      if (user) {
        done(null, user);
      } else {
        const newUser = {
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName,
          lastName,
        };
        const [userId] = await db('users').insert(newUser).returning('id');
        done(null, { id: userId, ...newUser });
      }
    } catch (err) {
      console.error('Error in Google Strategy', err);
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('serializeUser (user object):', user);
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  console.log('deserializeUser (user id):', userId);
  db('users')
    .where({ id: userId })
    .first()
    .then(user => {
      console.log('req.user:', user);

      done(null, user);
    })
    .catch(err => {
      console.log('Error finding user', err);
      done(err, null);
    });
});


module.exports = passport;
