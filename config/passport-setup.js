const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const knex = require('../knexfile');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (_accessToken, _refreshToken, profile, done) => {
    console.log('Google profile:', profile);

    knex('users')
      .select('id')
      .where({ googleId: profile.id })
      .then(users => {
        if (users.length) {
          done(null, users[0]);
        } else {
          knex('users')
            .insert({
              googleId: profile.id,
              avatar_url: profile.photos[0].value,
              username: profile.displayName
            })
            .returning('id')
            .then(userId => {
              done(null, { id: userId[0] });
            })
            .catch(err => {
              console.log('Error creating a user', err);
            });
        }
      })
      .catch(err => {
        console.log('Error fetching a user', err);
      });
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
