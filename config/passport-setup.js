const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const knex = require('../knexfile');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (_accessToken, _refreshToken, profile, done) => {
  try {
    let user = await knex('users').where({ googleId: profile.id }).first();
    if (user) {
      done(null, user);
    } else {
      const newUser = {
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        avatar_url: profile.photos[0].value,
      };
      const [userId] = await knex('users').insert(newUser).returning('id');
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
    knex('users')
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
