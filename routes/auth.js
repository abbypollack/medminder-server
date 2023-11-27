const express = require('express');
const router = express.Router();

const passport = require('passport');

// Google authentication endpoint
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google auth callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
}), (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/profile`);
}
);

// Facebook authentication endpoint
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email','public_profile']
}));

// Facebook auth callback
router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
}), (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/profile`);;
  }
);

// Logout endpoint
router.get('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      return res.status(500).json({ message: "Server error. Please try again later", error: error });
    }
    res.redirect(process.env.CLIENT_URL);
  });
});

router.get('/profile', (req, res) => {
  if (req.user === undefined) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.status(200).json(req.user);
});

module.exports = router;
