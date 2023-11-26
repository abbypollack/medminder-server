require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport-setup');

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const drugInteractionRoutes = require('./routes/drugInteraction');
app.use('/api/drug', drugInteractionRoutes);

const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

const medicationRoutes = require('./routes/medications');
app.use('/api/medications', medicationRoutes);


// ...
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));