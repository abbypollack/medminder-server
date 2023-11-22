require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const Sequelize = require('sequelize');

require('./config/passport-setup');

// Importing routes
const drugInteractionRoutes = require('./routes/drugInteractionRoutes');
const authRoutes = require('./routes/authRoutes');

const { verifyToken } = require('./middlewares/authMiddleware'); 

const app = express();
const PORT = process.env.PORT || 5000;

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/drug', drugInteractionRoutes);

app.get('/protected', verifyToken, (req, res) => {
  const authToken = req.cookies.authToken;
  res.json({ message: 'Protected route', user: req.user });
  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    sequelize.sync({ force: false })
      .then(() => {
        console.log('Database & tables created!');
      });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
