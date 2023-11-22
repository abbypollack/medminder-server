const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/profile');
  }
);
router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logout successful' });
  });

router.post('/signup', authController.register);
router.post('/login', authController.login);

module.exports = router;
